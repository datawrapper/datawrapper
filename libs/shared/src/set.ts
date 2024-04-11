import isObject from 'lodash/isObject.js';
import setWith from 'lodash/setWith.js';

const isArray = (value: unknown): value is unknown[] | Readonly<unknown[]> => Array.isArray(value);

/**
 * Safely set object properties without throwing nasty
 * `cannot access X of undefined` errors if a property along the
 * way doesn't exist.
 *
 * Key differences to `lodash/set` function:
 * - doesn't initialize arrays for missing numeric keys i.e. index properties
 * - doesn't add properties to string objects, but replaces them instead
 *
 * @exports set
 * @kind function
 *
 * @param object - the object which properties you want to acccess
 * @param {String|String[]} key - path to the property as a dot-separated string or array of strings
 * @param {*} value - the value to be set
 */
export default function set(object: object, key: string | string[], value: unknown) {
    const keys = isArray(key) ? [...key] : key.split('.');
    if (!keys.length) {
        throw new Error('Key should not be empty');
    }

    setWith(object as object, key, value, value => {
        // Emulate the behaviour of the regular `lodash.set`, but don't create arrays for numeric keys.
        // Just using `Object` as the the customizer does not work as strings seem to get merged with objects
        // and result in `String` instances for some reason.
        // Lodash implementation: https://github.com/lodash/lodash/blob/c7c70a7da5172111b99bb45e45532ed034d7b5b9/src/.internal/baseSet.ts#L36-L40
        if (isObject(value)) {
            return value;
        }
        return {};
    });
}
