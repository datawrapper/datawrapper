
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

            var containers = $('.vis-options');

            containers.each(function(i, el) {
                $('.vis-option-help', el).tooltip({
                    placement: 'right',
                    html: true,
                    delay: 0,
                    animation: false,
                    trigger: 'hover focus',
                    // trigger: 'click',  // for debugging
                    container: el
                });
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

            // don't react to a group that contains `svelte-group` class,
            // since it will handle the toggle functionality on its own
            $('.vis-option-type-group:not(.notoggle,.svelte-group) > label.group-title').click(function() {
                var $g = $(this).parents('.vis-option-type-group').toggleClass('group-open');
                $(window).resize();
                try {
                    usrPref[type][$g.data('group-key')] = $g.hasClass('group-open') ? 'open' : 'closed';
                    localStorage.setItem('dw-vis-groups', JSON.stringify(usrPref));
                } catch (e) {}
            });

            $('.vis-option-group').each(function() {
                var $control_grp = $(this),
                    $control_lbl = $('.control-label', $control_grp).css('max-width', 'auto'),
                    $controls = $('.controls', $control_grp).css('max-width', 'auto');

                if ($control_lbl.length && $controls.length) {
                    var total_w = $control_grp.width(),
                        lbl_w = $control_lbl.width();
                    $controls.css('max-width', (0.9 - lbl_w / total_w) * 100 + '%');
                }
            });
        },

        reset: function() {
            unsyncVisOptions(_vis, _chart);
        }


    };

});
