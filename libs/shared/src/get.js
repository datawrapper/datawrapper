/**
 * Safely access object properties without throwing nasty
 * `cannot access X of undefined` errors if a property along the
 * way doesn't exist.
 *
 * @exports get
 * @kind function
 *
 *
 * @param object - the object which properties you want to acccess
 * @param {String|String[]} key - path to the property as a dot-separated string or array of strings
 * @param {*} _default - the fallback value to be returned if key doesn't exist
 *
 * @returns the value
 *
 * @example
 * import get from '@datawrapper/shared/get';
 * const someObject = { key: { list: ['a', 'b', 'c']}};
 * get(someObject, 'key.list[2]') // returns 'c'
 * get(someObject, 'missing.key') // returns undefined
 * get(someObject, 'missing.key', false) // returns false
 */
export default function get(object, key = null, _default = null) {
    if (!key) return object;
    const keys = Array.isArray(key) ? key : key.split('.');
    let pt = object;

    for (let i = 0; i < keys.length; i++) {
        if (pt === null || pt === undefined) break; // break out of the loop
        // move one more level in
        pt = pt[keys[i]];
    }
    return pt === undefined || pt === null ? _default : pt;
}
