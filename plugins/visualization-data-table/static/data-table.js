
(function(){

    var trim = function (myString) {
        return myString.replace(/^\s+/g,'').replace(/\s+$/g,'');
    };

    dw.visualization.register('data-table', {

        render: function(el) {
            el = $(el);
            // add table
            var me = this, table, tr, td, th, r,
                css_class = me.theme().datatable && me.theme().datatable['class'] ?
                    me.theme().datatable['class'] : 'datatable-default',
                isHighlighted = function(series) {
                    return me.chart().hasHighlight() && me.chart().isHighlighted(series);
                },
                dataset = me.dataset;

            table = $('<table class="'+css_class+'" id="datatable"><thead /><tbody /></table>');
            tr = $('<tr />');
            var colType = [];
            dataset.eachColumn(function(column) {
                th = $('<th>'+column.title()+'</th>');
                if (isHighlighted(column)) {
                    th.addClass('highlight');
                }
                var number_count = 0;
                column.each(function(val) {
                    if (_.isNumber(val)) number_count ++;
                });
                colType.push(column.type());
                tr.append(th);
            });
            $('thead', table).append(tr);
            _.each(_.range(dataset.numRows()), function(r) {
                tr = $('<tr />');
                var highlighted_rows = me.get('highlighted-rows');
                if (_.isArray(highlighted_rows) && _.indexOf(highlighted_rows, "Row "+(me.chart().rowLabel(r)+1)) >= 0) {
                    tr.addClass('highlight');
                }
                dataset.eachColumn(function(column, s) {
                    var cell_content = me.chart().columnFormatter(column)(column.val(r), true);
                    if (cell_content == "n/a") {
                        cell_content = "&mdash;";
                    }
                    td = $('<td>'+cell_content+'</td>');
                    if (isHighlighted(column)) {
                        td.addClass('highlight');
                    }
                    // set a type as classe
                    td.addClass(column.type());
                    if (cell_content == "&mdash;") td.addClass("not-available");
                    td.attr('title', column.title());
                    tr.append(td);
                });
                $('tbody', table).append(tr);
            });
            el.append(table);

            if (me.get('table-responsive')) {
                table.addClass('responsive');
            }

            var datatable_i18n = {
                "sEmptyTable"    : me.translate("sEmptyTable"),
                "sInfo"          : me.translate("sInfo"),
                "sInfoEmpty"     : me.translate("sInfoEmpty"),
                "sInfoFiltered"  : me.translate("sInfoFiltered"),
                "sInfoPostFix"   : "",
                "sInfoThousands" : me.translate("sInfoThousands"),
                "sLengthMenu"    : me.translate("sLengthMenu"),
                "sLoadingRecords": me.translate("sLoadingRecords"),
                "sProcessing"    : me.translate("sProcessing"),
                "sSearch"        : me.translate("sSearch"),
                "sZeroRecords"   : me.translate("sZeroRecords"),
                "oPaginate": {
                    "sFirst":    me.translate("oPaginate_sFirst"),
                    "sLast":     me.translate("oPaginate_sLast"),
                    "sNext":     me.translate("oPaginate_sNext"),
                    "sPrevious": me.translate("oPaginate_sPrevious")
                },
                "oAria": {
                    "sSortAscending":  me.translate("oAria_sSortAscending"),
                    "sSortDescending": me.translate("oAria_sSortDescending")
                }
            };

            // Functions to sort formated number
            jQuery.extend( jQuery.fn.dataTableExt.oSort, {
                "formatted-num-pre": function ( a ) {
                    a = (a === "—" || a === "") ? -1 : a.replace( /[^\d\-\.,]/g, "" ).replace(',', '.');
                    return parseFloat(a);
                },
                "formatted-num-asc": function ( a, b ) {return a - b;},
                "formatted-num-desc": function ( a, b ) {return b - a;},
                "formatted-date-pre": function ( a ) {
                    return Globalize.parseDate(a);
                },
                "formatted-date-asc": function ( a, b ) {return a & b ? a.getTime() - b.getTime() : 0;},
                "formatted-date-desc": function ( a, b ) {return a & b ? b.getTime() - a.getTime() : 0;}
            });

            // set a list of column types for datatable.js (in order to support ordering)
            var colum_types = [];
            _.each(colType, function(type, s) {
                if (type == "number") {
                    colum_types.push({ "sType": "formatted-num" });
                } else if (type == "date") {
                    colum_types.push({ "sType": "formatted-date" });
                } else {
                    colum_types.push({ "sType": null });
                }

            });

            table.dataTable({
                "bPaginate" : me.get('table-paginate', false),
                "bInfo"     : me.get('table-paginate', false),
                "bFilter"   : me.get('table-filter', false),
                "bSort"     : me.get('table-sortable', false),
                "oLanguage" : datatable_i18n,
                "aoColumns": colum_types
            });

            el.append('<br style="clear:both"/>');
            me.renderingComplete();
        },

        keys: function() {
            return _.map(this.dataset.columns(), function(c) { return c.name(); });
        }

    });


}).call(this);