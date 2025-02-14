/**
 * This file contains utility functions for array manipulation.
 */

import { remove } from 'lodash-es';

/**
 * Move an item to the start of an array based on a predicate.
 * @param array - The array to modify.
 * @param predicate - All items matching the predicate will be moved to the start of the array, preserving their internal order.
 */
export function moveToStart<T>(array: T[], predicate: (item: T) => boolean) {
    const matches = remove(array, predicate);
    array.unshift(...matches);
}
