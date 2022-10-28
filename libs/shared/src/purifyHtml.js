import DOMPurify from 'isomorphic-dompurify';

const cache = new Map();

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

    const allowedKey = JSON.stringify(Array.isArray(allowed) ? allowed.sort() : allowed);
    const inputKey = JSON.stringify(input);

    if (typeof allowed === 'string') {
        if (cache.has(allowedKey)) {
            allowed = cache.get(allowedKey);
        } else {
            allowed = Array.from(allowed.toLowerCase().matchAll(/<([a-z][a-z0-9]*)>/g)).map(
                m => m[1]
            );
            cache.set(allowedKey, allowed);
        }
    }

    const key = `${inputKey}-${allowedKey}`;

    if (cache.has(key)) {
        return cache.get(key);
    }

    const result = DOMPurify.sanitize(input, {
        ALLOWED_TAGS: allowed,
        ADD_ATTR: ['target'],
        FORCE_BODY: true // Makes sure that top-level SCRIPT tags are kept if explicitly allowed.
    });

    cache.set(key, result);

    return result;
}
