/**
 * Shorten a string by removing characters from the middle
 *
 * @exports truncate
 * @kind function
 *
 * @example
 * import truncate from '@datawrapper/shared/truncate';
 * // returns 'This is a…tring'
 * truncate('This is a very very long string')
 *
 * @param {string} str
 * @param {number} start - characters to keep at start of string
 * @param {number} end - characters to keep at end off string
 * @returns {string}
 */
function truncate(str: string, start?: number, end?: number): string;
function truncate<T>(str: T): T;
function truncate(str: string, start = 11, end = 7) {
    if (typeof str !== 'string') return str;
    if (str.length < start + end + 3) return str; // Add 3 to make sure the truncated string is always visually shorter than the original.
    return str.substring(0, start).trim() + '…' + str.substring(str.length - end).trim();
}

export default truncate;
