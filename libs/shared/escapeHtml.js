/**
 * returns escaped HTML that can be used to display untrusted content
 * @exports escapeHtml
 * @kind function
 *
 * @param {string} unsafe
 * @returns {string}
 */
export default function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
