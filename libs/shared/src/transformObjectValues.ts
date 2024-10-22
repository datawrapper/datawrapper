import set from 'lodash/set.js';
import { iterateObjectPaths } from './objectPaths.js';

/**
 * Deeply iterates over the `obj`'s values and replaces all occurrences of `from` with `to`
 */
function transformObjectValues<O extends object, F, T>(obj: O, from: F, to: T): O {
    iterateObjectPaths(obj, (path, value) => {
        if (value === from) {
            set(obj, path, to);
        }
    });
    return obj;
}

export default transformObjectValues;

/**
 * Deeply iterates over the `obj`'s values and replaces all occurrences of `null` with `undefined`
 */
export function nullsToUndefined<O extends object>(obj: O): O {
    return transformObjectValues(obj, null, undefined);
}
/**
 * Deeply iterates over the `obj`'s values and replaces all occurrences of `undefined` with `null`
 */
export function undefinedToNull<O extends object>(obj: O): O {
    return transformObjectValues(obj, undefined, null);
}
