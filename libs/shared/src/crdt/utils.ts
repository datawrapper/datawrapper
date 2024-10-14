import setWith from 'lodash/setWith.js';
import isObject from 'lodash/isObject.js';
import { iterateObjectPaths } from '../objectPaths.js';
import { ItemArray, ItemArrayObject, Timestamps, NewTimestamps, HasId } from './types.js';

export function isDeleteOperator(value: unknown) {
    return value === null || value === undefined;
}

export function isActualObject(value: unknown) {
    return isObject(value) && !Array.isArray(value) && value !== null && !(value instanceof Date);
}

export function isEmptyObject(value: unknown) {
    return isActualObject(value) && Object.keys(value as object).length === 0;
}

export function isNonEmptyObject(value: unknown) {
    return isActualObject(value) && Object.keys(value as object).length > 0;
}

export function isAtomic(value: unknown) {
    return !isActualObject(value);
}

export function isExistingAtomicValue(value: unknown) {
    return isAtomic(value) && value !== undefined;
}

export function isPathToItemArrayIndex(path: string[]) {
    return path[path.length - 1] === '_index';
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

export function migrateTimestamps<O extends object>(
    timestamps: Timestamps<O> | NewTimestamps<O>
): NewTimestamps<O> {
    // Convert old structure to new structure
    // old: { a: '1-3', b: { _self: '1-3', c: '1-3' } }
    // new { a: { _timestamp: '1-3' }, b: { _timestamp: '1-3', c: { _timestamp: '1-3' } } }

    const newTimestamps: NewTimestamps<O> | Record<string, never> = {};

    iterateObjectPaths(timestamps, (path, value) => {
        const isMigrated = path[path.length - 1] === '_timestamp';
        if (isMigrated) {
            set(newTimestamps, path, value);
            return;
        }

        const isSelf = path[path.length - 1] === '_self';

        if (isSelf) {
            set(newTimestamps, path.slice(0, -1).concat('_timestamp'), value);
        } else {
            set(newTimestamps, path.concat('_timestamp'), value);
        }
    });

    return newTimestamps as NewTimestamps<O>;
}

export function hasId(item: unknown): item is HasId {
    return (
        isObject(item) &&
        'id' in item &&
        (typeof item.id === 'string' || typeof item.id === 'number')
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
            _index: index
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
