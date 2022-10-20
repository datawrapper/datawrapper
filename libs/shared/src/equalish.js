/**
 * returns true if two numeric values are close enough
 *
 * @exports equalish
 * @kind function
 *
 * @param {number} a
 * @param {number} b
 *
 * @example
 * // returns true
 * equalish(0.333333, 1/3)
 *
 * @example
 * // returns false
 * equalish(0.333, 1/3)
 *
 * @export
 * @returns {boolean}
 */
export default function equalish(a, b) {
    return Math.abs(a - b) < 1e-6;
}
