/**
 * Use this function to post event messages out of Datawrapper iframe embeds
 * to the parent website.
 *
 * @exports postEvent
 * @kind function
 *
 * @param {string} chartId - the chart id each message should be signed with
 * @returns {function}
 *
 * @example
 * import genPostEvent from '@datawrapper/shared/postEvent';
 * const postEvent = genPostEvent(chart.get('id'));
 * postEvent('bar:hover', {value: 123});
 */
export default function postEvent(chartId) {
    return function (event, data) {
        if (window.parent && window.parent.postMessage) {
            const evt = {
                source: 'datawrapper',
                chartId,
                type: event,
                data
            };
            window.parent.postMessage(evt, '*');
        }
    };
}
