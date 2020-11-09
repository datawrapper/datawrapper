/* globals _, $ */
/*
 * dw.backend is the parent namespace for all the JS
 * needed for operating Datawrapper, except for code
 * used to render charts
 */

var dw = window.dw || {};

(function () {
    var eventInstances = [];

    dw.backend = {
        fire: function (evt, param) {
            // console.log('fire:', evt);
            _.each(eventInstances, function (o) {
                o.trigger(evt, param);
            });
        },

        /*
         * returns a new event instance
         */
        events: function () {
            return initEvents({});
        },

        hooks: initHooks()
    };

    initEvents(dw.backend);

    require(['dw/backend'], function (backend) {
        _.extend(dw.backend, backend);
        $(function () {
            backend.init();
            dw.backend.fire('ready');
        });
    });

    function initEvents(o) {
        var callbacks = {};

        $.extend(o, {
            on: onEvent,
            one: oneEvent,
            once: oneEvent,
            off: offEvent,
            trigger: fireEvent,
            ready: function (cb) {
                onEvent('ready', cb);
            }
        });

        eventInstances.push(o);

        function onEvent(evt, func) {
            if (!callbacks[evt]) callbacks[evt] = $.Callbacks();
            callbacks[evt].add(func);
            return o;
        }

        function offEvent(evt, func) {
            if (arguments.length === 0) {
                // unbind all events
                _.each(_.keys(callbacks), function (evt) {
                    delete callbacks[evt];
                });
                return o;
            }
            if (!callbacks[evt]) return o;
            if (arguments.length === 1) {
                // remove all listeners
                callbacks[evt] = $.Callbacks();
                return o;
            }
            if ($.isFunction(func)) {
                // remove one particular listener
                callbacks[evt].remove(func);
            }
            return o;
        }

        // fires an event only once
        function oneEvent(evt, func) {
            function removeListener() {
                offEvent(evt, func);
                offEvent(evt, removeListener);
            }
            onEvent(evt, func);
            onEvent(evt, removeListener);
            return o;
        }

        function fireEvent(evt, params) {
            if (callbacks[evt]) callbacks[evt].fire(params);
            return o;
        }

        return o;
    }

    function initHooks() {
        var hooks = {};
        return {
            register: function (hook, callback) {
                if (!hooks[hook]) hooks[hook] = [];
                hooks[hook].push(callback);
            },
            unregister: function (hook) {
                if (hooks[hook]) delete hooks[hook];
            },
            call: function (hook, args) {
                var results = [];
                var errors = [];
                if (hooks[hook]) {
                    hooks[hook].forEach(function (callback) {
                        try {
                            results.push(callback.apply(null, args));
                        } catch (e) {
                            errors.push(e);
                        }
                    });
                }
                return { results: results, errors: errors };
            }
        };
    }
}.call(this));
