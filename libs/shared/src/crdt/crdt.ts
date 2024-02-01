import cloneDeep from 'lodash/cloneDeep.js';
import get from 'lodash/get.js';
import setWith from 'lodash/setWith.js';
import { ItemArray, Clock, Timestamp, Timestamps } from './clock.js';
import { iterateObjectPaths } from '../objectPaths.js';
import objectDiff from '../objectDiff.js';
import isObject from 'lodash/isObject.js';
import { isEmpty } from 'underscore';

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
        setWith(
            obj,
            [item.id],
            {
                ...item,
                // mark deleted items by using index null
                _index: index
            },
            Object
        );
        index++;
    }
    return obj as ItemArrayObject;
}

export type Patch = {
    timestamp: Timestamp | Clock;
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
    // @typescript-eslint/no-unused-vars
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
export class CRDT<O extends object = object> {
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
    private timestampObj: Timestamps<O>;
    private pathToItemArrays = new Set<string>();
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
    constructor(data: O, timestamps?: Timestamps<O>) {
        this.dataObj = this.initData(cloneDeep(data));
        this.timestampObj = timestamps ?? ({} as Timestamps<O>);
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
                this.pathToItemArrays.add(path.join('.'));
            }
            setWith(data, path, patchValue, Object);
        });
        return data;
    }

    /**
     * Converts internal object representation of an item array back to an item array
     * Opposite function to objectToItemArray
     * @param obj the object to convert
     * @returns item array
     */
    private objectToItemArray(obj: ItemArrayObject, path: string): ItemArray {
        return (
            Object.values(obj)
                // remove "deleted" items
                .filter(item => item._index !== null && item._index !== undefined)
                // TODO: remove the undefined check once the API properly sets null values
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
        if (!timestamp || (typeof timestamp === 'object' && path.length != searchPath.length - 1)) {
            return new Clock();
        }
        if (typeof timestamp === 'object') {
            throw new Error('Updating object with primitive value is currently not supported.');
        }
        return new Clock(timestamp);
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
        if (!currentTimestamp.isOlderThan(timestamp)) return;

        setWith(this.dataObj, path, value, Object);
        setWith(this.timestampObj, path, timestamp, Object);
        this.log.appliedUpdates += 1;
    }

    /**
     * Updates the CRDT with the given data patch and timestamp patch.
     * @param rawData The data patch to apply
     * @param timestamp The timestamp assosicated with the data patch
     */
    update(patch: object, timestamp: Clock | Timestamp) {
        if (timestamp instanceof Clock) {
            timestamp = timestamp.timestamp;
        }
        const timestampStr = timestamp;
        iterateObjectPaths(patch, path => {
            const searchPath = [...path];
            if (searchPath.pop() === '_index') {
                searchPath.pop();
                const pathString = searchPath.join('.');
                if (!this.pathToItemArrays.has(pathString)) {
                    // new item array
                    setWith(this.dataObj, pathString, {}, Object);
                    const currentTimestamp = this.getTimestamp(searchPath);
                    setWith(this.timestampObj, pathString, currentTimestamp, Object);
                }
                this.pathToItemArrays.add(pathString);
            }
        });
        iterateObjectPaths(patch, path => {
            const patchValue = get(patch, path);
            this.upsertValue(path, patchValue, timestampStr);
        });
    }

    data(): O {
        const data = cloneDeep(this.dataObj);
        for (const path of this.pathToItemArrays) {
            const itemArrayObject: ItemArrayObject = get(data, path);
            setWith(data, path, this.objectToItemArray(itemArrayObject, path), Object);
        }
        return data;
    }

    timestamps(): Timestamps<O> {
        return cloneDeep(this.timestampObj);
    }

    logs() {
        return { ...this.log, successRate: this.log.appliedUpdates / this.log.receivedUpdates };
    }
}
