import get from 'lodash/get.js';
import setWith from 'lodash/setWith.js';
import cloneDeep from 'lodash/cloneDeep.js';
import { compareTimestamps, initTimestamp, Timestamp, Timestamps } from './clock.js';
import { iterateObjectPaths } from '../objectPaths.js';
import objectDiff from '../objectDiff.js';
import isObject from 'lodash/isObject.js';
import { isEmpty } from 'underscore';

type ArrayItem = {
    id: string;
} & Record<string, unknown>;

type ItemArray = ArrayItem[];

type ItemArrayObject = {
    _order: string[];
} & Record<string, Record<string, unknown>>;

/**
 * Checks if a value is an item array
 * @param value
 * @returns
 */
const isItemArray = (value: unknown) => {
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
    const obj = { _order: arr.map(item => item.id) };
    for (const item of arr) {
        if (Object.keys(item).length !== 1) {
            setWith(obj, [item.id], item, Object);
        }
    }
    return obj as ItemArrayObject;
}

/**
 * Converts the object representation of an item array back to an array
 * Opposite function to itemArrayToObject
 * @param obj the object to convert
 * @returns the array
 */
function objectToItemArray(obj: ItemArrayObject) {
    const order = get(obj, ['_order']);
    if (!Array.isArray(order)) {
        throw new Error(`_order must be an array`);
    }
    const array = order.map(id => get(obj, [id])).filter(Boolean);
    return array;
}

export type Patch = {
    timestamp: Timestamp;
    data: object;
};

