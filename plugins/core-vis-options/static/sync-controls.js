
(function($) {

    $('body').on('dw:sync_vis_option:select', syncValue);
    $('body').on('dw:sync_vis_option:text', syncValue);

    function syncValue(evt, args) {
        var el = $('#' + args.key);
        el.val(args.chart.get('metadata.visualize.'+args.key));
        function save() {
            args.chart.set('metadata.visualize.'+args.key, el.val());
        }
        el.change(save).keyup(save);
    }


    $('body').on('dw:sync_vis_option:checkbox', syncCheckbox);

    function syncCheckbox(evt, args) {
        var el = $('#'+args.key);
        if (args.chart.get('metadata.visualize.'+args.key))
            el.attr('checked', 'checked');
        else
            el.removeAttr('checked');
        el.change(function() {
            args.chart.set('metadata.visualize.'+args.key, el.attr('checked') == 'checked');
        });
    }


    $('body').on('dw:sync_vis_option:radio', syncRadio);

    function syncRadio(evt, args) {
        var curVal = args.chart.get('metadata.visualize.'+args.key);
        if (_.isBoolean(curVal)) {
            curVal = curVal ? 'yes' : 'no';
        }
        $('input:radio[name='+args.key+'][value='+curVal+']').attr('checked', 'checked');
        el.change(function() {
            var val = $('input:radio[name='+args.key+']:checked').val();
            if (val === 'yes') val = true;
            else if (val === 'no') val = false;
            args.chart.set('metadata.visualize.'+args.key, val);
        });
    }


})(jQuery);

