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
export default function truncate(str, start = 11, end = 7) {
    if (typeof str !== 'string') return str;
    if (str.length < start + end + 3) return str;
    return str.substr(0, start).trim() + '…' + str.substr(str.length - end).trim();
}
