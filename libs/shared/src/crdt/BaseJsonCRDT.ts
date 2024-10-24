import cloneDeep from 'lodash/cloneDeep.js';
import get from 'lodash/get.js';
import has from 'lodash/has.js';
import isEmpty from 'lodash/isEmpty.js';
import { Clock } from './Clock.js';
import { iterateObjectPaths } from '../objectPaths.js';
import type { Diff } from './CRDT.js';
import isEqual from 'lodash/isEqual.js';
import unset from 'lodash/unset.js';
import {
    set,
    hasId,
    isPathToItemArrayIndex,
    isExistingAtomicValue,
    isDeleteOperator,
    isAtomic,
    getUpdateType,
    isActualObject,
    isEmptyObject,
    isEmptyArray,
    migrateTimestamps,
    itemArrayToObject,
    assertOneOf,
    removeNullsFromObject,
    setIdToArrayItems,
    itemArrayPathFromIndexPath,
    isPathToItemArrayAncestor,
    isPathToItemArray,
    pathArrayToString,
    generateRandomId,
    pathStringToArray,
    isObjectArray
} from './utils.js';
import {
    ItemArray,
    Timestamp,
    NewTimestamps,
    SerializedBaseJsonCRDT,
    ItemArrayObject,
    UpdateValueProps,
    DebugHistoryEntry,
    DebugHistoryMutation,
    DebugSnapshot,
    DebugLevel,
    ItemArrayObjectItem
} from './types.js';
import { TIMESTAMP_KEY } from './constants.js';

type ItemArrayDiff = Record<ItemArrayObjectItem['id'], object>;

/**
 * Calculate the diff between two item arrays. Item Arrays are arrays of objects with a unique ID property.
 * Thereby, items of the source array can be matched with items of the target array by their ID, which allows merging updates and deletions.
 * @param sourceArray The source array
 * @param targetArray The target array
 * @returns The diff object that represents the changes that are required to be performed to get from the source to the target array.
 */
function calculateItemArrayDiff(sourceMaybeArray: unknown, targetArray: object[]): ItemArrayDiff {
    const sourceArray = Array.isArray(sourceMaybeArray) ? sourceMaybeArray : [];

    const sourceItems: Map<ItemArrayObjectItem['id'], ItemArrayObjectItem> = new Map(
        sourceArray.filter(hasId).map((item, index) => [
            item.id,
            {
                ...item,
                _index: index // calculate index so that we can compare whether or not the position has changed
            }
        ])
    );

    const diff: ItemArrayDiff = {};

    for (let i = 0; i < targetArray.length; i++) {
        const targetItemRaw = targetArray[i];

        // Ignore non-object items
        if (!isActualObject(targetItemRaw)) {
            continue;
        }

        const targetItem: ItemArrayObjectItem = {
            ...targetItemRaw,
            // Generate a random ID if the item does not have one.
            id: hasId(targetItemRaw) ? targetItemRaw.id : generateRandomId(),
            // Already create updated _index so that updates are calculated as part of objectDiff
            _index: i
        };

        // Array item is new
        if (!sourceItems.has(targetItem.id)) {
            diff[targetItem.id] = targetItem;
            continue;
        }
        const sourceItem = sourceItems.get(targetItem.id);

        // Remove from source items so that we can check for deleted items later
        sourceItems.delete(targetItem.id);

        const itemDiff = BaseJsonCRDT.calculateDiff(sourceItem || {}, targetItem);
        if (!isEmpty(itemDiff)) {
            diff[targetItem.id] = itemDiff;
        }
    }

    // All items remaining in source items can be seen as deleted
    for (const [id] of sourceItems) {
        // Items are deleted by setting _index to null
        diff[id] = {
            _index: null
        };
    }

    return diff;
}

/**
 * CRDT implementation using a single counter to track updates.
 * It only has one update method which takes a data diff and an associated timestamp.
 * The user has to keep track of the counter themselves, outside of this class.
 */
