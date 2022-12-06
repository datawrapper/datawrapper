/**
 * converts a string into a slug that can be used in URLs or filenames
 *
 * @exports slugify
 * @kind function
 *
 * @example
 * import {slugify} from '@datawrapper/shared';
 * slugify('This is fine') // 'this-is-fine'
 *
 * @param {string} text - input text
 * @returns {string} - slugified text
 */
export = function slugify(text: string) {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/[^\w-]+/g, '') // Remove all non-word chars
        .replace(/--+/g, '-') // Replace multiple - with single -
        .replace(/^-+/, '') // Trim - from start of text
        .replace(/-+$/, ''); // Trim - from end of text
};
