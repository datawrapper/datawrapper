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
 * @param {number} loadTime - optional page load time, has to be measured
 *    manually
 */
export function trackPageView(loadTime = 0) {
    if (window._paq) {
        if (previousPageUrl) {
            window._paq.push(['setReferrerUrl', previousPageUrl]);
        }
        window._paq.push(['setGenerationTimeMs', loadTime]);
        window._paq.push(['setCustomUrl', window.location.pathname]);
        window._paq.push(['setDocumentTitle', window.document.title]);
        window._paq.push(['trackPageView']);
        previousPageUrl = window.location.pathname;
    }
}
