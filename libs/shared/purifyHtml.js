import DOMPurify from 'dompurify';

const DEFAULT_ALLOWED = [
    'a',
    'span',
    'b',
    'br',
    'i',
    'strong',
    'sup',
    'sub',
    'strike',
    'u',
    'em',
    'tt'
];

/**
 * Set default TARGET and REL for A tags.
 *
 * Don't overwrite target="_self".
 */
DOMPurify.addHook('afterSanitizeElements', function (el) {
    if (el.nodeName.toLowerCase() === 'a') {
        if (el.getAttribute('target') !== '_self') {
            el.setAttribute('target', '_blank');
        }
        el.setAttribute('rel', 'nofollow noopener noreferrer');
    }
});

/**
 * Remove all HTML tags from given `input` string, except `allowed` tags.
 *
 * @exports purifyHTML
 * @kind function
 *
 * @param {string} input - dirty HTML input
 * @param {string} [string[]] - list of allowed tags; see DEFAULT_ALLOWED for the default value
 * @return {string} - the cleaned HTML output
 */
export default function purifyHTML(input, allowed = DEFAULT_ALLOWED) {
    if (!input) {
        return input;
    }
    if (typeof allowed === 'string') {
        allowed = Array.from(allowed.toLowerCase().matchAll(/<([a-z][a-z0-9]*)>/g)).map(m => m[1]);
    }
    return DOMPurify.sanitize(input, {
        ALLOWED_TAGS: allowed,
        ADD_ATTR: ['target'],
        FORCE_BODY: true // Makes sure that top-level SCRIPT tags are kept if explicitly allowed.
    });
}
