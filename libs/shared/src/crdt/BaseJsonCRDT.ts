import cloneDeep from 'lodash/cloneDeep.js';
import get from 'lodash/get.js';
import lodashSet from 'lodash/set.js';
import isObject from 'lodash/isObject.js';
import has from 'lodash/has.js';
import isEmpty from 'lodash/isEmpty.js';
import { ItemArray, Clock, Timestamp, Timestamps } from './Clock.js';
import { iterateObjectPaths } from '../objectPaths.js';
import { Diff } from './CRDT.js';
import isEqual from 'lodash/isEqual.js';
import unset from 'lodash/unset.js';
import merge from 'lodash/merge.js';

/**
 * Logs applied and rejected updates/modifications of the CRDT.
 * These logs can then be used via `getLogs()` or logged via `printLogs()`.
 *
 * Enabling this results in a performance hit, so it should only be used for debugging purposes.
 * Should also be disabled during fuzzing, as it will result in a test timeout.
 */
const DEBUG = false;

function set(obj: object, path: string[] | string, value: any) {
    // we convert path to string to avoid creating arrays for a.0.b
    path = Array.isArray(path) ? path.join('.') : path;
    if (path === '') return; // filter out joined empty arrays
    lodashSet(obj, path, value);
}

export type SerializedBaseJsonCRDT<O extends object> = {
    data: O;
    timestamps: Timestamps<O>;
    pathToItemArrays: string[];
};

function isDeleteOperator(value: unknown) {
    return value === null || value === undefined;
}

function isActualObject(value: unknown) {
    return isObject(value) && !Array.isArray(value) && value !== null && !(value instanceof Date);
}

function isEmptyObject(value: unknown) {
    return isActualObject(value) && Object.keys(value as object).length === 0;
}

function isNonEmptyObject(value: unknown) {
    return isActualObject(value) && Object.keys(value as object).length > 0;
}

function isAtomic(value: unknown) {
    return !isActualObject(value);
}

function isExistingAtomicValue(value: unknown) {
    return isAtomic(value) && value !== undefined;
}

function isPathToItemArrayIndex(path: string[]) {
    return path[path.length - 1] === '_index';
}

type ItemArrayObject = Record<string, { id: string; _index: number } & unknown>;

/**
 * Checks if a value is an item array
 * @param value
 * @returns
 */
export const isItemArray = (value: unknown): value is ItemArray => {
    return (
        Array.isArray(value) && // is an array
        value.length !== 0 && // is not empty
        value.every((v: unknown) => typeof v === 'object' && !!v && 'id' in v && v.id !== undefined) // all items have an id property
    );
};

/**
 * Converts an item array to an its internal object representation
 * Opposite function to objectToItemArray
 * @param arr the item array to convert
 * @returns object representation
 */
function itemArrayToObject(arr: ItemArray): ItemArrayObject {
    const obj = {};
    let index = 0;
    for (const item of arr) {
        set(obj, [item.id.toString()], {
            ...item,
            _index: index
        });
        index++;
    }
    return obj as ItemArrayObject;
}

type HasId = { id: string };
function hasId(item: unknown): item is HasId {
    return isObject(item) && 'id' in item && typeof item.id === 'string';
}
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
    for (const [id, _] of sourceItems) {
        // items are deleted by setting _index to null
        diff[id] = {
            _index: null
        };
    }
    return diff;
}