export class BaseJsonCRDT<O extends object = object> {
    static calculateDiff(
        oldData: object,
        newData: object,
        options?: {
            allowedKeys?: null | Set<string>;
            ignorePaths?: null | Set<string>;
            pathsToItemArrays?: string[] | Set<string>;
        }
    ): Record<string, unknown> {
        const allowedKeys = options?.allowedKeys ?? null;
        const ignorePaths = options?.ignorePaths ?? null;
        const pathsToItemArrays =
            options?.pathsToItemArrays instanceof Set
                ? options.pathsToItemArrays
                : new Set(options?.pathsToItemArrays ?? []);
        const diff = {};

        // Handle updates from the new data.
        iterateObjectPaths(newData, (path, newValue) => {
            const pathString = pathArrayToString(path);

            if (ignorePaths && ignorePaths.has(pathString)) {
                // Path should be ignored.
                return;
            }

            const oldValue = get(oldData, path);

            if (isEqual(newValue, oldValue)) {
                // Value did not change.
                return;
            }

            if (allowedKeys && !allowedKeys.has(path[0])) {
                // Root key of the path is allowed.
                return;
            }

            const isNewInsert = !has(oldData, path);
            if (isDeleteOperator(newValue) && isNewInsert) {
                // Delete order on non-existing value is redundant.
                return;
            }

            // Handle item arrays
            if (pathsToItemArrays.has(pathString)) {
                if (!Array.isArray(newValue)) {
                    // Item arrays cannot be updated directly with non-array values, so we just ignore the change.
                    return;
                }

                newValue = calculateItemArrayDiff(oldValue, newValue);
                // If array diff is empty don't set anything
                if (isEmpty(newValue)) {
                    return;
                }
            }

            if (oldValue instanceof Date !== newValue instanceof Date) {
                // We don't care about Date <-> string conversion if their values are the same.
                if (
                    new Date(oldValue).getTime() ===
                    new Date(newValue as string | number | Date).getTime()
                ) {
                    return;
                }
            }

            set(diff, path, newValue);
        });

        // This map keeps track of ancestors that were deleted in the new data.
        // We want to delete these ancestors in the diff by setting them to null.
        // However, in case the ancestor contains a nested item array,
        // we cannot just set it to null, because that would delete the item array.
        // And we don't want to delete item arrays, so that we keep track of which item array elements have been deleted before.
        // Therefore, we only set the ancestor to null if it does not contain nested item arrays.
        // If it does, we explicitly delete each child of the ancestor and each element of the item array instead.
        // Note: we use a Map and not a Set to ensure that we use the correct path if a path element contains '.' characters.
        const ancestorPaths = new Map<string, string[]>();

        // Handle deletes of old data that are not present in the new data.
        iterateObjectPaths(oldData, (path, oldValue) => {
            const pathString = pathArrayToString(path);

            if (ignorePaths && ignorePaths.has(pathString)) {
                // Path should be ignored.
                return;
            }

            if (has(newData, path)) {
                // Path is present in the new data, so we don't need to delete it.
                return;
            }

            let closestNewValue = null;
            let ancestorPath = [...path];
            const poppedParts: string[] = [];

            // Find the closest ancestor with a value in the new data.
            while (ancestorPath.length > 0 && isDeleteOperator(closestNewValue)) {
                closestNewValue = get(newData, ancestorPath);

                // Only manipulate the path if we didn't find a value.
                if (isDeleteOperator(closestNewValue)) {
                    poppedParts.unshift(ancestorPath.pop() as string);
                }
            }

            // Ensure the path is not empty.
            if (!ancestorPath.length) {
                ancestorPath = [poppedParts[0]];
            }

            const ancestorWasDeleted = closestNewValue === undefined;

            // Handle item arrays.
            if (pathsToItemArrays.has(pathString)) {
                const itemArrayDiff = calculateItemArrayDiff(oldValue, []);

                if (!isEmpty(itemArrayDiff)) {
                    // `oldValue` is an item array which has been deleted.
                    // Since item arrays cannot be deleted, we update the diff to contain explicit deletes of each item
                    // contained in the item array at that point.
                    set(diff, path, itemArrayDiff);
                }

                // Since the item array cannot be fully deleted, we update `newData` to reflect that:
                // After applying the diff, the item array would be empty.
                // Hence, we set the path at `newData` to an empty array.
                // This is required so that the ancestor is not deleted in further iterations.
                // This always needs to happen regardless of the item array diff.
                set(newData, path, []);

                // We now know that the ancestor possibly marked for deletion cannot be deleted
                // because it contains an item array. We therefore remove it from the `ancestorPaths` map.
                ancestorPaths.delete(pathArrayToString(ancestorPath));
            }
            // Mark the ancestor for deletion if it was deleted in the new data and set the child to null.
            // The ancestor will only be fully deleted if it does not contain a nested item array.
            else if (ancestorWasDeleted) {
                set(diff, path, null);
                ancestorPaths.set(pathArrayToString(ancestorPath), ancestorPath);
            }
            // Simply delete the path if the ancestor was not deleted.
            else if (isActualObject(closestNewValue)) {
                set(diff, path, null);
            }
        });

        // Delete ancestors that were deleted in the new data and do not contain nested item arrays.
        ancestorPaths.forEach(path => {
            set(diff, path, null);
        });

        return diff;
    }

