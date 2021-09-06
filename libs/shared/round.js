/**
 * rounds a value to a certain number of decimals
 *
 * @exports round
 * @kind function
 *
 * @example
 * import round from '@datawrapper/shared/round';
 * round(1.2345); // 1
 * round(1.2345, 2); // 1.23
 * round(12345, -2); // 12300
 *
 * @param {number} value - the value to be rounded
 * @param {number} decimals - the number of decimals
 * @returns {number} - rounded value
 */
export default function round(value, decimals = 0) {
    const base = Math.pow(10, decimals);
    return Math.round(value * base) / base;
}
