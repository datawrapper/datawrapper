/**
 * Use this function to post event messages out of Datawrapper iframe and
 * web component embeds to the parent website.
 *
 * @exports postEvent
 * @kind function
 *
 * @param {string} chartId - the chart id each message should be signed with
 * @param {boolean} isIframe - render context (`true`: iframe, `false`: web component)
 * @returns {function}
 *
 * @example
 * import genPostEvent from '@datawrapper/shared/postEvent';
 * const postEvent = genPostEvent(chart.get('id'), true);
 * postEvent('bar.click', { value: 123 });
 */
export default function postEvent(chartId, isIframe) {
    const host = isIframe ? window.parent : window;
    return function (event, data) {
        if (host && host.postMessage) {
            const evt = {
                source: 'datawrapper',
                chartId,
                type: event,
                data
            };
            host.postMessage(evt, '*');
        }
    };
}
