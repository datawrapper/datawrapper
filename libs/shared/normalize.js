/**
 * normalize an alphanumerical key for less-strict matching (e.g. in maps)
 * @exports normalizeAlphaNumKey
 * @kind function
 *
 * @param {string} key - alphanumerical key
 * @returns {string} - normalized key
 */
export function normalizeAlphaNumKey(key) {
    return String(key || '')
        .toLowerCase()
        .replace(/\u00AD/g, '') // remove soft hyphens
        .replace(/[-\u2015\u2014\u2013\u2012\u23BC\u2212]+/g, '-') // normalize hyphens
        .replace(/[ \u00A0\u1680\u2002-\u200B\u202F\u205F\u3000]+/g, ' ') // normalize spaces
        .trim();
}

/**
 * normalize a numerical key for less-strict matching (e.g. in maps)
 * @exports normalizeNumKey
 * @kind function
 * @param {string|number} key - numerical key
 * @returns {number} - normalized key
 */
export function normalizeNumKey(key) {
    return Number(key);
}
