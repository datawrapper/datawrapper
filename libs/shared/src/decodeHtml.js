/**
 * Removes all html tags and decodes html entities like &nbsp;
 *
 * @exports decodeHtml
 * @kind function
 *
 * @param {string} input
 * @returns {string}
 */
export default function decodeHtml(input) {
    return new DOMParser().parseFromString(input, 'text/html').documentElement.textContent;
}
