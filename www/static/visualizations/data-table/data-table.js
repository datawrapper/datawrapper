
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
            var colType = [];
            _.each(me.chart.dataSeries(), function(series) {
                th = $('<th>'+series.name+'</th>');
                if (isHighlighted(series)) {
                    th.addClass('highlight');
                }
                if (series.type.substr(0,14) == 'number-decimal') {
                    colType.push('number-decimal');
                    th.addClass('number-decimal');
                } else if (series.type == 'number') {
                    // check for small numbers
                    var small = true;
                    _.each(series.data, function(val) {
                        small = small && val <= 100 && val >= -100;
                    });
                    colType.push('number'+(small ? '-small' : ''));
                    th.addClass('number'+(small ? '-small' : ''));
                }

                tr.append(th);
            });
            $('thead', table).append(tr);
            for (r = 0; r < me.chart.numRows(); r++) {
                tr = $('<tr />');
                if (me.chart.hasRowHeader()) {
                    tr.append('<th>'+me.chart.rowLabel(r)+'</tr>');
                }
                _.each(me.chart.dataSeries(), function(series, s) {
                    td = $('<td>'+me.chart.formatValue(series.data[r], true)+'</td>');
                    if (isHighlighted(series)) {
                        td.addClass('highlight');
                    }
                    td.addClass(colType[s]);
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