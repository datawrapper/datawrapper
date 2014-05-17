
$(function() {

    function syncValue(args) {
        var el = $('#' + args.key);
        el.val(args.chart.get('metadata.visualize.'+args.key));
        function save() {
            args.chart.set('metadata.visualize.'+args.key, el.val());
        }
        el.change(save).keyup(save);
    }

    function syncCheckbox(args) {
        var el = $('#'+args.key);
        if (args.chart.get('metadata.visualize.'+args.key))
            el.prop('checked', 'checked');
        else
            el.removeAttr('checked');
        el.change(function() {
            args.chart.set('metadata.visualize.'+args.key, el.is(':checked'));
        });
    }

    function syncRadio(args) {
        var curVal = args.chart.get('metadata.visualize.'+args.key);
        if (_.isBoolean(curVal)) {
            curVal = curVal ? 'yes' : 'no';
        }
        $('input:radio[name='+args.key+'][value='+curVal+']').prop('checked', true);
        $('input:radio[name='+args.key+']').change(function() {
            var val = $('input:radio[name='+args.key+']:checked').val();
            if (val === 'yes') val = true;
            else if (val === 'no') val = false;
            args.chart.set('metadata.visualize.'+args.key, val);
        });
    }

    function syncSelectAxisColumn(args) {
        _.each(args.option.axes, function(axis) {
            var select = $('select#'+args.key+'-'+axis.id).html(''),
                chart = args.chart,
                dataset = chart.dataset(),
                axisMeta = args.vis.meta.axes[axis.id],
                defCol = args.vis.axes()[axis.id];

            // populate select with columns that match accepted types for axis
            dataset.eachColumn(function(column) {
                if (_.indexOf(axisMeta.accepts, column.type()) > -1) {
                    $('<option />')
                        .attr('value', column.name())
                        .html(column.title())
                        .prop('selected', column.name() == defCol)
                        .appendTo(select);
                }
            });

            select.change(function() {
                var axes = _.clone(chart.get('metadata.axes', {}));
                axes[axis.id] = select.val();
                chart.set('metadata.axes', axes);
            });

        });
    }

    function syncColumnSelect(args) {

         var select = $('select#'+args.key).html(''),
            chart = args.chart,
            opts = args.option,
            dataset = chart.dataset(),
            accepts = opts.accepts || ['number', 'text', 'date'],
            curVal = args.chart.get('metadata.visualize.'+args.key),
            defCol = curVal ? curVal : (opts.optional ? '{{(none)}}' : dataset.column(0).name());

        if (opts.optional) {
            // add 'no selection' option
            $('<option value="{{(none)}}">—</option>')
                .prop('selected', defCol == '{{(none)}}')
                .appendTo(select);
        }
        // populate select with columns that match accepted types
        dataset.eachColumn(function(column) {
            if (_.indexOf(accepts, column.type()) > -1) {
                $('<option />')
                    .attr('value', column.name())
                    .html(column.title())
                    .prop('selected', column.name() == defCol)
                    .appendTo(select);
            }
        });
        // listen to user changes to this control
        select.change(function() {
            var v = select.val();
            chart.set('metadata.visualize.'+args.key, v == '{{(none)}}' ? null : v);
        });
    }


    dw.backend.on('sync-option:select', syncValue);
    dw.backend.on('sync-option:text', syncValue);
    dw.backend.on('sync-option:textarea', syncValue);
    dw.backend.on('sync-option:checkbox', syncCheckbox);
    dw.backend.on('sync-option:radio', syncRadio);
    dw.backend.on('sync-option:radio-left', syncRadio);

    // column select
    dw.backend.on('sync-option:select-axis-column', syncSelectAxisColumn);
    dw.backend.on('sync-option:column-select', syncColumnSelect);

});

