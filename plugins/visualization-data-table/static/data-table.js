/* globals dw, $ */

(function(){
    var trim = function (myString) {
        return myString.replace(/^\s+/g,'').replace(/\s+$/g,'');
    };

    var last_sort;

    var FLAG_REG = /:([a-z]{2}(?:-[a-z]{2,3})?):/gi;

    dw.visualization.register('data-table', {

        render: function(el) {
            el = $(el).removeClass('mobile-view').removeClass('scrollable');
            // add table
            var me = this, table, tr, td, th, r,
                css_class = me.theme().datatable && me.theme().datatable['class'] ?
                    me.theme().datatable['class'] : 'datatable-default',
                isHighlighted = function(series) {
                    return me.chart().hasHighlight() && me.chart().isHighlighted(series);
                },
                replaceFlagIcons = me.get('replace-flag-icons', false),
                useSquareFlags = me.get('flag-icon-type') == '1x1',
                dataset = me.dataset;

            if (replaceFlagIcons) {
                // load flag icon stylesheet
                $('<link rel="stylesheet" type="text/css" href="//static.dwcdn.net/css/flag-icons/flag-icon.min.css">').appendTo(el);
            }

            function replace(s) {
                if (!replaceFlagIcons) return s;
                var m = s.match(FLAG_REG);
                if (m) m.forEach(function(match) {
                    var code = match.substr(1, match.length-2).toLowerCase();
                    if (code == 'uk') code = 'gb';
                    s = s.replace(match, '<span class="flag-icon '+(useSquareFlags ? 'flag-icon-squared' : '')+' flag-icon-'+code+'"></span>');
                });
                return !replaceFlagIcons ? s : s.replace();
            }

            table = $('<table class="'+css_class+'" id="datatable"><thead /><tbody /></table>');
            tr = $('<tr />');
            var colType = [];
            dataset.eachColumn(function(column) {
                th = $('<th class="'+column.type()+'"">'+replace(column.title())+'</th>');
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

            if (!me.chart().get('metadata.visualize.hide-header')) {
                $('thead', table).append(tr);
            } else {
                $('thead', table).addClass("hidden");
            }

            _.each(_.range(dataset.numRows()), function(r) {
                tr = $('<tr />');
                var highlighted_rows = me.get('highlighted-rows');
                if (_.isArray(highlighted_rows) && _.indexOf(highlighted_rows, "Row "+(me.chart().rowLabel(r)+1)) >= 0) {
                    tr.addClass('highlight');
                }

                if (me.get('hide-header') &&
                      ((r == 0)
                        || ((r % 10 == 0 || r % 25 == 0)&& me.get('paginate')))) {

                   tr.css('border-top', '1px solid #bbb');
                }

                dataset.eachColumn(function(column, s) {
                    var cell_content = me.chart().columnFormatter(column)(column.val(r), true);
                    if (cell_content == "n/a") {
                        cell_content = "&mdash;";
                    }
                    if (column.type() == 'number') {
                        cell_content += '<span class="raw-sortable">'+column.val(r)+'</span>';
                    } else if (column.type() == 'date') {
                        cell_content += '<span class="raw-sortable">';
                        if (_.isDate(column.val(r))) cell_content += column.val(r).getTime();
                        cell_content += '</span>';
                    }
                    td = $('<td>'+replace(cell_content)+'</td>');
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
                    return parseFloat($('span.raw-sortable', '<td>'+a+'</td>').html());
                },
                "formatted-num-asc": function ( a, b ) {return (isNaN(a) ? 0 : a) - (isNaN(b) ? 0 : b); },
                "formatted-num-desc": function ( b, a ) {return (isNaN(a) ? 0 : a) - (isNaN(b) ? 0 : b);},
                "formatted-date-pre": function ( a ) {
                    return parseInt($('span.raw-sortable', '<td>'+a+'</td>').html(), 10);
                },
                "formatted-date-asc": function ( a, b ) {return (isNaN(a) ? 0 : a) - (isNaN(b) ? 0 : b); },
                "formatted-date-desc": function ( b, a ) {return (isNaN(a) ? 0 : a) - (isNaN(b) ? 0 : b);},
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

            if (me.get('table-responsive')) {
                table.addClass('responsive');
            }

            table.dataTable({
                "bPaginate" : me.get('paginate', false),
                "aLengthMenu": [5, 10, 25, 50, 100 ],
                "bInfo"     : me.get('paginate', false),
                "bFilter"   : me.get('filter', false),
                "bSort"     : me.get('sortable', false),
                "oLanguage" : datatable_i18n,
                "aoColumns": colum_types
            });

            if (!last_sort && me.get('sort-by', false)) {
                last_sort = [dataset.indexOf(me.get('sort-by')), me.get('sort-asc') ? 'asc' : 'desc'];
            }

            if (last_sort) { table.fnSort([last_sort]); }

            $('thead th').click(function() {
                var th = $('th[aria-sort]', table),
                    dir = th.attr('aria-sort');
                last_sort = [th.index(), dir.substr(0, dir.charAt(0) == 'a' ? 3 : 4)];
            });

            var c = me.get('header-color');

            if (typeof c == "undefined") {
                c = me.theme().colors.palette[0];
            } else if (typeof c == "number") {
                c = me.theme().colors.palette[c];
            } else if (typeof c == "string") {
                c = c;
            }

            var css = '{font-weight:bold; background: '+c+'!important; color: #fff!important; border-color: '+c+'!important; }';
            $('<style>.dw-chart-body table th '+css+'</style>').appendTo(el);
            $('<style type="text/css">.dw-chart-body.mobile-view table.responsive tr td:first-child '+css+'</style>').appendTo(el);
            // $('.chart.vis-data-table .datatable-default th').css('background', c);
            // $('.chart.vis-data-table .datatable-default tr td:first-child').css('background', c);

            if (table.width() > el.width()) {
                // table doesn't fit into chart
                if (me.get('table-responsive') && el.width() < 600) {
                    el.addClass('mobile-view');
                } else {
                    // make table scrollable
                    el.addClass('scrollable');
                }
            }

            el.append('<br style="clear:both"/>');
            me.renderingComplete();
        },

        keys: function() {
            return _.map(this.dataset.columns(), function(c) { return c.name(); });
        }

    });


}).call(this);
