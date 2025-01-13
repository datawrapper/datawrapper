import isEmpty from 'lodash/isEmpty.js';
import isEqual from 'lodash/isEqual.js';
import get from 'lodash/get.js';
import has from 'lodash/has.js';
import { iterateObjectPaths } from '../objectPaths.js';
import {
    pathArrayToString,
    isDeleteOperator,
    set,
    isActualObject,
    generateRandomId,
    hasId,
} from './utils.js';
import { ItemArrayObjectItem, ItemArrayDiff, CalculateDiffOptions } from './types.js';

export function calculateDiff(
    oldData: object,
    newData: object,
    options?: CalculateDiffOptions
): Record<string, unknown> {
    const allowedKeys = options?.allowedKeys ?? null;
    const ignorePaths = options?.ignorePaths ?? null;
    const pathsToItemArrays =
        options?.pathsToItemArrays instanceof Set
            ? options.pathsToItemArrays
            : new Set(options?.pathsToItemArrays ?? []);
    const diff = {};

    // Handle updates from the new data.
    iterateObjectPaths(newData, (path, newValue) => {
        const pathString = pathArrayToString(path);

        if (ignorePaths && ignorePaths.has(pathString)) {
            // Path should be ignored.
            return;
        }

        const oldValue = get(oldData, path);

        if (isEqual(newValue, oldValue)) {
            // Value did not change.
            return;
        }

        if (allowedKeys && !allowedKeys.has(path[0])) {
            // Root key of the path is allowed.
            return;
        }

        const isNewInsert = !has(oldData, path);
        if (isDeleteOperator(newValue) && isNewInsert) {
            // Delete order on non-existing value is redundant.
            return;
        }

        // Handle item arrays
        if (pathsToItemArrays.has(pathString)) {
            if (!Array.isArray(newValue)) {
                // Item arrays cannot be updated directly with non-array values, so we just ignore the change.
                return;
            }

            newValue = calculateItemArrayDiff(oldValue, newValue);
            // If array diff is empty don't set anything
            if (isEmpty(newValue)) {
                return;
            }
        }

        if (oldValue instanceof Date !== newValue instanceof Date) {
            // We don't care about Date <-> string conversion if their values are the same.
            if (
                new Date(oldValue).getTime() ===
                new Date(newValue as string | number | Date).getTime()
            ) {
                return;
            }
        }

        set(diff, path, newValue);
    });

    // This map keeps track of ancestors that were deleted in the new data.
    // We want to delete these ancestors in the diff by setting them to null.
    // However, in case the ancestor contains a nested item array,
    // we cannot just set it to null, because that would delete the item array.
    // And we don't want to delete item arrays, so that we keep track of which item array elements have been deleted before.
    // Therefore, we only set the ancestor to null if it does not contain nested item arrays.
    // If it does, we explicitly delete each child of the ancestor and each element of the item array instead.
    // Note: we use a Map and not a Set to ensure that we use the correct path if a path element contains '.' characters.
    const ancestorPaths = new Map<string, string[]>();

    // Handle deletes of old data that are not present in the new data.
    iterateObjectPaths(oldData, (path, oldValue) => {
        const pathString = pathArrayToString(path);

        if (ignorePaths && ignorePaths.has(pathString)) {
            // Path should be ignored.
            return;
        }

        if (has(newData, path)) {
            // Path is present in the new data, so we don't need to delete it.
            return;
        }

        let closestNewValue = null;
        let ancestorPath = [...path];
        const poppedParts: string[] = [];

        // Find the closest ancestor with a value in the new data.
        while (ancestorPath.length > 0 && isDeleteOperator(closestNewValue)) {
            closestNewValue = get(newData, ancestorPath);

            // Only manipulate the path if we didn't find a value.
            if (isDeleteOperator(closestNewValue)) {
                poppedParts.unshift(ancestorPath.pop() as string);
            }
        }

        // Ensure the path is not empty.
        if (!ancestorPath.length) {
            ancestorPath = [poppedParts[0]];
        }

        const ancestorWasDeleted = closestNewValue === undefined;

        // Handle item arrays.
        if (pathsToItemArrays.has(pathString)) {
            const itemArrayDiff = calculateItemArrayDiff(oldValue, []);

            if (!isEmpty(itemArrayDiff)) {
                // `oldValue` is an item array which has been deleted.
                // Since item arrays cannot be deleted, we update the diff to contain explicit deletes of each item
                // contained in the item array at that point.
                set(diff, path, itemArrayDiff);
            }

            // Since the item array cannot be fully deleted, we update `newData` to reflect that:
            // After applying the diff, the item array would be empty.
            // Hence, we set the path at `newData` to an empty array.
            // This is required so that the ancestor is not deleted in further iterations.
            // This always needs to happen regardless of the item array diff.
            set(newData, path, []);

            // We now know that the ancestor possibly marked for deletion cannot be deleted
            // because it contains an item array. We therefore remove it from the `ancestorPaths` map.
            ancestorPaths.delete(pathArrayToString(ancestorPath));
        }
        // Mark the ancestor for deletion if it was deleted in the new data and set the child to null.
        // The ancestor will only be fully deleted if it does not contain a nested item array.
        else if (ancestorWasDeleted) {
            set(diff, path, null);
            ancestorPaths.set(pathArrayToString(ancestorPath), ancestorPath);
        }
        // Simply delete the path if the ancestor was not deleted.
        else if (isActualObject(closestNewValue)) {
            set(diff, path, null);
        }
    });

    // Delete ancestors that were deleted in the new data and do not contain nested item arrays.
    ancestorPaths.forEach(path => {
        set(diff, path, null);
    });

    return diff;
}

