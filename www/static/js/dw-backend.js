
/*
 * dw.backend is the parent namespace for all the JS
 * needed for operating Datawrapper, except for code
 * used to render charts
 */

var dw = dw || {};

(function() {

    var backendIsReady = $.Callbacks();
    dw.backend = {
        ready: backendIsReady.add
    };

    require(['dw/backend', 'raphael'], function(backend, Raphael) {
        window.Raphael = Raphael;
        _.extend(dw.backend, backend);
        $(function() {
            backend.init();
            backendIsReady.fire();
        });
    });

}).call(this);
