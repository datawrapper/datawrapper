const allowedSourceUrlRegExp = /^(https?|ftp):\/\//i;

/**
 * Checks that passed `sourceUrl` can safely be rendered in chart HTML and shown publicly.
 *
 * Most importantly, this function doesn't allow 'javascript:' URLs, so that users can't put such
 * links in their charts and thus put the readers of the charts in danger.
 *
 * @param {string} sourceUrl
 * @returns {boolean}
 */
export function isAllowedSourceUrl(sourceUrl: string) {
    return allowedSourceUrlRegExp.test(sourceUrl);
}

const validUrlRegExp =
    /^(http|https):\/\/(([a-z0-9$\-_.+!*'(),;:&=]|%[0-9a-f]{2})+@)?(((25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9]|[1-9][0-9]|[0-9])(\.(25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9]|[1-9][0-9]|[0-9])){3})|localhost|([a-z0-9\-\u00C0-\u017F]+\.)+([a-zA-Z]{2,}))(:[0-9]+)?((\/(([a-z0-9$\-_.+!*'(),;:@&=~]|%[0-9a-f]{2})*(\/([a-z0-9$\-_.+!*'(),;:@&=]|%[0-9a-f]{2})*)*)|)?(\?([a-z0-9$\-_.+!*'(),;:@&=/?~]|%[0-9a-f]{2})*)?(#([a-z0-9$\-_.+!*'(),;:@&=/?~]|%[0-9a-f]{2})*)?)?$/i;

/**
 * checks if a given string is a valid URL
 * @exports isValidUrl
 * @kind function
 *
 * @param {string} input
 * @returns {boolean}
 */
export function isValidUrl(input: string) {
    return validUrlRegExp.test(input);
}