type HasId = { id: string };
function hasId(item: unknown): item is HasId {
    return isObject(item) && 'id' in item && typeof item.id === 'string';
}
function calculateItemArrayPatch(sourceArray: unknown[], targetArray: unknown[]) {
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

    const patch: Record<string, unknown> = {};
    for (let i = 0; i < targetArray.length; i++) {
        const targetItemOrig = targetArray[i];
        if (!hasId(targetItemOrig)) {
            if (sourceArray.length === 0 || sourceIsAtomicArray) {
                // the source is either empty or an atomic array and at least one item does not contain an ID
                // --> so we just return the target array as patch
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
            patch[targetItem.id] = {
                ...targetItem,
                _index: i
            };
            continue;
        }
        const sourceItem = sourceItems.get(targetItem.id);
        sourceItems.delete(targetItem.id); // remove from source items so that we can check for deleted items later
        const itemPatch = objectDiff(sourceItem, targetItem, null, {
            diffArray: calculateItemArrayPatch
        });
        if (!isEmpty(itemPatch)) {
            patch[targetItem.id] = itemPatch;
        }
    }
    if (sourceIsAtomicArray) {
        // @todo: As long as we don't support converting types in our CRDT we have to throw an error here.
        // Otherwise, subsequent patches calculations will interpret the source array as item array,
        // but our CRDT cannot handle this case, yet.
        throw Error(
            'Atomic arrays cannot be converted to item arrays (all items in update contain an ID)'
        );
    }
    // all items remaining in source items can be seen as deleted
    for (const [id, _] of sourceItems) {
        // items are deleted by setting _index to null
        patch[id] = {
            _index: null
        };
    }
    return patch;
}

/**
CRDT implementation using a single counter to track updates.
It only has one update method which takes a data patch and a timestamp patch.
The user has to keep track of the counter themselves, outside of this class.
*/
export class CRDT<O extends object, T extends Timestamps<O>> {
    static calculatePatch(
        oldData: object,
        newData: object,
        options?: {
            allowedKeys: null | (keyof object)[];
        }
    ): Record<string, unknown> {
        const allowedKeys = options?.allowedKeys ?? null;
        return objectDiff(oldData, newData, allowedKeys, { diffArray: calculateItemArrayPatch });
    }

    private dataObj: O;
    private timestampObj: T;
    private pathToItemArrays: Set<string>;
    private log: {
        receivedUpdates: number;
        appliedUpdates: number;
    };
    /**
     * Constructs a new CRDT instance with the given data and optional timestamps.
     * @param data The initial data object
     * @param timestamps The initial timestamp object, if not provided it will be inferred from the data
     * @returns A new CRDT instance
     */
    constructor(data: O, timestamps?: T) {
        this.dataObj = this.initData(data);
        this.timestampObj = timestamps ?? ({} as T);
        this.pathToItemArrays = this.initPathToItemArrays();
        this.log = {
            receivedUpdates: 0,
            appliedUpdates: 0
        };
    }

    /**
     * Converts raw data to an object representation for item arrays
     * @param obj the object to convert
     * @returns data: data with item array representation objects
     */
    private initData(data: O) {
        iterateObjectPaths(data, path => {
            let patchValue = get(data, path);
            if (isItemArray(patchValue)) {
                patchValue = itemArrayToObject(patchValue);
            }
            setWith(data, path, patchValue, Object);
        });
        return data;
    }

    /**
     * Get all paths to item arrays in the internal data object
     * @returns a list of paths to item arrays
     */
    private initPathToItemArrays() {
        const pathToItemArrays = new Set<string>();
        iterateObjectPaths(this.dataObj, path => {
            const lastPathElement = path.pop();
            if (lastPathElement === '_order') {
                pathToItemArrays.add(path.join('.'));
            }
        });
        return pathToItemArrays;
    }

    /** Get the timestamp for a given path.
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
        return timestamp && typeof timestamp !== 'object' ? timestamp : initTimestamp();
    }

    /**
     * Upserts a value in the data object if the timestamp is higher than the current timestamp.
     * @param path path to the value in the data object
     * @param value the value to upsert
     * @param timestamp the timestamp assosciated with the value
     */
    private upsertValue(path: string[], value: unknown, timestamp: Timestamp) {
        this.log.receivedUpdates += 1;
        const currentTimestamp = this.getTimestamp(path);
        if (compareTimestamps(timestamp, currentTimestamp)) {
            setWith(this.dataObj, path, value, Object);
            setWith(this.timestampObj, path, timestamp, Object);
            this.log.appliedUpdates += 1;
        }
    }

    /**
     * Upserts an item array in the data object if the timestamp is higher than the current timestamp.
     * @param path path to the item array in the data object
     * @param itemArray the item array to upsert
     * @param timestamp the timestamp assosciated with the item array
     */
    private upsertItemArray(path: string[], itemArray: ItemArray, timestamp: Timestamp) {
        const itemArrayObject = itemArrayToObject(itemArray);

        const pathString = path.join('.');

        // check if the item array is not in list of item arrays (=new item array)
        if (!this.pathToItemArrays.has(pathString)) {
            const currentTimestamp = this.getTimestamp(path);
            // we only convert if the patch timestamp is higher than the current timestamp
            if (compareTimestamps(currentTimestamp, timestamp)) return;

            const itemArrayObjectTimestamps = {};
            iterateObjectPaths(itemArrayObject, internalPath => {
                setWith(itemArrayObjectTimestamps, internalPath, timestamp, Object);
            });
            setWith(this.timestampObj, path, itemArrayObjectTimestamps, Object);
            setWith(this.dataObj, path, itemArrayObject, Object);
            this.pathToItemArrays.add(path.join('.'));
            return;
        }
        // iterate over the item array patch and update each item
        iterateObjectPaths(itemArrayObject, internalPath => {
            this.upsertValue(
                [...path, ...internalPath],
                get(itemArrayObject, internalPath),
                timestamp
            );
        });
    }

    /**
     * Updates the CRDT with the given data patch and timestamp patch.
     * @param rawData The data patch to apply
     * @param timestamp The timestamp assosicated with the data patch
     */
    update(patch: object, timestamp: Timestamp) {
        iterateObjectPaths(patch, path => {
            const patchValue = get(patch, path);
            const pathString = path.join('.');
            if (
                isItemArray(patchValue) || // is an item array
                this.pathToItemArrays.has(pathString) // is in list of item arrays
                // we need this second check because an empty item array "[]" is not an item array accroding to isItemArray
            ) {
                this.upsertItemArray(path, patchValue, timestamp);
            } else {
                this.upsertValue(path, patchValue, timestamp);
            }
        });
    }

    data(): O {
        const data = cloneDeep(this.dataObj);
        for (const path of this.pathToItemArrays) {
            const value = objectToItemArray(get(data, path));
            setWith(data, path, value, Object);
        }
        return data;
    }

    timestamps(): T {
        return cloneDeep(this.timestampObj);
    }

    logs() {
        return { ...this.log, successRate: this.log.appliedUpdates / this.log.receivedUpdates };
    }
}
