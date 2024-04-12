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

const validUrlRegExp =
    /^(http|https):\/\/(([a-z0-9$\-_.+!*'(),;:&=]|%[0-9a-f]{2})+@)?(((25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9]|[1-9][0-9]|[0-9])(\.(25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9]|[1-9][0-9]|[0-9])){3})|localhost|([a-z0-9\-\u00C0-\u017F]+\.)+([a-zA-Z]{2,}))(:[0-9]+)?((\/(([a-z0-9$\-_.+!*'(),;:@&=~]|%[0-9a-f]{2})*(\/([a-z0-9$\-_.+!*'(),;:@&=]|%[0-9a-f]{2})*)*)|)?(\?([a-z0-9$\-_.+!*'()[\],;:@&=/?~]|%[0-9a-f]{2})*)?(#([a-z0-9$\-_.+!*'()[\],;:@&=/?~]|%[0-9a-f]{2})*)?)?$/i;

/**
 * Checks if passed `input` string is a valid HTTP(S) URL.
 */
export function isValidUrl(input: string) {
    return validUrlRegExp.test(input);
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

const INVALID_UTF16_REGEXP = new RegExp(
    '([\ud800-\udbff](?![\udc00-\udfff]))|((?<![\ud800-\udbff])[\udc00-\udfff])'
);

/**
 * Check that the passed string is a valid UTF-16 string.
 *
 * Do that by checking that each UTF-16 lead surrogate is followed by a tail surrogate.
 *
 * @see https://mnaoumov.wordpress.com/2014/06/14/stripping-invalid-characters-from-utf-16-strings/
 */
function isValidUTF16(s: string) {
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
