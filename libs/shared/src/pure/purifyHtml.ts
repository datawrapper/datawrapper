import { createPermanentMemoizer } from '../memoizer.js';

export const DEFAULT_ALLOWED = [
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
    'tt',
].sort();

const MEMOIZER_MAXSIZE = 100_000;

const memoizer = createPermanentMemoizer(
    (DOMPurify: typeof import('isomorphic-dompurify')) => DOMPurify.version,
    DOMPurify => {
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
                const noreferrer = el.getAttribute('rel')?.includes('noreferrer');
                el.setAttribute('rel', 'nofollow noopener' + (noreferrer ? ' noreferrer' : ''));
            }
        });
        return createPermanentMemoizer(
            (allowedTagsInput: string | string[] | undefined) => String(allowedTagsInput),
            allowedTagsInput => {
                const allowedTags =
                    allowedTagsInput === undefined
                        ? DEFAULT_ALLOWED
                        : typeof allowedTagsInput === 'string'
                          ? allowedTagsInput.toLowerCase().slice(1, -1).split('><')
                          : allowedTagsInput;
                const config = {
                    ALLOWED_TAGS: allowedTags,
                    ADD_ATTR: ['target'],
                    FORCE_BODY: true, // Makes sure that top-level SCRIPT tags are kept if explicitly allowed.
                };

                return createPermanentMemoizer(
                    (input: unknown) => input,
                    input => {
                        // Implementation of DOMPurify accepts anything,
                        // and we need to accept anything too, according to tests
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        return DOMPurify.sanitize(input as any, config);
                    },
                    { maxsize: MEMOIZER_MAXSIZE }
                );
            },
            { maxsize: MEMOIZER_MAXSIZE }
        );
    }
);

/**
 * Removes all HTML tags from given `input` string, except the ones in the `allowedTagsInput` list.
 *
 * @exports purifyHtml
 * @kind function
 *
 * @param {string} input - dirty HTML input
 * @param {string[]} [allowedTagsInput] - list of allowed tags; see DEFAULT_ALLOWED for the default value
 * @return {string} - the cleaned HTML output
 */
type PurifyHTML = (input: string, allowedTagsInput?: string | string[]) => string;
/**
 * Generates an instance of purifyHtml with DOMPurify already loaded.
 *
 * @exports purifyHtmlFactory
 * @kind function
 *
 * @param DOMPurify - DOMPurify instance
 */
function purifyHtmlFactory(DOMPurify: typeof import('isomorphic-dompurify')): PurifyHTML {
    return function purifyHtml(input: string, allowedTagsInput?: string | string[]) {
        if (!input) {
            return input;
        }
        return memoizer.get(DOMPurify, true).get(allowedTagsInput).get(input);
    };
}

export default purifyHtmlFactory;
