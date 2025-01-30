import set from 'lodash/set.js';
import cloneDeep from 'lodash/cloneDeep.js';
import { iterateObjectPaths } from './objectPaths.js';

/**
 * Deeply clones and iterates over the `obj`'s values and replaces all occurrences of `from` with `to`. Does not mutate the original object.
 */
function mapObjectValues<O extends object, F, T>(obj: O, from: F, to: T): O {
    const target = cloneDeep(obj);
    iterateObjectPaths(target, (path, value) => {
        if (value === from) {
            set(target, path, to);
        }
    });
    return target;
}

export default mapObjectValues;

/**
 * Deeply clones and iterates over the `obj`'s values and replaces all occurrences of `null` with `undefined`. Does not mutate the original object.
 */
export function mapNullToUndefined<O extends object>(obj: O): O {
    return mapObjectValues(obj, null, undefined);
}
/**
 * Deeply clones and iterates over the `obj`'s values and replaces all occurrences of `undefined` with `null`. Does not mutate the original object.
 */
export function mapUndefinedToNull<O extends object>(obj: O): O {
    return mapObjectValues(obj, undefined, null);
}