    private dataObj: O;
    private timestampObj: NewTimestamps<O>;

    public pathsToItemArrays = new Set<string>();

    static fromSerialized<T extends object>(
        serialized: SerializedBaseJsonCRDT<T>
    ): BaseJsonCRDT<T> {
        return new BaseJsonCRDT(serialized);
    }

    /**
     * Constructs a new CRDT instance with the given data and optional timestamps.
     * @param data The initial data object
     * @param timestamps The initial timestamp object, if not provided it will be inferred from the data
     * @returns A new CRDT instance
     */
    constructor({
        data,
        timestamps,
        pathsToItemArrays
    }: {
        data: O;
        timestamps?: NewTimestamps<O>;
        pathsToItemArrays?: string[];
    }) {
        if (!timestamps) {
            // case where we are initializing from scratch
            this.timestampObj = {} as NewTimestamps<O>;
            if (pathsToItemArrays) {
                this.pathsToItemArrays = new Set(pathsToItemArrays);
            }
            this.dataObj = this._initData(data);
            return;
        }
        if (!pathsToItemArrays) {
            throw new Error(
                'Both timestamps and pathsToItemArrays must be provided for re-initialization'
            );
        }

        // TODO: Remove this migration once all existing CRDT instances stored in Redis have been updated to use the new timestamp format.
        // This will be 1 month (CRDT_STORAGE_DURATION) after this code has gone live.
        this.timestampObj = migrateTimestamps(timestamps);
        this.dataObj = data; // data is already in the correct format in this case
        this.pathsToItemArrays = new Set(pathsToItemArrays);
    }

    /**
     * Converts raw data to an object representation for item arrays
     * @param obj the object to convert
     * @returns data: data with item array representation objects
     */
    _initData(data: O) {
        data = removeNullsFromObject(cloneDeep(data));

        this.pathsToItemArrays.forEach(path => {
            const value = get(data, path);
            if (value) {
                if (Array.isArray(value)) {
                    if (!isObjectArray(value)) {
                        throw new Error(
                            `Path ${path} is set as item array but is a non-object array: (${value})`
                        );
                    }
                    set(data, pathStringToArray(path), itemArrayToObject(setIdToArrayItems(value)));
                } else {
                    throw new Error(
                        `Path ${path} is set as item array but is neither array nor undefined but ${typeof value} (${value})`
                    );
                }
            } else {
                // If the item array does not exist in the data yet, we create it (or rather its object representation)
                set(data, pathStringToArray(path), {});
            }
        });
        return data;
    }

    _setTimestamp(path: string[], timestamp: Timestamp) {
        set(this.timestampObj, [...path, TIMESTAMP_KEY], timestamp);
    }

    _getTimestamps(path: string[] | string) {
        return get(this.timestampObj, path);
    }

    _getTimestamp(path: string[] | string): Timestamp {
        return this._getTimestamps(path)?.[TIMESTAMP_KEY];
    }

