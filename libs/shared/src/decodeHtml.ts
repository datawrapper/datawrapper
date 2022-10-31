/**
 * Removes all html tags and decodes html entities like &nbsp;
 *
 * @exports decodeHtml
 * @kind function
 *
 * @param {string} input
 * @returns {string}
 */
export = function decodeHtml(input: string) {
    return new DOMParser().parseFromString(input, 'text/html').documentElement.textContent;
};
