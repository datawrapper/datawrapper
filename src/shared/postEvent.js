export default function(chart_id) {

    return function(event, data) {
        if (window.parent && window.parent.postMessage) {
            const evt = {
                source: 'datawrapper',
                chart_id,
                type: event,
                data
            };
            window.parent.postMessage(evt, '*');
        }
    };

}