export function trackEvent(category, action, name, value) {
    if (window._paq) {
        window._paq.push(['trackEvent', category, action, name, value]);
    }
}

let previousPageUrl;

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
