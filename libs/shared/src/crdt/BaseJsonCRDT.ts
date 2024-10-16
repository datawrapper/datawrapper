import cloneDeep from 'lodash/cloneDeep.js';
import get from 'lodash/get.js';
import isObject from 'lodash/isObject.js';
import has from 'lodash/has.js';
import isEmpty from 'lodash/isEmpty.js';
import { Clock } from './Clock.js';
import { iterateObjectPaths } from '../objectPaths.js';
import { Diff } from './CRDT.js';
import isEqual from 'lodash/isEqual.js';
import unset from 'lodash/unset.js';
import {
    set,
    hasId,
    isItemArray,
    isPathToItemArrayIndex,
    isExistingAtomicValue,
    isDeleteOperator,
    isAtomic,
    getUpdateType,
    isActualObject,
    isEmptyObject,
    migrateTimestamps,
    itemArrayToObject,
    assertOneOf
} from './utils.js';
import {
    ItemArray,
    Timestamp,
    Timestamps,
    NewTimestamps,
    SerializedBaseJsonCRDT,
    ItemArrayObject
} from './types.js';
import { TIMESTAMP_KEY } from './constants.js';

/**
 * Logs applied and rejected updates/modifications of the CRDT.
 * These logs can then be used via `getLogs()` or logged via `printLogs()`.
 *
 * Enabling this results in a performance hit, so it should only be used for debugging purposes.
 * Should also be disabled during fuzzing, as it will result in a test timeout.
 */
const DEBUG = false;

/**
 * Calculate the diff between two item arrays. Item Arrays are arrays of objects with a unique ID property.
 * Thereby, items of the source array can be matched with items of the target array by their ID, which allows merging updates and deletions.
 * @param sourceArray The source array
 * @param targetArray The target array
 * @returns The diff object that represents the changes that are required to be performed to get from the source to the target array.
 */
function calculateItemArrayDiff(sourceArray: unknown[], targetArray: unknown[]) {
    const sourceItems = new Map(
        sourceArray.filter(hasId).map((item, index) => [
            item.id,
            {
                ...item,
                _index: index // calculate index so that we can compare whether or not the position has changed
            }
        ])
    );

    // some items in source array don't contain an ID
    const sourceIsAtomicArray = sourceArray.length && sourceArray.length !== sourceItems.size;

    if (sourceIsAtomicArray && targetArray.length === 0) {
        // the source is an atomic array and the target is empty
        // --> so we just return the target array as diff
        return targetArray;
    }

    const diff: Record<string, unknown> = {};
    for (let i = 0; i < targetArray.length; i++) {
        const targetItemOrig = targetArray[i];
        if (!hasId(targetItemOrig)) {
            if (sourceArray.length === 0 || sourceIsAtomicArray) {
                // the source is either empty or an atomic array and at least one item does not contain an ID
                // --> so we just return the target array as diff
                return targetArray;
            }
            // if the source is an item array, we ignore target items without ID.
            continue;
        }
        const targetItem = {
            ...targetItemOrig,
            _index: i // already create updated _index so that updates are calculated as part of objectDiff
        };
        if (!sourceItems.has(targetItem.id)) {
            // array item is new
            diff[targetItem.id] = {
                ...targetItem,
                _index: i
            };
            continue;
        }
        const sourceItem = sourceItems.get(targetItem.id);
        sourceItems.delete(targetItem.id); // remove from source items so that we can check for deleted items later

        const itemDiff = BaseJsonCRDT.calculateDiff(sourceItem as object, targetItem);
        if (!isEmpty(itemDiff)) {
            diff[targetItem.id] = itemDiff;
        }
    }
    if (sourceIsAtomicArray) {
        // @todo: As long as we don't support converting types in our CRDT we have to throw an error here.
        // Otherwise, subsequent diff calculations will interpret the source array as item array,
        // but our CRDT cannot handle this case, yet.
        throw Error(
            'Atomic arrays cannot be converted to item arrays (all items in update contain an ID)'
        );
    }
    // all items remaining in source items can be seen as deleted
    // @typescript-eslint/no-unused-vars
    for (const [id] of sourceItems) {
        // items are deleted by setting _index to null
        diff[id] = {
            _index: null
        };
    }
    return diff;
}

type Log = {
    /**
     * @deprecated Use `method` instead.
     */
    action?: 'delete' | 'update';
    rejected: boolean;
    method: string;
    path: string[];
    values: { current: unknown; update: unknown };
    timestamps: { current: Timestamp | Clock; update: Timestamp | Clock };
    data?: object;
    ancestor?: object;
    timestampsObj?: object;
};

