const allowedSourceUrlRegExp = /^(https?|ftp):\/\//i;

/**
 * Checks if passed `sourceUrl` can safely be rendered in chart HTML and shown publicly.
 *
 * Most importantly, this function doesn't allow 'javascript:' URLs, so that users can't put such
 * links in their charts and thus put the readers of the charts in danger.
 */
export function isAllowedSourceUrl(sourceUrl: string) {
    return allowedSourceUrlRegExp.test(sourceUrl);
}

/**
 * Checks if passed `input` string is a valid HTTP(S) URL.
 */
export function isValidUrl(input: string) {
    input = input.toLowerCase();
    if (!input.startsWith('http://') && !input.startsWith('https://')) {
        return false;
    }
    try {
        new URL(input);
        return true;
    } catch {
        return false;
    }
}

/**
 * Check that the passed string can be used as a JSON object key in a MySQL JSON column.
 *
 * Do that by checking that the length of the string is shorter than 2**16, which is a number
 * discovered by trial and error.
 */
function isValidMySQLJSONObjectKey(s: string) {
    return !s || s.length < 2 ** 16;
}

/**
 * Check that the passed string is a valid UTF-16 string.
 *
 * Do that by checking that each UTF-16 lead surrogate is followed by a tail surrogate.
 *
 * @see https://mnaoumov.wordpress.com/2014/06/14/stripping-invalid-characters-from-utf-16-strings/
 */
function isValidUTF16(s: string) {
    // We need to construct this regex at runtime, because the lookbehind is not supported in older Safari versions, and we only actually use it server side.
    const INVALID_UTF16_REGEXP = new RegExp(
        '([\ud800-\udbff](?![\udc00-\udfff]))|((?<![\ud800-\udbff])[\udc00-\udfff])'
    );
    return !INVALID_UTF16_REGEXP.test(s);
}

/**
 * Check that the passed value can be used as the value of a MySQL JSON column.
 *
 * @see isValidUTF16()
 * @see isValidMySQLJSONKey()
 */
export function isValidMySQLJSON(x: unknown, nestedLevel = 0): boolean {
    if (nestedLevel >= 100) {
        // MySQL only allows JSON objects to be at most 100 levels deep:
        // https://stackoverflow.com/questions/58697562/why-does-mysql-hardcode-the-max-depth-of-a-json-document
        return false;
    }
    if (!x) {
        return true;
    }
    if (typeof x === 'number') {
        return true;
    }
    if (typeof x === 'string') {
        return isValidUTF16(x);
    }
    if (Array.isArray(x)) {
        return x.every(el => isValidMySQLJSON(el, nestedLevel + 1));
    }
    if (typeof x === 'object' && x.constructor === Object) {
        for (const [k, v] of Object.entries(x)) {
            if (!isValidMySQLJSONObjectKey(k) || !isValidMySQLJSON(v, nestedLevel + 1)) {
                return false;
            }
        }
    }
    return true;
}
