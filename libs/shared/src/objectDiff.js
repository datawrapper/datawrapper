import isEqual from 'lodash/isEqual.js';
import isPlainObject from 'lodash/isPlainObject.js';

/**
 * Recursively compares two objects and returns the
 * "merge patch" object which can be deep-assigned to
 * the source to create the target
 *
 * @exports objectDiff
 * @kind function
 *
 * @example
 * import objectDiff from '@datawrapper/shared/objectDiff';
 * objectDiff({ foo: 1, bar: 'hello' }, { foo: 1, bar: 'world' });
 * // returns { bar: 'world' }
 *
 * @param {object} source - the original object
 * @param {object} target - the changed object
 * @param {array} allowedKeys - if given, the diff will
 *     ignore any first-level keys not in this array
 *
 * @returns {object} - the merge patch
 */
export default function objectDiff(source, target, allowedKeys = null) {
    return diffKeys(source, target, allowedKeys ? new Set(allowedKeys) : null);
}

/**
 * @param {object} source - the source object
 * @param {object} target - the target object
 * @param {Set|null} allowedKeys - Set
 *
 * @returns {object} - the merge patch
 */
function diffKeys(source, target, allowedKeys = null) {
    const patch = {};
    Object.keys(target).forEach(targetKey => {
        if (!isEqual(target[targetKey], source[targetKey])) {
            if (allowedKeys && !allowedKeys.has(targetKey)) return;
            if (isPlainObject(target[targetKey]) && isPlainObject(source[targetKey])) {
                // iterate one level down
                const childPatch = diffKeys(source[targetKey], target[targetKey]);
                if (Object.keys(childPatch).length) {
                    patch[targetKey] = childPatch;
                }
            } else {
                patch[targetKey] = target[targetKey];
            }
        }
    });
    // also look for removed keys and set them null
    Object.keys(source).forEach(sourceKey => {
        if (allowedKeys && !allowedKeys.has(sourceKey)) return;
        if (target[sourceKey] === undefined) {
            patch[sourceKey] = null;
        }
    });
    return patch;
}
