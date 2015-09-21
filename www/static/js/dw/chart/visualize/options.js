
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
                placement: 'right',
                html: true,
                delay: 0,
                animation: false,
                trigger: 'hover focus',
                container: '#vis-options'
            });

            var type = _chart.get('type'), usrPref = {};
            try {
                usrPref = JSON.parse(localStorage.getItem('dw-vis-groups')) || {};
            } catch (e) {}
            
            if (!usrPref[type]) usrPref[type] = {};

            _.each(usrPref[type], function(val, key) {
                // initialize state from user preferences
                $('#vis-options-'+key)[val == 'open' ? 'addClass' : 'removeClass']('group-open');
            });

            $('.vis-option-type-group > label.group-title').click(function() {
                var $g = $(this).parents('.vis-option-type-group').toggleClass('group-open');
                try {
                    usrPref[type][$g.data('group-key')] = $g.hasClass('group-open') ? 'open' : 'closed';
                    localStorage.setItem('dw-vis-groups', JSON.stringify(usrPref));
                } catch (e) {}
            });
        },

        reset: function() {
            unsyncVisOptions(_vis, _chart);
        }


    };

});
