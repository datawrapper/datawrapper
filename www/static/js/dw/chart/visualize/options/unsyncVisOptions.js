
define(function() {

    return function(vis, chart) {

        // trigger vis option un-synchronization
        _.each(vis.options, function(opt, key) {
            // fire custom event so hooked vis options can sync
            $('#vis-options').trigger('dw:vis-option-unsync:' + $.trim(opt.type), {
                chart: chart,
                vis: dw.backend.currentVis,
                key: key,
                option: opt
            });
        });
    };

});