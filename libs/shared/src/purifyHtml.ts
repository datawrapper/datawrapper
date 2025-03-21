import DOMPurify from 'isomorphic-dompurify';
import purifyHtmlFactory from './pure/purifyHtml.js';

/**
 * Removes all HTML tags from given `input` string, except the ones in the `allowedTagsInput` list.
 *
 * @exports purifyHtml
 * @kind function
 *
 * @param {string} input - dirty HTML input
 * @param {string[]} [allowedTagsInput] - list of allowed tags; see DEFAULT_ALLOWED for the default value
 * @param {object} [options] - additional options
 * @param {boolean} [options.trustLinks] - if set to true, A tags will be trusted and not modified
 * @return {string} - the cleaned HTML output
 */
function purifyHtml(
    input: string,
    allowedTagsInput?: string[],
    options?: { trustLinks?: boolean }
): string;
/**
 * @deprecated
 */
function purifyHtml(input: string, allowedTagsInput: string): string;
/**
 * @deprecated
 */
function purifyHtml(input: unknown): unknown;
function purifyHtml(
    input: unknown,
    allowedTagsInput?: string | string[],
    options: { trustLinks?: boolean } = {}
) {
    return purifyHtmlFactory(DOMPurify)(
        input as string,
        allowedTagsInput as string[],
        options.trustLinks ?? false
    );
}

export type PurifyHtml = typeof purifyHtml;

export default purifyHtml;
