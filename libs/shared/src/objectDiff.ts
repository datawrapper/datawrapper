import pick from 'lodash/pick.js';
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
 * @param {object} options - options to configure the behaviour of the objectDiff calculation
 *     Useful if you want to e.g. modify the behaviour of how array diffs are calculated.
 *
 * @returns {object} - the merge patch
 */
export default function objectDiff<TSource, TTarget>(
    source: TSource,
    target: TTarget,
    allowedKeys: ((keyof TSource | keyof TTarget) & string)[] | null = null,
    options: { diffArray?: DiffArrayFn } | null = null
) {
    return diffKeys(source, target, allowedKeys ? new Set(allowedKeys) : null, options);
}

type DiffArrayFn = (source: unknown[], target: unknown[]) => any;

/**
 * @param {object} source - the source object
 * @param {object} target - the target object
 * @param {Set|null} allowedKeys - Set
 *
 * @returns {object} - the merge patch
 */
// It is impractical to try to replicate signature types in implementation
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function diffKeys(
    source: any,
    target: any,
    allowedKeys: Set<string> | null = null,
    options: { diffArray?: DiffArrayFn } | null = null
) {
    const patch: Record<string, unknown> = {};
    for (const targetKey of Object.keys(target)) {
        if (!isEqual(target[targetKey], source[targetKey])) {
            if (allowedKeys && !allowedKeys.has(targetKey)) continue;
            if (isPlainObject(target[targetKey]) && isPlainObject(source[targetKey])) {
                // iterate one level down - allowedKeys are ignored, options are passed down
                const childPatch = diffKeys(source[targetKey], target[targetKey], null, options);
                if (childPatch && Object.keys(childPatch).length) {
                    patch[targetKey] = childPatch;
                }
            } else if (Array.isArray(target[targetKey]) && Array.isArray(source[targetKey])) {
                const diffArrayFn = options?.diffArray || diffArrays;
                patch[targetKey] = diffArrayFn(source[targetKey], target[targetKey]);
            } else {
                patch[targetKey] = target[targetKey];
            }
        }
    }
    // also look for removed keys and set them null
    for (const sourceKey of Object.keys(source)) {
        if (allowedKeys && !allowedKeys.has(sourceKey)) continue;
        if (target[sourceKey] === undefined) {
            patch[sourceKey] = null;
        }
    }
    return patch;
}

/**
 * Creates a merge patch for two arrays.
 * Patches are created differently depending or not if the array items have an `id` property.
 * If they do, the patch will be an array of objects with `id` and the changed properties.
 * If they don't, the patch will be the new array.
 * @param {array} sourceArray - the source array
 * @param {array} targetArray - the target array
 * @returns {array} - the merge patch
 */
function diffArrays(sourceArray: any[], targetArray: any[]) {
    const sourceItems = new Map(
        sourceArray.filter(item => !!item?.id).map(item => [item.id, item])
    );
    let patch = [];
    for (const targetItem of targetArray) {
        if (!sourceItems.has(targetItem?.id)) {
            // array item is new
            patch.push(targetItem);
            continue;
        }
        const sourceItem = sourceItems.get(targetItem.id);
        if (isEqual(targetItem, sourceItem)) {
            // array item is unchanged
            patch.push(pick(targetItem, ['id']));
            continue;
        }
        patch.push({ id: targetItem.id, ...diffKeys(sourceItem, targetItem) });
    }
    if (patch.length < targetArray.length) {
        // Handle deletions or order changes
        patch = targetArray;
    }
    return patch;
}
