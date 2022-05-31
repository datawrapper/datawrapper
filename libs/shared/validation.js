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
export function isAllowedSourceUrl(sourceUrl) {
    return allowedSourceUrlRegExp.test(sourceUrl);
}
