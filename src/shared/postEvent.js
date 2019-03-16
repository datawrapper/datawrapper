export default function(chartId) {
    return function(event, data) {
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
