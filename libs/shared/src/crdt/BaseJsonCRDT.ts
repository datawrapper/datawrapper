import cloneDeep from 'lodash/cloneDeep.js';
import get from 'lodash/get.js';
import setWith from 'lodash/setWith.js';
import omit from 'lodash/omit.js';
import isObject from 'lodash/isObject.js';
import has from 'lodash/has.js';
import isEmpty from 'lodash/isEmpty.js';
import { ItemArray, Clock, Timestamp, Timestamps } from './Clock.js';
import { iterateObjectPaths } from '../objectPaths.js';
import isPrimitive from '../isPrimitive.js';
import { Diff } from './CRDT.js';
import isEqual from 'lodash/isEqual.js';

export type SerializedBaseJsonCRDT<O extends object> = {
    data: O;
    timestamps: Timestamps<O>;
    pathToItemArrays: string[];
};

function isActualObject(value: unknown) {
    return isObject(value) && !Array.isArray(value) && value !== null && !(value instanceof Date);
}

function isEmptyObject(value: unknown) {
    return isActualObject(value) && Object.keys(value as object).length === 0;
}

function isNonEmptyObject(value: unknown) {
    return isActualObject(value) && Object.keys(value as object).length > 0;
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
        setWith(
            obj,
            [item.id],
            {
                ...item,
                _index: index
            },
            Object
        );
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

/**
CRDT implementation using a single counter to track updates.
It only has one update method which takes a data diff and an associated timestamp.
The user has to keep track of the counter themselves, outside of this class.
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
        iterateObjectPaths(newData, path => {
            const pathString = path.join('.');
            if (ignorePaths && ignorePaths.has(pathString)) {
                return;
            }
            let newValue = get(newData, path);
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
                if (new Date(oldValue).getTime() === new Date(newValue).getTime()) {
                    return;
                }
            }

            setWith(diff, path, newValue, Object);
        });

        // handle deletes
        iterateObjectPaths(oldData, path => {
            const oldValue = get(oldData, path);
            if (isEmptyObject(oldValue)) {
                // we do not delete empty objects
                return;
            }
            if (!has(newData, path)) {
                setWith(diff, path, null, Object);
            }
        });

        return diff;
    }

    private dataObj: O;
    private timestampObj: Timestamps<O>;
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
        if (!timestamps && !pathToItemArrays) {
            // case where we are initializing from scratch
            this.timestampObj = {} as Timestamps<O>;
            this.dataObj = this.initData(cloneDeep(data));
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
    private initData(data: O) {
        iterateObjectPaths(data, path => {
            let value = get(data, path);

            if (value === null) {
                // filter out null values
                data = omit(data, path.join('.')) as O;
                return;
            }

            if (isItemArray(value)) {
                value = itemArrayToObject(value);
                this.pathToItemArrays.add(path.join('.'));
            }

            setWith(data, path, value, Object);
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
            throw new Error(
                `Updating object with primitive value is currently not supported. Updating path: ${path.join(
                    '.'
                )}`
            );
        }
        return new Clock(timestamp);
    }

    private insertEmptyObject(path: string[]) {
        const currentValue = get(this.dataObj, path);
        if (currentValue !== undefined && isNonEmptyObject(currentValue)) {
            // path already leads to an existing object, no need to do anything
            return;
        }
        if (currentValue !== undefined && isPrimitive(currentValue)) {
            throw new Error('Updating a primitive value with an object is not supported.');
        }
        setWith(this.dataObj, path, {}, Object);
    }

    /**
     * Upserts a value in the data object if the timestamp is higher than the current timestamp.
     * @param path path to the value in the data object
     * @param value the value to upsert
     * @param timestamp the timestamp assosciated with the value
     */
    private upsertValue(path: string[], value: unknown, timestamp: Timestamp) {
        if (isEmptyObject(value)) {
            this.insertEmptyObject(path);
            return;
        }

        const currentTimestamp = this.getTimestamp(path);
        const isArrayIndex = path[path.length - 1] === '_index';
        if (isArrayIndex) {
            if (value === null) {
                // deletes over everything
                setWith(this.dataObj, path, null, Object);
                return;
            }
            if (get(this.dataObj, path) === null) {
                // do not update if the item has been deleted
                return;
            }
        }
        if (!currentTimestamp.isOlderThan(timestamp)) return;

        if (value === null) {
            const currentValue = get(this.dataObj, path);
            if (isActualObject(currentValue)) {
                if (this.pathToItemArrays.has(path.join('.'))) {
                    // we are trying to delete an item array, that's not allowed
                    // instead we set the item array to an empty array
                    Object.keys(currentValue).forEach(key => {
                        const itemKeyPaths = [...path, key, '_index'];
                        this.upsertValue(itemKeyPaths, null, timestamp);
                    });
                    return;
                }
                throw new Error(
                    `Updating object with primitive value is currently not supported. Updating path: ${path.join(
                        '.'
                    )}`
                );
            }
            this.dataObj = omit(this.dataObj, path.join('.')) as O;
            // if we deleted the only nested key of an object, keep the parent object
            const parentPath = [...path].slice(0, path.length - 1);
            const parentValue = get(this.dataObj, parentPath);
            if (parentValue === undefined) {
                setWith(this.dataObj, parentPath, {}, Object);
            }
        } else {
            setWith(this.dataObj, path, value, Object);
        }
        setWith(this.timestampObj, path, timestamp, Object);
    }

    /**
     * Updates the CRDT with the given data diff and timestamp.
     * @param diff The data diff to apply
     * @param timestamp The timestamp assosicated with the data diff
     */
    update(diff: Diff<O>, timestampOrClock: Clock | Timestamp) {
        const timestamp =
            timestampOrClock instanceof Clock ? timestampOrClock.timestamp : timestampOrClock;

        iterateObjectPaths(diff, path => {
            const searchPath = [...path];
            if (searchPath.pop() === '_index') {
                searchPath.pop();
                const pathString = searchPath.join('.');
                if (!this.pathToItemArrays.has(pathString)) {
                    // new item array
                    const currentValue = get(this.dataObj, pathString);
                    if (currentValue !== undefined && !isEqual(currentValue, [])) {
                        throw new Error('Item array created at existing path');
                    }
                    setWith(this.dataObj, pathString, {}, Object);
                    this.pathToItemArrays.add(pathString);
                }
            }
        });

        iterateObjectPaths(diff, path => {
            const updatedValue = get(diff, path);
            try {
                this.upsertValue(path, updatedValue, timestamp);
            } catch (e) {
                const currentValue = get(this.dataObj, path);
                console.error('Error while updating CRDT', {
                    updatedValue,
                    path,
                    timestamp,
                    currentValue
                });
                throw e;
            }
        });
    }

    data(): O {
        const data = cloneDeep(this.dataObj);
        for (const path of this.pathToItemArrays) {
            const itemArrayObject: ItemArrayObject = get(data, path);
            const itemArray = this.objectToItemArray(itemArrayObject, path);
            setWith(data, path, itemArray, Object);
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
