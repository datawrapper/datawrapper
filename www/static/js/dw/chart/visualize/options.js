
define(
    ['./options/initCustomColors', './options/syncVisOptions'],

function(initCustomColors, syncVisOptions) {

    return {
        init: function(chart, vis) {
            // synchronize vis options as soon the vis has been loaded
            dw.backend.__currentVisLoaded.done(function() {
                dw.backend.currentVis.chart(chart);
                syncVisOptions(vis);
                $('.select-row').hide();
                initCustomColors(chart);
            });
        }
    };

});