import DOMPurify from 'isomorphic-dompurify';
import { createPermanentMemoizer } from './memoizer';

const allowedTagsMemoizer = createPermanentMemoizer(
    (key: string) => key,
    allowedTagsString => allowedTagsString.toLowerCase().slice(1, -1).split('><').sort()
);

const resultsMemoizer = createPermanentMemoizer(
    (key: { input: unknown; allowedTags: string[] }) => JSON.stringify(key),
    ({ input, allowedTags }) =>
        // Implementation of DOMPurify accepts anything,
        // and we need to accept anything too, according to tests
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        DOMPurify.sanitize(input as any, {
            ALLOWED_TAGS: allowedTags,
            ADD_ATTR: ['target'],
            FORCE_BODY: true // Makes sure that top-level SCRIPT tags are kept if explicitly allowed.
        })
);

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
].sort();

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

const getAllowedTags = (allowedTagsInput?: string | string[]) => {
    if (typeof allowedTagsInput === 'string') {
        return allowedTagsMemoizer.get(allowedTagsInput);
    }

    if (!allowedTagsInput) {
        return DEFAULT_ALLOWED;
    }

    return [...allowedTagsInput].sort();
};

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
function purifyHTML(input: string, allowed?: string[]): string;
/**
 * @deprecated
 */
function purifyHTML(input: string, allowed: string): string;
/**
 * @deprecated
 */
function purifyHTML(input: unknown): unknown;
function purifyHTML(input: unknown, allowedInput?: string | string[]) {
    if (!input) {
        return input;
    }

    const allowedTags = getAllowedTags(allowedInput);

    return resultsMemoizer.get({ allowedTags, input });
}

export = purifyHTML;