type UpdateValueProps = {
    path: string[];
    currentValue: unknown;
    newValue: unknown;
    newTimestamp: Timestamp;
};

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
        }
    ): Record<string, unknown> {
        const allowedKeys = options?.allowedKeys ?? null;
        const ignorePaths = options?.ignorePaths ?? null;
        const diff = {};

        // Handle updates from the new data.
        iterateObjectPaths(newData, (path, newValue) => {
            const pathString = path.join('.');

            if (ignorePaths && ignorePaths.has(pathString)) {
                return;
            }

            const oldValue = get(oldData, path);

            if (isEqual(newValue, oldValue)) {
                // no change
                return;
            }

            if (allowedKeys && !allowedKeys.has(path[0])) {
                // key not allowed
                return;
            }

            const isNewInsert = !has(oldData, path);
            if (isDeleteOperator(newValue) && isNewInsert) {
                // delete order on non-existing value is redundant
                return;
            }

            if (Array.isArray(newValue) && Array.isArray(oldValue)) {
                // handle arrays
                newValue = calculateItemArrayDiff(oldValue, newValue);
                // if array diff is empty don't set anything
                if (isObject(newValue) && !Array.isArray(newValue) && isEmpty(newValue)) {
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
        iterateObjectPaths(oldData, path => {
            let closestValue = null;
            let ancestorPath = [...path];
            const poppedParts: string[] = [];

            // Find the closest ancestor with a value in the new data.
            while (ancestorPath.length > 0 && !closestValue) {
                closestValue = get(newData, ancestorPath);
                poppedParts.unshift(ancestorPath.pop()!);
            }

            // Ensure the path is not empty.
            if (!ancestorPath.length) {
                ancestorPath = [poppedParts[0]];
            }

            const ancestorWasDeleted = closestValue === undefined;

            // Path is not present in the new data, so we delete it.
            if (!has(newData, path)) {
                const oldValue = get(oldData, path);
                if (Array.isArray(oldValue)) {
                    const arrayDiff = calculateItemArrayDiff(oldValue, []);
                    if (isObject(arrayDiff) && !isEmpty(arrayDiff)) {
                        // `oldValue` is an item array which has been deleted.
                        // Since item arrays cannot be deleted, we update the diff to contain explicit deletes of each item
                        // contained in the item array at that point (i.e. `arrayDiff`).
                        set(diff, path, arrayDiff);

                        // Since the item array cannot be fully deleted, we update `newData` to reflect that:
                        // After applying the diff, the item array would be empty.
                        // Hence, we set the path at `newData` to an empty array.
                        set(newData, path, []);

                        // We now know that the ancestor possibly marked for deletion cannot be deleted
                        // because it contains an item array. We therefore remove it from the `ancestorPaths` map.
                        ancestorPaths.delete(ancestorPath.join('.'));
                    } else {
                        // Simple arrays can simply be deleted
                        set(diff, path, null);
                    }
                }
                // Mark the ancestor for deletion if it was deleted in the new data and set the child to null.
                // The ancestor will only be fully deleted if it does not contain a nested item array.
                else if (ancestorWasDeleted) {
                    set(diff, path, null);
                    ancestorPaths.set(ancestorPath.join('.'), ancestorPath);
                }
                // Simply delete the path if the ancestor was not deleted.
                else if (isActualObject(closestValue)) {
                    set(diff, path, null);
                }
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
    private pathToItemArrays = new Set<string>();

    static fromSerialized<T extends object>(
        serialized: SerializedBaseJsonCRDT<T>
    ): BaseJsonCRDT<T> {
        return new BaseJsonCRDT(
            serialized.data,
            serialized.timestamps,
            serialized.pathToItemArrays
        );
    }

    /**
     * Constructs a new CRDT instance with the given data and optional timestamps.
     * @param data The initial data object
     * @param timestamps The initial timestamp object, if not provided it will be inferred from the data
     * @returns A new CRDT instance
     */
    constructor(data: O);
    constructor(data: O, timestamps: Timestamps<O> | NewTimestamps<O>, pathToItemArrays: string[]);
    constructor(
        data: O,
        timestamps?: Timestamps<O> | NewTimestamps<O>,
        pathToItemArrays?: string[]
    ) {
        if (!timestamps && !pathToItemArrays) {
            // case where we are initializing from scratch
            this.timestampObj = {} as NewTimestamps<O>;
            this.dataObj = this._initData(cloneDeep(data));
            return;
        }
        if (!timestamps || !pathToItemArrays) {
            throw new Error(
                'Both timestamps and pathToItemArrays must be provided for re-initialization'
            );
        }

        // TODO: Remove this migration once all existing CRDT instances stored in Redis have been updated to use the new timestamp format.
        // This will be 1 month (CRDT_STORAGE_DURATION) after this code has gone live.
        this.timestampObj = migrateTimestamps(timestamps);
        this.dataObj = data; // data is already in the correct format in this case
        this.pathToItemArrays = new Set(pathToItemArrays);
    }

    /**
     * Converts raw data to an object representation for item arrays
     * @param obj the object to convert
     * @returns data: data with item array representation objects
     */
    _initData(data: O) {
        iterateObjectPaths(data, (path, value) => {
            if (value === null) {
                // filter out null values
                unset(data, path);
                return;
            }

            if (isItemArray(value)) {
                value = itemArrayToObject(value);
                this.pathToItemArrays.add(path.join('.'));
            }

            set(data, path, value);
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

    /**
     * Logs of all applied and rejected updates/modifications of the CRDT.
     */
    #logs: Log[] = [];
    #updates: { diff: object; timestamp: Timestamp }[] = [];

    public getLogs() {
        return this.#logs;
    }
    public getUpdates() {
        return this.#updates;
    }

    /* eslint-disable no-console */
    public printLogs(title?: string) {
        if (title) {
            console.log(title);
        }

        console.log('---------------------------------');
        console.log('LOGS:');
        console.log('---------------------------------');

        const logs = this.getLogs().map(log => {
            return {
                ...log,
                valuesString: `${JSON.stringify(log.values.current)} -> ${JSON.stringify(
                    log.values.update
                )}`
            };
        });

        logs.forEach(
            ({
                rejected,
                timestamps,
                path,
                method,
                valuesString,
                data,
                timestampsObj,
                ancestor
            }) => {
                const msg = `[${title}] ${rejected ? '❌' : '✅'} ${
                    timestamps.update
                } @ ${path.join('.')} | ${valuesString} | ${timestamps.current} [${method}]`;
                console.log(JSON.stringify(data, null, 2));
                console.log(JSON.stringify(timestampsObj, null, 2));
                console.log(rejected ? `\x1b[31m${msg}\x1b[0m` : `\x1b[32m${msg}\x1b[0m`);
                if (ancestor) {
                    console.log(`Ancestor: ${JSON.stringify(ancestor)}`);
                }
                console.log('');
            }
        );
        console.log('---------------------------------');
        console.log(`${title}: UPDATES:`);
        console.log('---------------------------------');
        this.#updates.forEach(update => {
            console.log(JSON.stringify(update, null, 2));
        });
        console.log('---------------------------------');
        console.log(`${title}: STATE - DATA:`);
        console.log('---------------------------------');
        console.log(JSON.stringify(this.dataObj, null, 2));
        console.log('---------------------------------');
        console.log(`${title}: STATE - TIMESTAMPS:`);
        console.log('---------------------------------');
        console.log(JSON.stringify(this.timestampObj, null, 2));
        console.log('---------------------------------');
    }
    /* eslint-enable no-console */

    /**
     * Add a log entry. Only has an effect if DEBUG is enabled.
     */
    private debugLog(log: Log) {
        DEBUG &&
            this.#logs.push({
                ...cloneDeep(log),
                data: this.data(),
                timestampsObj: this.timestamps()
            });
    }

    _updateExistingAtomicValue({ path, newValue, currentValue, newTimestamp }: UpdateValueProps) {
        assertOneOf(currentValue, [isExistingAtomicValue]);
        assertOneOf(newValue, [isDeleteOperator, isAtomic, isEmptyObject]);

        const currentTimestamp = this._getClock(path);
        const reject = !currentTimestamp.isOlderThan(newTimestamp);

        this.debugLog({
            action: 'update',
            rejected: reject,
            method: `updateExistingAtomicValue:${getUpdateType(newValue)}`,
            path,
            values: { current: currentValue, update: newValue },
            timestamps: { current: currentTimestamp, update: newTimestamp }
        });
        if (reject) return;

        set(this.dataObj, path, newValue);
        this._setTimestamp(path, newTimestamp);

        return;
    }

    _updateItemArrayIndex({ path, newValue, currentValue, newTimestamp }: UpdateValueProps) {
        assertOneOf(path, [isPathToItemArrayIndex]);

        const currentClock = this._getClock(path);

        // Delete item
        if (isDeleteOperator(newValue)) {
            this.debugLog({
                action: 'delete',
                rejected: false,
                method: 'updateItemArrayIndex',
                path,
                values: { current: currentValue, update: newValue },
                timestamps: { current: currentClock, update: newTimestamp }
            });

            set(this.dataObj, path, null);
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
            this.debugLog({
                action: 'update',
                rejected: reject,
                method: 'updateItemArrayIndex',
                path,
                values: { current: currentValue, update: newValue },
                timestamps: { current: currentClock, update: newTimestamp }
            });
            if (reject) return;

            set(this.dataObj, path, newValue);
            this._setTimestamp(path, newTimestamp);
            return;
        }

        throw new Error('Unhandled newValue type!');
    }

    _insertNewValue({ path, newValue, currentValue, newTimestamp }: UpdateValueProps) {
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

        this.debugLog({
            rejected: reject,
            method: `insertNewValue:${getUpdateType(newValue)}`,
            path,
            values: { current: currentValue, update: newValue },
            timestamps: {
                current: clock,
                update: newTimestamp
            }
        });
        if (reject) return;

        set(this.dataObj, path, newValue);
        this._setTimestamp(path, newTimestamp);
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

            const childTimestamp = this._getClock(fullPath);

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

    _updateObject({ path, newValue, currentValue, newTimestamp }: UpdateValueProps) {
        assertOneOf(currentValue, [isActualObject]);
        assertOneOf(newValue, [isDeleteOperator, isAtomic, isEmptyObject]);

        const timestampsObject = this._getTimestamps(path);
        const selfTimestamp = this._getClock(path);
        const maxTimestamp = Clock.max(timestampsObject ?? {});

        const reject = !maxTimestamp.isOlderThan(newTimestamp);

        this.debugLog({
            action: 'update',
            rejected: reject,
            method: `updateObject:${getUpdateType(newValue)}`,
            path,
            values: { current: currentValue, update: newValue },
            timestamps: { current: maxTimestamp, update: newTimestamp }
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

        set(this.dataObj, path, newValue);
    }

    /**
     * Upserts a value in the data object if the timestamp is higher than the current timestamp.
     * @param path path to the value in the data object
     * @param value the value to upsert
     * @param timestamp the timestamp assosciated with the value
     */
    _updateValue(path: string[], newValue: unknown, newTimestamp: Timestamp) {
        const currentValue = get(this.dataObj, path);

        const props = { path, newValue, newTimestamp, currentValue };

        // Current path leads to an item array index (e.g. 'a.b._index')
        if (isPathToItemArrayIndex(path)) {
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
    public update(diff: Diff<any>, timestampOrClock: Clock | Timestamp) {
        const newTimestamp =
            timestampOrClock instanceof Clock ? timestampOrClock.timestamp : timestampOrClock;

        if (DEBUG) {
            this.#updates.push(cloneDeep({ diff, timestamp: newTimestamp }));
        }

        iterateObjectPaths(diff, path => {
            const searchPath = [...path];
            if (searchPath.pop() === '_index') {
                searchPath.pop();
                const pathString = searchPath.join('.');
                if (!this.pathToItemArrays.has(pathString)) {
                    // new item array
                    const currentValue = get(this.dataObj, pathString);
                    if (currentValue !== undefined && !isEqual(currentValue, [])) {
                        throw new Error(`Item array created at existing path.

                        Path: '${pathString}'
                        Current value: ${JSON.stringify(currentValue)}`);
                    }
                    // Individual keys of item array paths will never contain dots, so we can safely split by dots.
                    set(this.dataObj, pathString.split('.'), {});
                    this.pathToItemArrays.add(pathString);
                }
            }
        });

        iterateObjectPaths(diff, (path, newValue) => {
            try {
                this._updateValue(path, cloneDeep(newValue), newTimestamp);
            } catch (e) {
                const currentValue = get(this.dataObj, path);
                console.error('Error while updating CRDT', {
                    path,
                    currentValue,
                    newValue,
                    currentTimestamp: this._getTimestamp(path),
                    newTimestamp
                });
                throw e;
            }
        });
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
                // use timestamps as tie-breaker for when two items were inserted in the same index
                const aTimestamp = this._getClock([...path.split('.'), a.id, '_index']);
                const bTimestamp = this._getClock([...path.split('.'), b.id, '_index']);
                return aTimestamp.isNewerThan(bTimestamp) ? -1 : 1;
            })
            .map(item => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { _index, ...arrayItem } = item;
                return arrayItem;
            });
    }

    public data(): O {
        const data = cloneDeep(this.dataObj);
        for (const path of this.pathToItemArrays) {
            const itemArrayObject: ItemArrayObject = get(data, path) ?? {}; // handle case where the item array is not present due to corrupted data
            const itemArray = this._objectToItemArray(itemArrayObject, path);
            // Individual keys of item array paths will never contain dots, so we can safely split by dots.
            set(data, path.split('.'), itemArray);
        }

        iterateObjectPaths(data, (path, value) => {
            // filter out null values
            if (isDeleteOperator(value)) {
                unset(data, path);
            }
        });

        return data;
    }

    public serialize(): SerializedBaseJsonCRDT<O> {
        return {
            data: cloneDeep(this.dataObj),
            timestamps: this.timestamps(),
            pathToItemArrays: Array.from(this.pathToItemArrays)
        };
    }

    public timestamps(): NewTimestamps<O> {
        return cloneDeep(this.timestampObj);
    }
}
