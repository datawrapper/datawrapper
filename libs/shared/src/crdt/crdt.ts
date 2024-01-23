import get from 'lodash/get.js';
import setWith from 'lodash/setWith.js';
import cloneDeep from 'lodash/cloneDeep.js';
import { compareTimestamps, initTimestamp, Timestamp, Timestamps } from './clock.js';
import { iterateObjectPaths } from '../objectPaths.js';

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

/**
CRDT implementation using a single counter to track updates.
It only has one update method which takes a data patch and a timestamp patch.
The user has to keep track of the counter themselves, outside of this class.
*/
export class CRDT<O extends object, T extends Timestamps<O>> {
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
        this.timestampObj = timestamps ?? this.initTimestamps();
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

    /** Creates a timestamps with the same shape as data but with new timestamps as values */
    private initTimestamps(): T {
        const timestamps = {};
        iterateObjectPaths(this.dataObj, path => {
            setWith(timestamps, path, initTimestamp(), Object);
        });
        return timestamps as T;
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
