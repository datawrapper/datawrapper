
(function(){

    // Simple perfect bar chart
    // -------------------------

    var DataTable = Datawrapper.Visualizations.DataTable = function() {

    };

    _.extend(DataTable.prototype, Datawrapper.Visualizations.Base, {

        render: function(el) {
            el = $(el);
            // add table
            var me = this, table, tr, td, th, r,
                isHighlighted = function(series) {
                    return me.chart.hasHighlight() && me.chart.isHighlighted(series);
                };
            table = $('<table id="datatable"><thead /><tbody /></table>');
            tr = $('<tr />');
            if (me.chart.hasRowHeader()) {
                var h = me.chart.rowHeader().name;
                if (h.length == 2 && h[0] == 'X') h = '';
                tr.append('<th>'+h+'</tr>');
            }
            _.each(me.chart.dataSeries(), function(series) {
                th = $('<th>'+series.name+'</th>');
                if (isHighlighted(series)) {
                    th.addClass('highlight');
                }
                tr.append(th);
            });
            $('thead', table).append(tr);
            for (r = 0; r < me.chart.numRows(); r++) {
                tr = $('<tr />');
                if (me.chart.hasRowHeader()) {
                    tr.append('<th>'+me.chart.rowLabel(r)+'</tr>');
                }
                _.each(me.chart.dataSeries(), function(series) {
                    td = $('<td>'+series.data[r]+'</td>');
                    if (isHighlighted(series)) {
                        td.addClass('highlight');
                    }
                    td.attr('title', series.name);
                    tr.append(td);
                });
                $('tbody', table).append(tr);
            }
            el.append(table);

            if (me.get('table-responsive')) {
                table.addClass('responsive');
            }

            table.dataTable({
                "bPaginate": me.get('table-paginate'),
                "bInfo": me.get('table-paginate'),
                "bFilter": me.get('table-filter'),
                "bSort": me.get('table-sortable')
            });
        }

    });

}).call(this);