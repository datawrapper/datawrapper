/**
 * tracks a custom event in Matomo
 *
 *
 * @param {string} category - the event category
 * @param {string} category - the event action
 * @param {string} category - the event name
 * @param {string|number} category - the event value, optional
 */
export function trackEvent(category, action, name, value) {
    if (window._paq) {
        window._paq.push(['trackEvent', category, action, name, value]);
    }
}

let previousPageUrl;

/**
 * tracks a custom page view in Matomo. Useful for single page
 * apps in Datawrapper, such as the locator maps UI. The page title
 * and URL are automatically detected using the window object.
 *
 * @param {number|string} userId - optional user id of authenticated user
 * @param {string} teamId - optional team id of page context
 */
export function trackPageView(userId, teamId) {
    if (window._paq) {
        if (previousPageUrl) {
            window._paq.push(['setReferrerUrl', previousPageUrl]);
        }

        window._paq.push(['setCustomUrl', window.location.pathname]);
        window._paq.push(['setDocumentTitle', window.document.title]);
        if (userId) window._paq.push(['setUserId', userId]);
        if (teamId) window._paq.push(['setCustomDimension', 1, teamId]);
        window._paq.push(['trackPageView']);
        previousPageUrl = window.location.pathname;
    }
}
