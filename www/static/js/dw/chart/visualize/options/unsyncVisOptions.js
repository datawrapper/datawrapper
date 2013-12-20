
define(function() {

    return function(vis, chart) {

        // trigger vis option un-synchronization
        _.each(vis.options, function(opt, key) {
            // fire custom event so hooked vis options can sync
            dw.backend.fire('unsync-option:' + $.trim(opt.type), {
                chart: chart,
                vis: dw.backend.currentVis,
                key: key,
                option: opt
            });
        });
    };

});