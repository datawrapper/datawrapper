/**
 * Returns escaped HTML that can be used to display untrusted content.
 *
 * @exports escapeHtml
 * @kind function
 *
 * @param {string} unsafe
 * @returns {string}
 */
export = function escapeHtml(unsafe: string) {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};