type Log = {
    action: 'delete' | 'update';
    rejected: boolean;
    method: string;
    path: string[];
    values: { current: unknown; update: unknown };
    timestamps: { current: Timestamp | Clock; update: Timestamp | Clock };
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
            // let newValue = get(newData, path);
            const oldValue = get(oldData, path);
            const isNewInsert = !has(oldData, path);
            if (isEqual(newValue, oldValue)) {
                // no change
                return;
            }
            if (allowedKeys && !allowedKeys.has(path[0])) {
                // key not allowed
                return;
            }
            if (newValue === null && isNewInsert) {
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
                if (new Date(oldValue).getTime() === new Date(newValue as any).getTime()) {
                    return;
                }
            }

            set(diff, path, newValue);
        });

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
                // Delete the ancestor if it was deleted in the new data.
                if (ancestorWasDeleted) {
                    set(diff, ancestorPath, null);
                }
                // Simply delete the path if the ancestor was not deleted.
                else if (isActualObject(closestValue)) {
                    set(diff, path, null);
                }
            }
        });

        return diff;
    }

    private dataObj: O;
    private timestampObj: Timestamps<O>;

    /**
     * Temporary timestamp object used to store timestamp modifications during the update process,
     * so individual property/path updates don't interfere with each other.
     */
    private tempTimestampObj: Partial<Timestamps<O>>;
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
    constructor(data: O, timestamps: Timestamps<O>, pathToItemArrays: string[]);
    constructor(data: O, timestamps?: Timestamps<O>, pathToItemArrays?: string[]) {
        this.tempTimestampObj = {};

        if (!timestamps && !pathToItemArrays) {
            // case where we are initializing from scratch
            this.timestampObj = {} as Timestamps<O>;
            this.dataObj = this._initData(cloneDeep(data));
            return;
        }
        if (!timestamps || !pathToItemArrays) {
            throw new Error(
                'Both timestamps and pathToItemArrays must be provided for re-initialization'
            );
        }
        this.timestampObj = timestamps;
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

    /**
     * Converts internal object representation of an item array back to an item array
     * Opposite function to itemArrayToObject
     * @param obj the object to convert
     * @returns item array
     */
    private objectToItemArray(obj: ItemArrayObject, path: string): ItemArray {
        return (
            Object.values(obj)
                // remove "deleted" items
                .filter(item => item._index !== null)
                .sort((a, b) => {
                    const comparison = a._index - b._index;
                    if (comparison !== 0) return comparison;
                    // use timestamps as tie-breaker for when two items were inserted in the same index
                    const aTimestamp = this.getTimestamp([...path.split('.'), a.id, '_index']);
                    const bTimestamp = this.getTimestamp([...path.split('.'), b.id, '_index']);
                    return aTimestamp.isNewerThan(bTimestamp) ? -1 : 1;
                })
                .map(item => {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { _index, ...arrayItem } = item;
                    return arrayItem;
                })
        );
    }

    /**
     * Get the timestamp for a given path.
     * If the path does not have a timestamp, traverse up the path until a timestamp/object is found.
     * If during path traversal an object is found or there is no parent value with a path, return the minimum timestamp.
     */
    private getTimestamp(path: string[]) {
        const searchPath = [...path];
        let timestamp = undefined;
        while (searchPath.length > 0 && timestamp === undefined) {
            timestamp = get(this.timestampObj, searchPath);
            searchPath.pop();
        }
        if (!timestamp || (typeof timestamp === 'object' && path.length != searchPath.length - 1)) {
            return new Clock();
        }
        if (typeof timestamp === 'object') {
            throw new Error(
                `Trying to access timestamp of object.
                Acccessing path: '${path.join('.')}'
                Value: ${JSON.stringify(timestamp)}`
            );
        }
        return new Clock(timestamp);
    }

    private setTimestamp(path: string[], timestamp: Timestamp) {
        set(this.tempTimestampObj, path, timestamp);
    }

    /**
     * Get the timestamp and value for a given path.
     * If the path does not have a timestamp, traverse up the path until a timestamp/object is found.
     * If during path traversal an object is found or there is no parent value with a path, return the minimum timestamp.
     */
    _getClosestAncestorWithTimestamp(
        path: string[],
        ignoreChildren = false
    ): {
        timestamp: Clock;
        value: unknown;
        path: string[];
    } {
        let searchPath = [...path];
        let timestamp = get(this.timestampObj, searchPath);
        let value = get(this.dataObj, searchPath);

        // Find the closest ancestor with a timestamp or a timestamps object.
        while (searchPath.length > 0 && timestamp === undefined) {
            searchPath.pop();
            timestamp = get(this.timestampObj, searchPath);
            value = get(this.dataObj, searchPath);
        }

        // Ensure the path is not empty.
        if (!searchPath.length) {
            searchPath = path.slice(0, 1);
        }

        // If we can't find a timestamp, we're likely trying with a root insert,
        // so we can just return the minimum timestamp.
        if (!timestamp) {
            return {
                path: searchPath,
                timestamp: new Clock(),
                value
            };
        }

        // During nested inserts we don't care about the children,
        // just the timestamp of the object itself.
        if (ignoreChildren && typeof timestamp === 'object') {
            timestamp = timestamp._self;
        }

        // If the ancestor has child timestamps, we return the maximum of those.
        if (typeof timestamp === 'object') {
            const maxChildTimestamp = Clock.max(timestamp);

            return {
                path: searchPath,
                timestamp: maxChildTimestamp,
                value
            };
        }

        return {
            path: searchPath,
            timestamp: new Clock(timestamp),
            value
        };
    }

    _hasObjectAncestor(path: string[]) {
        const searchPath = [...path];
        searchPath.pop();

        while (searchPath.length > 0) {
            const value = get(this.dataObj, searchPath);
            if (value !== undefined && !isActualObject(value)) {
                return false;
            }
            searchPath.pop();
        }

        return true;
    }

    /**
     * Logs of all applied and rejected updates/modifications of the CRDT.
     */
    private logs: Log[] = [];

    public getLogs() {
        return this.logs;
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

        const maxPathLength = logs.reduce((max, { path }) => {
            return Math.max(max, path.join('.').length);
        }, 0);

        const maxValueLength = logs.reduce((max, { valuesString }) => {
            return Math.max(max, valuesString.length);
        }, 0);

        logs.forEach(({ rejected, action, timestamps, path, method, valuesString }) => {
            const msg = `${rejected ? '❌' : '✅'} ${action.toUpperCase()} ${
                timestamps.update
            } | ${path.join('.').padEnd(maxPathLength)} | ${valuesString.padEnd(
                maxValueLength
            )} | ${timestamps.current} | ${method}`;

            console.log(rejected ? `\x1b[31m${msg}\x1b[0m` : `\x1b[32m${msg}\x1b[0m`);
        });
        console.log('---------------------------------');
        console.log('STATE - DATA:');
        console.log('---------------------------------');
        console.log(JSON.stringify(this.dataObj, null, 2));
        console.log('---------------------------------');
        console.log('STATE - TIMESTAMPS:');
        console.log('---------------------------------');
        console.log(JSON.stringify(this.timestampObj, null, 2));
        console.log('---------------------------------');
    }
    /* eslint-enable no-console */

    /**
     * Add a log entry. Only has an effect if DEBUG is enabled.
     */
    private debugLog(log: Log) {
        DEBUG && this.logs.push(log);
    }

    private updateExistingAtomicValue({
        path,
        newValue,
        currentValue,
        newTimestamp
    }: UpdateValueProps) {
        if (!isExistingAtomicValue(currentValue)) {
            throw new Error('currentValue is not atomic!');
        }

        const currentTimestamp = new Clock(get(this.timestampObj, path));
        const reject = !currentTimestamp.isOlderThan(newTimestamp);

        // Delete
        if (isDeleteOperator(newValue)) {
            this.debugLog({
                action: 'delete',
                rejected: reject,
                method: 'updateExistingAtomicValue',
                path,
                values: { current: currentValue, update: newValue },
                timestamps: { current: currentTimestamp, update: newTimestamp }
            });
            if (reject) return;

            unset(this.dataObj, path);
            this.setTimestamp(path, newTimestamp);
            return;
        }

        // Update with atomic value
        if (isAtomic(newValue)) {
            this.debugLog({
                action: 'update',
                rejected: reject,
                method: 'updateExistingAtomicValue:atomic',
                path,
                values: { current: currentValue, update: newValue },
                timestamps: { current: currentTimestamp, update: newTimestamp }
            });
            if (reject) return;

            set(this.dataObj, path, newValue);
            this.setTimestamp(path, newTimestamp);
            return;
        }

        // Update with object
        if (isActualObject(newValue)) {
            this.debugLog({
                action: 'update',
                rejected: reject,
                method: 'updateExistingAtomicValue:object',
                path,
                values: { current: currentValue, update: newValue },
                timestamps: { current: currentTimestamp, update: newTimestamp }
            });
            if (reject) return;

            set(this.dataObj, path, newValue);
            this.setTimestamp(path, newTimestamp);
            return;
        }

        throw new Error('Unhandled newValue type!');
    }

    private updateItemArrayIndex({ path, newValue, currentValue, newTimestamp }: UpdateValueProps) {
        if (!isPathToItemArrayIndex(path)) {
            throw new Error('updateItemArrayIndex called with non-item-array-index path');
        }

        const currentClock = new Clock(get(this.timestampObj, path) ?? 0);

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
            this.setTimestamp(path, newTimestamp);
            return;
        }

        // Never change a deleted _index value
        if (currentValue === null) {
            this.setTimestamp(path, newTimestamp);
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
            this.setTimestamp(path, newTimestamp);
            return;
        }

        throw new Error('Unhandled newValue type!');
    }

    private insertNewValue({ path, newValue, currentValue, newTimestamp }: UpdateValueProps) {
        if (currentValue !== undefined) {
            throw new Error(
                'currentValue is not undefined!' + JSON.stringify({ path, currentValue })
            );
        }

        const ancestor = this._getClosestAncestorWithTimestamp(path, true);
        const reject = !ancestor.timestamp.isOlderThan(newTimestamp);

        // Delete
        if (isDeleteOperator(newValue)) {
            this.debugLog({
                action: 'delete',
                rejected: reject,
                method: 'insertNewValue',
                path,
                values: { current: currentValue, update: newValue },
                timestamps: { current: ancestor.timestamp, update: newTimestamp }
            });
            if (reject) return;

            // Even though the value does not exist, we need to create the ancestor objects.
            set(this.dataObj, path, newValue);
            this.setTimestamp(path, newTimestamp);

            // Update timestamp of the nearest ancestor.
            // this.setTimestamp([...path.slice(0, -1), '_self'], newTimestamp);

            unset(this.dataObj, path);
            this.setTimestamp(path, newTimestamp);
            return;
        }

        // Insert new atomic value or nested object.
        if (isAtomic(newValue) || isActualObject(newValue)) {
            this.debugLog({
                action: 'update',
                rejected: reject,
                method: 'insertNewValue',
                path,
                values: { current: currentValue, update: newValue },
                timestamps: { current: ancestor.timestamp, update: newTimestamp }
            });
            if (reject) return;

            set(this.dataObj, path, newValue);
            this.setTimestamp(path, newTimestamp);

            // Store previous timestamp of ancestor when setting/inserting a nested value.
            if (ancestor.path.length !== path.length) {
                this.setTimestamp([...ancestor.path, '_self'], ancestor.timestamp.toString());
            }

            return;
        }

        throw new Error('Unhandled newValue type!');
    }
    private insertNestedValueReplacingAtomicAncestor({
        path,
        newValue,
        newTimestamp
    }: UpdateValueProps) {
        // The atomic value/ancestor that is being replaced.
        const ancestor = this._getClosestAncestorWithTimestamp(path);
        const ancestorClock = ancestor.timestamp;

        const reject = !ancestorClock.isOlderThan(newTimestamp);

        if (isDeleteOperator(newValue)) {
            this.debugLog({
                action: 'delete',
                rejected: reject,
                method: 'insertNestedValueReplacingAtomicAncestor',
                path,
                values: { current: ancestor.value, update: newValue },
                timestamps: { current: ancestorClock, update: newTimestamp }
            });
            if (reject) return;

            unset(this.dataObj, path);
        } else {
            this.debugLog({
                action: 'update',
                rejected: reject,
                method: 'insertNestedValueReplacingAtomicAncestor',
                path,
                values: { current: ancestor.value, update: newValue },
                timestamps: { current: ancestorClock, update: newTimestamp }
            });
            if (reject) return;

            // Replace atomic value with empty object.
            // Otherwise the new value would get set into the atomic object (`String`, `Number`, etc.).
            set(this.dataObj, ancestor.path, {});
            // this.setTimestamp(ancestor.path, timestamp);

            // Insert the new value.
            set(this.dataObj, path, newValue);
        }

        this.setTimestamp(path, newTimestamp);
    }

    /**
     * Deletes all children of the given path that are older than the new timestamp.
     * Keeps the children that are newer than the new timestamp.
     * @returns The maximum timestamp of all children.
     */
    _partialDelete({
        path,
        currentTimestamps,
        newTimestamp
    }: {
        path: string[];
        currentTimestamps: object;
        newTimestamp: Timestamp;
    }): { maxTimestamp: Clock } {
        let maxTimestamp = new Clock(0);
        const deletedChildren: string[][] = [];

        iterateObjectPaths(currentTimestamps, childPath => {
            const fullPath = [...path, ...childPath];
            const childTimestamp = new Clock(get(this.timestampObj, fullPath));

            if (childTimestamp.isNewerThan(maxTimestamp)) {
                maxTimestamp = childTimestamp;
            }

            // delete all children that are older than the new timestamp
            if (childTimestamp.isOlderThan(newTimestamp)) {
                deletedChildren.push(fullPath);

                unset(this.dataObj, fullPath);
                this.setTimestamp(fullPath, newTimestamp);
            }
        });

        const deletedPaths = new Set<string>();

        // Delete possibly empty ancestor objects of deleted children.
        Array.from(deletedChildren)
            // Sort paths from deepest to shallowest.
            // That way we delete the deepest children first,
            // so we can then possibly delete their ancestors.
            .sort((a, b) => b.length - a.length)
            .forEach(fullPath => {
                const path = fullPath.slice(0, -1);
                while (path.length > 0) {
                    const stringPath = path.join('.');

                    // If we already deleted this path, we don't need to check it again.
                    if (deletedPaths.has(stringPath)) {
                        break;
                    }

                    // Delete the path if it's an empty object.
                    const currentValue = get(this.dataObj, path);
                    if (isEmptyObject(currentValue)) {
                        deletedPaths.add(stringPath);
                        unset(this.dataObj, path);
                        this.setTimestamp(path, newTimestamp);
                    } else {
                        // If the path is not an empty object, we don't need to check any higher paths.
                        break;
                    }
                    path.pop();
                }
            });

        return {
            maxTimestamp
        };
    }

    private updateObject({ path, newValue, currentValue, newTimestamp }: UpdateValueProps) {
        if (!isActualObject(currentValue)) {
            throw new Error('currentValue is not an object!');
        }

        // Don't overwrite existing objects with empty object
        if (isEmptyObject(newValue)) {
            // TODO: Do we need to set the `_self` timestamp here?
            return;
        }

        const currentTimestamp = get(this.timestampObj, path);

        // Delete object
        if (isDeleteOperator(newValue)) {
            let maxTimestamp: Clock;

            // Perform a partial delete when object has tracked children.
            if (typeof currentTimestamp === 'object') {
                ({ maxTimestamp } = this._partialDelete({
                    path,
                    currentTimestamps: currentTimestamp,
                    newTimestamp
                }));
            } else {
                maxTimestamp = new Clock(currentTimestamp);
            }

            // If the object has no children with newer timestamps, we overwrite the whole object.
            // TODO: We could do this earlier, so we don't have to perform a partial delete if we're going to delete the whole object anyway.
            const reject = !maxTimestamp.isOlderThan(newTimestamp);

            this.debugLog({
                action: 'delete',
                rejected: reject,
                method: 'updateObject',
                path,
                values: { current: currentValue, update: newValue },
                timestamps: { current: maxTimestamp, update: newTimestamp }
            });
            if (reject) return;

            unset(this.dataObj, path);
            this.setTimestamp(path, newTimestamp);
            return;
        }

        // Replace object with atomic value
        if (isAtomic(newValue)) {
            let maxTimestamp: Clock;

            // Perform a partial delete when object has tracked children.
            if (typeof currentTimestamp === 'object') {
                ({ maxTimestamp } = this._partialDelete({
                    path,
                    currentTimestamps: currentTimestamp,
                    newTimestamp
                }));
            } else {
                maxTimestamp = new Clock(currentTimestamp);
            }

            // Overwrite the object with the atomic value, if no children have newer timestamps.
            const reject = !maxTimestamp.isOlderThan(newTimestamp);

            this.debugLog({
                action: 'update',
                rejected: reject,
                method: 'updateObject',
                path,
                values: { current: currentValue, update: newValue },
                timestamps: { current: maxTimestamp, update: newTimestamp }
            });
            if (reject) return;

            set(this.dataObj, path, newValue);
            this.setTimestamp(path, newTimestamp);
            return;
        }

        throw new Error('Unhandled newValue type!');
    }

    /**
     * Upserts a value in the data object if the timestamp is higher than the current timestamp.
     * @param path path to the value in the data object
     * @param value the value to upsert
     * @param timestamp the timestamp assosciated with the value
     */
    private updateValue(path: string[], newValue: unknown, newTimestamp: Timestamp) {
        const currentValue = get(this.dataObj, path);

        const props = { path, newValue, newTimestamp, currentValue };

        // Current path leads to an item array index (e.g. 'a.b._index')
        if (isPathToItemArrayIndex(path)) {
            this.updateItemArrayIndex(props);
            return;
        }

        // Current path has an atomic value.
        if (isExistingAtomicValue(currentValue)) {
            this.updateExistingAtomicValue(props);
            return;
        }

        // Current path does not have a value/does not exist.
        // Could either be an insert or a nested replacement of an atomic value.
        if (!currentValue) {
            if (this._hasObjectAncestor(path)) {
                // ...in existing object
                this.insertNewValue(props);
            } else {
                // ...replacing existing atomic value
                this.insertNestedValueReplacingAtomicAncestor(props);
            }
            return;
        }

        // Current path leads to an object.
        if (isActualObject(currentValue)) {
            this.updateObject(props);
            return;
        }

        throw new Error(
            'Unhandled update case!' + JSON.stringify({ path, currentValue, newValue })
        );
    }

    /**
     * Updates the CRDT with the given data diff and timestamp.
     * @param diff The data diff to apply
     * @param timestamp The timestamp assosicated with the data diff
     */
    update(diff: Diff<any>, timestampOrClock: Clock | Timestamp) {
        const timestamp =
            timestampOrClock instanceof Clock ? timestampOrClock.timestamp : timestampOrClock;

        this.tempTimestampObj = {};

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
                    set(this.dataObj, pathString, {});
                    this.pathToItemArrays.add(pathString);
                }
            }
        });

        iterateObjectPaths(diff, (path, newValue) => {
            try {
                this.updateValue(path, newValue, timestamp);
            } catch (e) {
                const currentValue = get(this.dataObj, path);
                console.error('Error while updating CRDT', {
                    newValue,
                    path,
                    timestamp,
                    currentValue
                });
                throw e;
            }
        });

        // Recursively merge the temporary timestamp object into the main timestamp object.
        merge(this.timestampObj, this.tempTimestampObj);
        this.tempTimestampObj = {};
    }

    data(): O {
        const data = cloneDeep(this.dataObj);
        for (const path of this.pathToItemArrays) {
            const itemArrayObject: ItemArrayObject = get(data, path) ?? {}; // handle case where the item array is not present due to corrupted data
            const itemArray = this.objectToItemArray(itemArrayObject, path);
            set(data, path, itemArray);
        }
        return data;
    }

    serialize(): SerializedBaseJsonCRDT<O> {
        return {
            data: cloneDeep(this.dataObj),
            timestamps: this.timestamps(),
            pathToItemArrays: Array.from(this.pathToItemArrays)
        };
    }

    timestamps(): Timestamps<O> {
        return cloneDeep(this.timestampObj);
    }
}
