import { GetValueByPath, Paths } from './objectPaths';

const isArray = (value: unknown): value is unknown[] | Readonly<unknown[]> => Array.isArray(value);

/**
 * safely set object properties without throwing nasty
 * `cannot access X of undefined` errors if a property along the
 * way doesn't exist.
 *
 * @exports set
 * @kind function
 *
 * @param object - the object which properties you want to acccess
 * @param {String|String[]} key - path to the property as a dot-separated string or array of strings
 * @param {*} value - the value to be set
 *
 * @returns the value
 */
export = function set<TObj, TPath extends Paths<TObj>>(
    object: TObj,
    key: TPath,
    value: GetValueByPath<TObj, TPath>
) {
    const keys = isArray(key) ? [...key] : key.split('.');
    if (!keys.length) {
        throw new Error('Key should not be empty');
    }

    // `pop` will never return undefined, because `key` does not contain `undefined` values,
    // and we've just checked that `key` has elements.
    // However, TS does not narrow `key` type from "array of non-empty values" to
    // to "array of non-empty values with at least one value",
    // so `pop` always has `undefined` in its return type definition.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const lastKey = keys.pop()!;

    // It is impractical to try to replicate signature types in implementation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let pt: any = object;

    // resolve property until the parent dict
    keys.forEach(key => {
        if (pt[key] === undefined || pt[key] === null) {
            pt[key] = {};
        }
        pt = pt[key];
    });

    // check if new value is set
    if (JSON.stringify(pt[lastKey]) !== JSON.stringify(value)) {
        pt[lastKey] = value;
        return true;
    }
    return false;
};
