/**
 * returns the length of the "tail" of a number, meaning the
 * number of meaningful decimal places
 *
 * @exports tailLength
 * @kind function
 *
 * @example
 * // returns 3
 * tailLength(3.123)
 *
 * @example
 * // returns 2
 * tailLength(3.12999999)
 *
 * @param {number} value
 * @returns {number}
 */
export default function tailLength(value) {
    return Math.max(
        0,
        String(value - Math.floor(value))
            .replace(/00000*[0-9]+$/, '')
            .replace(/33333*[0-9]+$/, '')
            .replace(/99999*[0-9]+$/, '').length - 2
    );
}
