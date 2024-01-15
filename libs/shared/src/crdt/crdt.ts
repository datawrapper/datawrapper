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

/**
 * Get all paths to item arrays in a provided patch
 * @param patch the patch object
 * @returns a list of paths to item arrays
 */
function getItemArrayPathsFromPatch(patch: object) {
    const pathToItemArrays: string[][] = [];
    iterateObjectPaths(patch, path => {
        const value = get(patch, path);
        if (Array.isArray(value) && value.length !== 0 && value[0].id !== undefined) {
            pathToItemArrays.push(path);
        }
    });
    return pathToItemArrays;
}

/**
 * Get all paths to item arrays in a provided data object
 * @param data the data object
 * @returns a list of paths to item arrays
 */
function getItemArrayPathsFromData(data: object) {
    const pathToItemArrays: string[][] = [];
    iterateObjectPaths(data, path => {
        const lastPathElement = path.pop();
        if (lastPathElement === '_order') {
            pathToItemArrays.push(path);
        }
    });
    return pathToItemArrays;
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
     * Upserts a value in the data object if the timestamp is higher than the current timestamp.
     * @param path path to the value in the data object
     * @param value the value to upsert
     * @param timestamp the timestamp assosciated with the value
     */
    private upsertValue(path: string[], value: unknown, timestamp: Timestamp) {
        this.log.receivedUpdates += 1;
        const currentTimestamp = get(this.timestampObj, path) ?? initTimestamp();
        if (compareTimestamps(timestamp, currentTimestamp)) {
            setWith(this.dataObj, path, value, Object);
            setWith(this.timestampObj, path, timestamp, Object);
            this.log.appliedUpdates += 1;
        }
    }

    /**
     * Updates the CRDT with the given data patch and timestamp patch.
     * @param rawData The data patch to apply
     * @param timestamp The timestamp assosicated with the data patch
     */
    update(data: object, timestamp: Timestamp) {
        // handle conversion of item arrays
        const updatedItemArrayPaths = getItemArrayPathsFromPatch(data);
        const currentItemArrayPaths = getItemArrayPathsFromData(this.dataObj);
        const newItemArrayPaths = updatedItemArrayPaths.filter(
            path => !currentItemArrayPaths.some(p => p.join('.') === path.join('.'))
        );

        for (const newPathItemArrayPath of newItemArrayPaths) {
            // we can only convert if the timestamp is higher than the current timestamp
            const currentTimestamp =
                get(this.timestampObj, newPathItemArrayPath) ?? initTimestamp();
            if (compareTimestamps(currentTimestamp, timestamp)) {
                continue;
            }
            const itemArrayPatch = itemArrayToObject(get(data, newPathItemArrayPath));
            setWith(this.timestampObj, newPathItemArrayPath, { _order: timestamp }, Object);
            setWith(this.dataObj, newPathItemArrayPath, { _order: itemArrayPatch._order }, Object);
        }

        // translate item array patch to internal representation
        for (const itemArrayPath of updatedItemArrayPaths) {
            // convert to internal representation
            const itemArrayPatch = get(data, itemArrayPath);
            const itemArrayObject = itemArrayToObject(itemArrayPatch);
            setWith(data, itemArrayPath, itemArrayObject, Object);
        }

        iterateObjectPaths(data, path => {
            const value = get(data, path);
            this.upsertValue(path, value, timestamp);
        });
    }

    data(): O {
        const pathToItemArrays = getItemArrayPathsFromData(this.dataObj);
        const data = cloneDeep(this.dataObj);
        for (const path of pathToItemArrays) {
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
