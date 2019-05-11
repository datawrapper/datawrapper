(function() {
    if (typeof window.datawrapper === 'undefined') window.datawrapper = {};

    var datawrapper = window.datawrapper;
    var listeners = {};

    window.addEventListener('message', receiveMessage, false);

    function receiveMessage(event) {
        if (event.data && event.data.source === 'datawrapper' && event.data.chartId && listeners[event.data.type]) {
            listeners[event.data.type].forEach(function(cb) {
                if (typeof cb === 'function') cb(event.data);
            });
        }
    }

    datawrapper.on = function(event, callback) {
        if (typeof event !== 'string') throw new Error('event name must be a string');
        if (typeof callback !== 'function') throw new Error('callback must be a function');
        if (!listeners[event]) listeners[event] = [];
        listeners[event].push(callback);
        return datawrapper;
    };

    datawrapper.one = function(event, callback) {
        datawrapper.on(event, function wrap() {
            callback.apply(null, arguments);
            datawrapper.off(event, wrap);
        });
    };

    datawrapper.off = function(event, callback) {
        if (!listeners[event]) return;
        if (!callback) listeners[event].length = 0;
        var i = listeners[event].indexOf(callback);
        if (i > -1) {
            listeners[event].splice(i, 1);
        }
        return datawrapper;
    };
})();