    _getClock(path: string[] | string): Clock {
        return new Clock(this._getTimestamp(path));
    }

    _isPathToItemArray(path: string[]) {
        return this.pathsToItemArrays.has(path.join('.'));
    }

    _setInternalDataValue(path: string[], value: unknown, timestamp: Timestamp) {
        set(this.dataObj, path, value);
        // Right now, we need to keep null values in the internal CRDT data object to prevent issues with partial deletes.
        // if (isDeleteOperator(value)) {
        //     unset(this.dataObj, path);
        // }
        this._setTimestamp(path, timestamp);
    }

    _updateExistingAtomicValue({
        path,
        newValue,
        currentValue,
        newTimestamp,
        debugHistoryEntry
    }: UpdateValueProps) {
        assertOneOf(currentValue, [isExistingAtomicValue]);
        assertOneOf(newValue, [isDeleteOperator, isAtomic, isEmptyObject]);

        const currentTimestamp = this._getClock(path);
        const reject = !currentTimestamp.isOlderThan(newTimestamp);

        this.#debugLogMutation(debugHistoryEntry, {
            rejected: reject,
            method: `updateExistingAtomicValue:${getUpdateType(newValue)}`,
            path,
            values: { current: currentValue, update: newValue },
            timestamps: { current: currentTimestamp.timestamp, update: newTimestamp }
        });
        if (reject) return;

        this._setInternalDataValue(path, newValue, newTimestamp);
    }

    _updateItemArrayIndex({
        path,
        newValue,
        currentValue,
        newTimestamp,
        debugHistoryEntry
    }: UpdateValueProps) {
        assertOneOf(path, [isPathToItemArrayIndex]);

        const currentClock = this._getClock(path);

        // Delete item
        if (isDeleteOperator(newValue)) {
            this.#debugLogMutation(debugHistoryEntry, {
                rejected: false,
                method: 'updateItemArrayIndex',
                path,
                values: { current: currentValue, update: newValue },
                timestamps: { current: currentClock.timestamp, update: newTimestamp }
            });
            set(this.dataObj, path, null); // we don't delete the item in this case but keep the null value, so we can't use _setInternalDataValue
            this._setTimestamp(path, newTimestamp);
            return;
        }

        // Never change a deleted _index value...
        if (currentValue === null) {
            // ... but update the timestamp if necessary
            if (currentClock.isOlderThan(newTimestamp)) {
                this._setTimestamp(path, newTimestamp);
            }
            return;
        }

        // Check timestamp
        const reject = !currentClock.isOlderThan(newTimestamp);

        // Upsert
        if (typeof newValue === 'number') {
            this.#debugLogMutation(debugHistoryEntry, {
                rejected: reject,
                method: 'updateItemArrayIndex',
                path,
                values: { current: currentValue, update: newValue },
                timestamps: { current: currentClock.timestamp, update: newTimestamp }
            });
            if (reject) return;

            this._setInternalDataValue(path, newValue, newTimestamp);
            return;
        }

        throw new Error('Unhandled newValue type!');
    }

    _insertNewValue({
        path,
        newValue,
        currentValue,
        newTimestamp,
        debugHistoryEntry
    }: UpdateValueProps) {
        assertOneOf(currentValue, [(value: unknown) => value === undefined]);
        assertOneOf(newValue, [isDeleteOperator, isAtomic, isEmptyObject]);

        const searchPath = [...path];
        let clock = new Clock();

        // Find the closest ancestor with a timestamp, if any.
        while (searchPath.length > 0) {
            const ancestorClock = this._getClock(searchPath);
            if (ancestorClock.isNewerThan(clock)) {
                clock = ancestorClock;
            }
            searchPath.pop();
        }

        const reject = !clock.isOlderThan(newTimestamp);

        this.#debugLogMutation(debugHistoryEntry, {
            rejected: reject,
            method: `insertNewValue:${getUpdateType(newValue)}`,
            path,
            values: { current: currentValue, update: newValue },
            timestamps: {
                current: clock.timestamp,
                update: newTimestamp
            }
        });
        if (reject) return;

        this._setInternalDataValue(path, newValue, newTimestamp);
    }

    /**
     * Deletes all children of the given path that are older than the new timestamp.
     * Keeps the children that are newer than the new timestamp.
     * @returns The maximum timestamp of all children.
     */
    _partialDelete({ path, newTimestamp }: { path: string[]; newTimestamp: Timestamp }): {
        maxTimestamp: Clock;
    } {
        let maxTimestamp = new Clock(0);
        const descendantPathsToDelete: string[][] = [];

        const currentValues = get(this.dataObj, path);

        iterateObjectPaths(currentValues, childPath => {
            const fullPath = [...path, ...childPath];

            const childTimestamp = Clock.max(this._getTimestamps(fullPath) ?? {});

            if (childTimestamp.isNewerThan(maxTimestamp)) {
                maxTimestamp = childTimestamp;
            }

            // delete all children that are older than the new timestamp
            if (childTimestamp.isOlderThan(newTimestamp)) {
                descendantPathsToDelete.push(fullPath);
                unset(this.dataObj, fullPath);
                this._setTimestamp(fullPath, newTimestamp);
            }
        });

        const deletedPaths = new Set<string>();
        Array.from(descendantPathsToDelete).forEach(fullPath => {
            const tempPath = fullPath.slice(0, -1);
            while (tempPath.length > path.length) {
                const stringPath = tempPath.join('.');

                // If we already deleted this path, we don't need to check it again.
                if (deletedPaths.has(stringPath)) {
                    break;
                }

                // Delete the path if it's an empty object.
                const currentValue = get(this.dataObj, tempPath);
                if (isEmptyObject(currentValue)) {
                    const currentTimestamp = this._getClock(tempPath);
                    if (!currentTimestamp.isNewerThan(newTimestamp)) {
                        deletedPaths.add(stringPath);
                        unset(this.dataObj, tempPath);
                        this._setTimestamp(tempPath, newTimestamp);
                    }
                } else {
                    // If the path is not an empty object, we don't need to check any higher paths.
                    break;
                }
                tempPath.pop();
            }
        });
        return {
            maxTimestamp
        };
    }

    _updateObject({
        path,
        newValue,
        currentValue,
        newTimestamp,
        debugHistoryEntry
    }: UpdateValueProps) {
        assertOneOf(currentValue, [isActualObject]);
        assertOneOf(newValue, [isDeleteOperator, isAtomic, isEmptyObject]);

        const timestampsObject = this._getTimestamps(path);
        const selfTimestamp = this._getClock(path);
        const maxClock = Clock.max(timestampsObject ?? {});

        const reject = !maxClock.isOlderThan(newTimestamp);

        this.#debugLogMutation(debugHistoryEntry, {
            rejected: reject,
            method: `updateObject:${getUpdateType(newValue)}`,
            path,
            values: { current: currentValue, update: newValue },
            timestamps: { current: maxClock.timestamp, update: newTimestamp }
        });

        // We always need to perform the partial delete, even if we are going to reject the update.
        // This is nessessary because otherwise we would keep descendants that are older than the new timestamp which other CRDT instances might have deleted.
        this._partialDelete({
            path,
            newTimestamp
        });

        // Even if we reject the update because of a descendant timestamp,
        // we still need to update the timestamp of the object itself if the new timestamp is newer.
        if (selfTimestamp.isOlderThan(newTimestamp)) {
            this._setTimestamp(path, newTimestamp);
        }

        if (reject) return;
        this._setInternalDataValue(path, newValue, newTimestamp);
    }

    /**
     * Upserts a value in the data object if the timestamp is higher than the current timestamp.
     * @param path path to the value in the data object
     * @param value the value to upsert
     * @param timestamp the timestamp assosciated with the value
     */
    _updateValue(
        path: string[],
        newValue: unknown,
        newTimestamp: Timestamp,
        debugHistoryEntry: DebugHistoryEntry | null = null
    ) {
        const currentValue = get(this.dataObj, path);

        const props = { path, newValue, newTimestamp, currentValue, debugHistoryEntry };

        if (isPathToItemArrayAncestor(this.pathsToItemArrays, path)) {
            throw new Error(
                `Path ${path.join(
                    '.'
                )} is an ancestor of an item array and cannot be updated directly`
            );
        }
        if (isPathToItemArray(this.pathsToItemArrays, path)) {
            if (!isEmptyArray(newValue)) {
                throw new Error(
                    `Path ${path.join(
                        '.'
                    )} is an item array and cannot be updated directly with ${newValue}`
                );
            }
            if (currentValue === undefined) {
                // Item array does not exist in the data yet, so we create it
                this._setInternalDataValue(path, {}, newTimestamp);
            }
            return;
        }

        // Current path leads to an item array index (e.g. 'a.b._index')
        if (isPathToItemArrayIndex(path)) {
            const itemArrayPath = itemArrayPathFromIndexPath(path);
            if (!this._isPathToItemArray(itemArrayPath)) {
                throw new Error(`Item array created at illegal path: '${itemArrayPath}'`);
            }
            this._updateItemArrayIndex(props);
            return;
        }

        // Current path has an atomic value.
        if (isExistingAtomicValue(currentValue)) {
            this._updateExistingAtomicValue(props);
            return;
        }

        // Current path does not have a value/does not exist.
        // Could either be an insert or a nested replacement of an atomic value.
        if (currentValue === undefined) {
            this._insertNewValue(props);
            return;
        }

        // Current path leads to an object.
        if (isActualObject(currentValue)) {
            this._updateObject(props);
            return;
        }

        throw new Error('Unhandled update case!');
    }

    /**
     * Updates the CRDT with the given data diff and timestamp.
     * @param diff The data diff to apply
     * @param timestampOrClock The timestamp or clock associated with the data diff
     */
    public update(diff: Diff<object>, timestampOrClock: Clock | Timestamp) {
        const newTimestamp =
            timestampOrClock instanceof Clock ? timestampOrClock.timestamp : timestampOrClock;

        const debugHistoryEntry = this.#debugMakeHistoryEntry(diff, newTimestamp);

        iterateObjectPaths(diff, (path, newValue) => {
            try {
                this._updateValue(path, cloneDeep(newValue), newTimestamp, debugHistoryEntry);

                this.#debugAddMutationState(debugHistoryEntry);
            } catch (e) {
                const currentValue = get(this.dataObj, path);
                console.error('Error while updating CRDT', {
                    path,
                    currentValue,
                    newValue,
                    currentTimestamp: this._getTimestamp(path),
                    newTimestamp,
                    pathsToItemArrays: this.pathsToItemArrays
                });
                throw e;
            }
        });

        this.#debugLogHistoryEntry(debugHistoryEntry);
    }

    /**
     * Converts internal object representation of an item array back to an item array
     * Opposite function to itemArrayToObject
     * @param obj the object to convert
     * @returns item array
     */
    private _objectToItemArray(obj: ItemArrayObject, path: string): ItemArray {
        return Object.values(obj)
            .filter(item => item._index !== null) // remove "deleted" items
            .sort((a, b) => {
                const comparison = a._index - b._index;
                if (comparison !== 0) return comparison;

                const pathArray = pathStringToArray(path);
                // use timestamps as tie-breaker for when two items were inserted in the same index
                const aTimestamp = this._getClock([...pathArray, a.id.toString(), '_index']);
                const bTimestamp = this._getClock([...pathArray, b.id.toString(), '_index']);
                return aTimestamp.isNewerThan(bTimestamp) ? -1 : 1;
            })
            .map(item => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { _index, ...arrayItem } = item;
                return arrayItem;
            });
    }

    public data(): O {
        const data = removeNullsFromObject(cloneDeep(this.dataObj));
        for (const path of this.pathsToItemArrays) {
            const itemArrayObject: ItemArrayObject | undefined = get(data, path);
            // handle case where the item array is not present
            if (!itemArrayObject) {
                continue;
            }
            const itemArray = this._objectToItemArray(itemArrayObject, path);
            // Individual keys of item array paths will never contain dots, so we can safely split by dots.
            set(data, path.split('.'), itemArray);
        }

        return data;
    }

    public serialize(): SerializedBaseJsonCRDT<O> {
        return {
            data: cloneDeep(this.dataObj),
            timestamps: this.timestamps(),
            pathsToItemArrays: Array.from(this.pathsToItemArrays)
        };
    }

    public timestamps(): NewTimestamps<O> {
        return cloneDeep(this.timestampObj);
    }

    /**
     * When set to `true` the CRDT logs applied and rejected updates/modifications of the CRDT.
     * These logs can then be used via `getDebugHistory()` or logged via `printDebugHistory()`.
     *
     * Enabling this results in a performance hit, so it should only be used for debugging purposes.
     * Should also be disabled during fuzzing, as it will result in a test timeout.
     */
    #debug = false;

    /**
     * The level of detail to log when debug mode is enabled.
     *
     * - `updates`: Logs only the updates that are applied to the CRDT.
     * - `mutations`: Logs all updates and individual applied/rejected modifications of the CRDT.
     * - `all`: Logs all updates, modifications, and the state of the CRDT after each mutation.
     *          WARNING: This results in a lot of data, which will severely impact performance and memory usage.
     */
    #debugLevel: DebugLevel = 'mutations';

    public setDebug(value: boolean | DebugLevel) {
        this.#debug = Boolean(value);

        if (typeof value === 'string') {
            this.#debugLevel = value;
        }

        if (value) {
            // Store the state of the CRDT when debug mode is enabled.
            this.#stateOnDebugStart = {
                data: this.data(),
                timestamps: this.timestamps()
            };
        } else {
            this.#stateOnDebugStart = {
                data: {},
                timestamps: {}
            };
        }
    }

    #stateOnDebugStart = {
        data: {},
        timestamps: {}
    };

    /**
     * Logs of all handled updates and applied/rejected modifications of the CRDT.
     */
    #debugHistory: DebugHistoryEntry[] = [];

    public getDebugHistory() {
        return this.#debugHistory;
    }

    #debugMakeHistoryEntry(diff: Diff<object>, timestamp: Timestamp): DebugHistoryEntry | null {
        if (!this.#debug) return null;

        return {
            update: { diff, timestamp },
            mutations: []
        };
    }

    #debugLogHistoryEntry(entry: DebugHistoryEntry | null) {
        if (!this.#debug) return;
        if (!entry) return;

        this.#debugHistory.push(entry);
    }

    #debugLogMutation(entry: DebugHistoryEntry | null, mutation: DebugHistoryMutation) {
        if (!this.#debug) return;
        if (this.#debugLevel === 'updates') return;
        if (!entry || !mutation) return;

        entry.mutations.push({
            ...mutation
        });
    }

    #debugAddMutationState(entry: DebugHistoryEntry | null) {
        if (!this.#debug) return;
        if (this.#debugLevel !== 'all') return;
        if (!entry) return;

        const lastMutation = entry.mutations[entry.mutations.length - 1];
        if (!lastMutation) return;

        lastMutation.state = {
            data: this.data(),
            timestamps: this.timestamps()
        };
    }

    public printDebugHistory(name?: string, options?: { nodeId?: number }) {
        const { log, group, groupCollapsed, groupEnd } = console;
        const isBrowserDevtools = typeof process === 'undefined';

        const makeLoggable = (obj?: object) => {
            return isBrowserDevtools ? obj : JSON.stringify(obj, null, 2);
        };

        const logGroup = (
            title: string,
            callback: () => void,
            options?: { collapsed?: boolean; css?: string }
        ) => {
            (options?.collapsed !== false ? groupCollapsed : group)(title, options?.css || '');

            callback();

            groupEnd();
        };

        const getClientId = (timestamp: Timestamp | Clock) => {
            return Number(timestamp.toString().split('-')[0]);
        };

        const getStatusEmoji = (rejected: boolean) => (rejected ? '❌' : '✅');

        const clientCount = new Set([
            ...this.#debugHistory.map(entry => getClientId(entry.update.timestamp))
        ]).size;

        const logEntireStateAfterEachMutation = this.#debugLevel === 'all';

        logGroup(name ?? 'CRDT', () => {
            logGroup(`History (${clientCount} client${clientCount === 1 ? '' : 's'})`, () => {
                const entries = this.#debugHistory;

                if (!entries.length) {
                    log('No history entries. Enable debug mode and make changes to see history.');
                    return;
                }

                for (const entry of entries) {
                    const allMutationsRejected = entry.mutations.every(
                        mutation => mutation.rejected
                    );

                    const clientId = getClientId(entry.update.timestamp);
                    const clientColor = getColorForSeed(clientId);

                    const clientIsSelf = clientId === (options?.nodeId ?? 0);

                    const updateMessage = [
                        getStatusEmoji(allMutationsRejected),
                        `%c${entry.update.timestamp}`,
                        isBrowserDevtools ? (clientIsSelf ? '(You)' : '') : `(${name})`
                    ].join(' ');

                    logGroup(
                        updateMessage,
                        () => {
                            logGroup('Diff', () => log(makeLoggable(entry.update.diff)), {
                                collapsed: false
                            });
                            logGroup(
                                `Mutations (${entry.mutations.length})`,
                                () => {
                                    entry.mutations.forEach(mutation => {
                                        const valuesString = `${JSON.stringify(
                                            mutation.values.current
                                        )} -> ${JSON.stringify(mutation.values.update)}`;

                                        const mutationMessage = [
                                            getStatusEmoji(mutation.rejected),
                                            mutation.path.join('.') + ':',
                                            valuesString,
                                            '@',
                                            `${mutation.timestamps.current.toString()} -> ${mutation.timestamps.update.toString()}`,
                                            `[${mutation.method}]`
                                        ].join(' ');

                                        logGroup(mutationMessage, () => {
                                            if (!logEntireStateAfterEachMutation) return;
                                            log('Data', makeLoggable(mutation.state?.data));
                                            log(
                                                'Timestamps',
                                                makeLoggable(mutation.state?.timestamps)
                                            );
                                        });
                                    });
                                },
                                { collapsed: false }
                            );

                            if (logEntireStateAfterEachMutation) {
                                logGroup('State after update', () => {
                                    const lastMutation =
                                        entry.mutations[entry.mutations.length - 1];
                                    logGroup('Data', () =>
                                        log(makeLoggable(lastMutation?.state?.data))
                                    );
                                    logGroup('Timestamps', () =>
                                        log(makeLoggable(lastMutation?.state?.timestamps))
                                    );
                                });
                            }
                        },
                        { css: `color: ${clientColor}` }
                    );
                }
            });

            logGroup('State', () => {
                logGroup('Before', () => {
                    logGroup('Data', () => log(makeLoggable(this.#stateOnDebugStart.data)));
                    logGroup('Timestamps', () =>
                        log(makeLoggable(this.#stateOnDebugStart.timestamps))
                    );
                });
                logGroup('After', () => {
                    logGroup('Data', () => log(makeLoggable(this.data())));
                    logGroup('Timestamps', () => log(makeLoggable(this.timestamps())));
                });
            });
        });
    }

    public getDebugSnapshot(): DebugSnapshot {
        return {
            data: this.#stateOnDebugStart.data,
            updates: this.#debugHistory.map(entry => entry.update)
        };
    }
}

function getColorForSeed(value: number) {
    function stringToNumber(str: string): number {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return hash;
    }

    function mapToRange(value: number, min: number, max: number) {
        return Math.floor((value % (max - min)) + min);
    }

    function numberToColor(hash: number) {
        const hue = Math.abs(hash) % 360; // Ensure hue is within 0-360 range
        const saturation = mapToRange(Math.abs(hash >> 8), 50, 100); // Saturation between 50% and 100%
        const lightness = mapToRange(Math.abs(hash >> 16), 50, 100); // Lightness between 50% and 100%
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }

    const hash = stringToNumber(value.toString());
    const color = numberToColor(hash);
    return color;
}
