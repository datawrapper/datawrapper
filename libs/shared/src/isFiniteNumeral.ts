import isSymbol from 'lodash/isSymbol.js';

/**
 * Checks if a value is a number or can be converted to a number.
 * Equivalent to underscore's `isFinite` function since lodash's
 * `isFinite` function doesn't try to convert the value to a number first.
 * @see https://github.com/jashkenas/underscore/blob/master/modules/isFinite.js
 *
 * @param value - the value to check
 * @returns true if the value is a number or can be converted to a number
 */
export default function isFiniteNumeral(value: unknown): value is number {
    return !isSymbol(value) && isFinite(value as number) && !isNaN(parseFloat(value as string));
}
