import numeral from 'numeral';
import { formatNumberSplitParts } from './formatNumberSplitParts.js';

/**
 * special number formatting that can deal with microtypography
 * and "prepend currencies" (e.g., −$1234.57)
 *
 * @exports formatNumber
 * @kind function
 *
 * @param {object} numeral - Numeral.js instance
 * @param {number} value - the number to format
 * @param {object} options - options, see below
 * @param {string} options.format - numeral.js compatible number format
 * @param {string} options.prepend - string to prepend to number
 * @param {string} options.append - string to append to number
 * @param {string} options.minusChar - custom character to use for minus
 * @param {number} options.multiply - multiply number before applying format
 *
 * @example
 * // returns '1234.57'
 * formatNumber(numeral, 1234.567)
 *
 * @example
 * // returns '−$1234.57'
 * formatNumber(numeral, -1234.567, { prepend: '$' })
 *
 * @export
 * @returns {string} - the formatted number
 */
function formatNumber(
    num: typeof numeral,
    value: number,
    options: formatNumber.FormatNumberOptions = {}
): string {
    const parts = formatNumberSplitParts(num, value, options);
    return `${parts.prefix}${parts.number}`;
}

// To export a type in addition to CommonJS-compatible default export of a function
// eslint-disable-next-line @typescript-eslint/no-namespace
namespace formatNumber {
    export type FormatNumberOptions = {
        format?: string;
        prepend?: string;
        append?: string;
        minusChar?: string;
        multiply?: number;
        plusMinusChar?: string;
    };
}

export default formatNumber;
