
define(
    ['./options/initCustomColors', './options/syncVisOptions', './options/unsyncVisOptions'],

function(initCustomColors, syncVisOptions, unsyncVisOptions) {

    var _chart, _vis;

    return {
        init: function(chart, vis) {
            _chart = chart;
            _vis = vis;
        },

        sync: function() {
            syncVisOptions(_vis, _chart);
            $('.select-row').hide();
            initCustomColors(_chart);

            $('.vis-option-help').tooltip({
                placement: 'left',
                html: true,
                trigger: 'hover focus click',
                container: 'body'
            });
        },

        reset: function() {
            unsyncVisOptions(_vis, _chart);
        }


    };

});