/**
 * Calculate the diff between two item arrays. Item Arrays are arrays of objects with a unique ID property.
 * Thereby, items of the source array can be matched with items of the target array by their ID, which allows merging updates and deletions.
 * @param sourceArray The source array
 * @param targetArray The target array
 * @returns The diff object that represents the changes that are required to be performed to get from the source to the target array.
 */
function calculateItemArrayDiff(sourceMaybeArray: unknown, targetArray: object[]): ItemArrayDiff {
    const sourceArray = Array.isArray(sourceMaybeArray) ? sourceMaybeArray : [];

    const sourceItems: Map<ItemArrayObjectItem['id'], ItemArrayObjectItem> = new Map(
        sourceArray.filter(hasId).map((item, index) => [
            item.id,
            {
                ...item,
                _index: index, // calculate index so that we can compare whether or not the position has changed
            },
        ])
    );

    const diff: ItemArrayDiff = {};

    const targetIds = new Set();
    for (let i = 0; i < targetArray.length; i++) {
        const targetItemRaw = targetArray[i];

        // Ignore non-object items
        if (!isActualObject(targetItemRaw)) {
            continue;
        }

        const targetItem: ItemArrayObjectItem = {
            ...targetItemRaw,
            // Generate a random ID if the item does not have one.
            id:
                hasId(targetItemRaw) && !targetIds.has(targetItemRaw.id)
                    ? targetItemRaw.id
                    : generateRandomId(),
            // Already create updated _index so that updates are calculated as part of objectDiff
            _index: i,
        };
        targetIds.add(targetItem.id);

        // Array item is new
        if (!sourceItems.has(targetItem.id)) {
            diff[targetItem.id] = targetItem;
            continue;
        }
        const sourceItem = sourceItems.get(targetItem.id);

        // Remove from source items so that we can check for deleted items later
        sourceItems.delete(targetItem.id);

        const itemDiff = calculateDiff(sourceItem || {}, targetItem);
        if (!isEmpty(itemDiff)) {
            diff[targetItem.id] = itemDiff;
        }
    }

    // All items remaining in source items can be seen as deleted
    for (const [id] of sourceItems) {
        // Items are deleted by setting _index to null
        diff[id] = {
            _index: null,
        };
    }

    return diff;
}
