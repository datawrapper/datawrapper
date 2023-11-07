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
 * @return {string} - the cleaned HTML output
 */
function purifyHtml(input: string, allowedTagsInput?: string[]): string;
/**
 * @deprecated
 */
function purifyHtml(input: string, allowedTagsInput: string): string;
/**
 * @deprecated
 */
function purifyHtml(input: unknown): unknown;
function purifyHtml(input: unknown, allowedTagsInput?: string | string[]) {
    return purifyHtmlFactory(DOMPurify)(input as string, allowedTagsInput as string[]);
}

export type PurifyHtml = typeof purifyHtml;

export default purifyHtml;
