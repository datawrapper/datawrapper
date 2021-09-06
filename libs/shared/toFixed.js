import tailLength from './tailLength.js';

/**
 * Automatically converts a numeric value to a string. this is better
 * than the default number to string conversion in JS which sometimes
 * produces ugly strings like "3.999999998"
 *
 * @exports toFixed
 * @kind function
 *
 * @example
 * import toFixed from '@datawrapper/shared/toFixed';
 * // returns '3.1'
 * toFixed(3.100001)
 *
 * @param {number} value
 * @returns {string}
 */
export default function toFixed(value) {
    return (+value).toFixed(tailLength(value));
}
