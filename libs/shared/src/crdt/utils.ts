import setWith from 'lodash/setWith.js';
import unset from 'lodash/unset.js';
import isObject from 'lodash/isObject.js';

import { iterateObjectPaths } from '../objectPaths.js';
import { ItemArray, ItemArrayObject, Timestamps, NewTimestamps, HasId } from './types.js';
import { TIMESTAMP_KEY } from './constants.js';

export function isDeleteOperator(value: unknown) {
    return value === null || value === undefined;
}

export function isActualObject(value: unknown): value is object {
    return isObject(value) && !Array.isArray(value) && value !== null && !(value instanceof Date);
}

export function isEmptyObject(value: unknown): value is object {
    return isActualObject(value) && Object.keys(value as object).length === 0;
}

export function isNonEmptyObject(value: unknown): value is object {
    return isActualObject(value) && Object.keys(value as object).length > 0;
}

export function isAtomic(value: unknown) {
    return !isActualObject(value);
}

export function isEmptyArray(value: unknown): value is [] {
    return Array.isArray(value) && value.length === 0;
}

export function isExistingAtomicValue(value: unknown) {
    return isAtomic(value) && value !== undefined;
}

export function isIndexPath(path: string[]) {
    return path[path.length - 1] === '_index';
}

export function isObjectArray(value: unknown): value is object[] {
    return Array.isArray(value) && value.every(isActualObject);
}
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

export function hasId(item: unknown): item is HasId {
    return (
        isObject(item) &&
        'id' in item &&
        ((typeof item.id === 'string' && !!item.id.length) || typeof item.id === 'number')
    );
}

/**
 * Converts an item array to an its internal object representation
 * Opposite function to objectToItemArray
 * @param arr the item array to convert
 * @returns object representation
 */
export function itemArrayToObject(arr: ItemArray): ItemArrayObject {
    const obj = {};
    let index = 0;
    for (const item of arr) {
        set(obj, [item.id.toString()], {
            ...item,
            _index: index,
        });
        index++;
    }
    return obj as ItemArrayObject;
}

export function set(obj: object, path: string[], value: unknown) {
    if (path.length === 0) return;

    if (typeof path === 'string') {
        throw new Error('Path must be an array of strings');
    }
    /**
     * Emulate the behaviour if the regular `lodash.set`, but don't create arrays for numeric keys.
     * Just using `Object` as the the customizer does not work as strings seem to get merged with objects
     * and result in `String` instances for some reason.
     * Lodash implementation: https://github.com/lodash/lodash/blob/c7c70a7da5172111b99bb45e45532ed034d7b5b9/src/.internal/baseSet.ts#L36-L40
     */
    setWith(obj, path, value, value => {
        if (isActualObject(value)) {
            return value;
        }

        return {};
    });
}

export function getUpdateType(value: unknown) {
    if (isDeleteOperator(value)) {
        return 'delete';
    }

    if (isAtomic(value)) {
        return 'atomic';
    }

    if (isActualObject(value)) {
        return 'object';
    }

    throw new Error('Unhandled update type!');
}

export function assertOneOf<T>(value: T, typeCheckers: ((value: T) => boolean)[]): void {
    if (typeCheckers.every(typeChecker => !typeChecker(value))) {
        throw new Error(`Unhandled value type: ${typeof value}!`);
    }
}

export function removeNullsFromObject<T extends object>(obj: T): T {
    iterateObjectPaths(obj, (path, value) => {
        const lastPathElement = path[path.length - 1];
        if (isDeleteOperator(value) && !(lastPathElement === '_index')) {
            unset(obj, path);
        }
    });
    return obj;
}

export function itemArrayPathFromIndexPath(path: string[]) {
    if (!isIndexPath(path)) throw new Error('Path is not an index path');
    return path.slice(0, -2);
}

export function isPathToItemArray(pathsToItemArrays: string[] | Set<string>, path: string[]) {
    const pathString = pathArrayToString(path);
    if (Array.isArray(pathsToItemArrays)) {
        return pathsToItemArrays.includes(pathString);
    }
    return pathsToItemArrays.has(pathString);
}

export function isPathToItemArrayItem(pathsToItemArrays: string[] | Set<string>, path: string[]) {
    const pathString = pathArrayToString(path);
    // check if any path to item arrays (+ dot) is the start of pathString
    return Array.from(pathsToItemArrays).some(itemArrayPath => {
        return (
            pathString.startsWith(itemArrayPath + '.') &&
            pathStringToArray(itemArrayPath).length + 1 === path.length
        );
    });
}

export function isPathToItemArrayAncestor(
    pathsToItemArrays: string[] | Set<string>,
    path: string[]
) {
    const pathString = pathArrayToString(path);
    return Array.from(pathsToItemArrays).some(itemArrayPath => {
        return (
            itemArrayPath.startsWith(pathString + '.') && // we need the dot here to prevent considering 'a' as an ancestor of 'aa'
            !isPathToItemArray(pathsToItemArrays, path)
        );
    });
}

/**
 * Assigns unique random ids to all elements of an object array. If an element already has a unique id, it is kept.
 * @param arr The array of objects to assign IDs to.
 * @returns The array with unique IDs assigned.
 */
export function setIdToArrayItems(arr: object[]): ItemArray {
    const usedIds = new Set();
    return arr.map(item => {
        if (!hasId(item) || usedIds.has(item?.id)) {
            (item as HasId).id = generateRandomId();
        }
        usedIds.add((item as HasId).id);
        return item;
    }) as ItemArray;
}

export function pathStringToArray(path: string): string[] {
    return path.split('.');
}
export function pathArrayToString(path: string[]): string {
    return path.join('.');
}

/**
 * Generates a unique random string.
 * We need to use a custom implementation because nanoid does not work in the CommonJS environment of our API,
 * and the CRDTs need to work in both the backend and on the client side.
 * @returns a random string of length 10
 */
export function generateRandomId(): string {
    return Math.random().toString(36).substring(2, 12);
}

/**
 * Returns the type of each property of an object.
 */
export function typeofObjectProperties(obj: object): Record<string, string> {
    const types: Record<string, string> = {};
    for (const [key, value] of Object.entries(obj)) {
        types[key] = typeof value;
    }
    return types;
}

/**
 * Returns a string representation of a value with its type.
 * This should be used when including a value in an error message.
 * @example valueWithType(1) // => '`1` (number)'
 */
export function valueWithType(value: unknown): string {
    let stringValue = value;
    if (typeof value === 'object') {
        stringValue = JSON.stringify(value);
    }
    return `\`${stringValue}\` (${typeof value})`;
}
