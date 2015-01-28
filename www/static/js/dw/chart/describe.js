
define(['handsontable'], function(handsontable) {

    var _chartLocale;

    var colTypeIcons = {
        date: 'fa fa-clock-o'
    };

    function init(chartLocale) {
        _chartLocale = chartLocale; // store in upper scope
        var metadata = {
                changes: {
                    exist: function() {
                        return !!chart.get('metadata.data.changes', []).length;
                    },
                    add: function(row, column, value) {
                        var dataChanges = _.clone(chart.get('metadata.data.changes', [])); //clone is needed, otherwise chart.set does not detect this as change
                        if (chart.get('metadata.data.transpose')) {
                            dataChanges.push({row: column, column: row, value: value});
                        }
                        else {
                            dataChanges.push({row: row, column: column, value: value});
                        }
                        chart.set('metadata.data.changes', dataChanges);
                    },
                    revert: function() {
                        chart.set('metadata.data.changes', []);
                        chart.set('metadata.data.column-format', {});
                    }
                },

                columnFormat: {
                    add: function(columnNames, property, value) {
                        var columnFormats = $.extend(true, {}, chart.get('metadata.data.column-format', {})); //deep clone (_.clone is insufficient because it does a shallow clone)
                        _.each(columnNames, function(name) {
                            if (!columnFormats[name]) {
                                columnFormats[name] = {};
                            }
                            if (property) {
                                if (value === undefined) {
                                    delete columnFormats[name][property];
                                    if (!_.keys(columnFormats[name]).length) {
                                        delete columnFormats[name];
                                    }
                                } else {
                                    columnFormats[name][property] = value;
                                }
                                if (property === 'type') {
                                    dataset.column(name).type(value);
                                    showColumnSettings();
                                }
                            } else {
                                if (value === undefined) delete columnFormats[name];
                                else columnFormats[name] = value;
                            }
                        });
                        chart.set('metadata.data.column-format', columnFormats);
                    },
                    get: function(columnName) {
                        var columnFormat = chart.get('metadata.data.column-format', {});
                        if (arguments.length) {
                            return columnFormat[columnName] || {};
                        }
                        else {
                            return columnFormat;
                        }
                    }
                }
            };

        var chart = dw.backend.currentChart,
            dataset;

        chart.onChange(reload);

        chart.sync('#describe-source-name', 'metadata.describe.source-name');
        chart.sync('#describe-source-url', 'metadata.describe.source-url');
        chart.sync('#transpose', 'metadata.data.transpose');

        chart.sync('#has-headers', 'metadata.data.horizontal-header');

        $('#number-format').change(swapUnitAndCurrency);
        swapUnitAndCurrency();

        updateCurrencyInNumberFormat();
        $('#number-currency').change(updateCurrencyInNumberFormat);

        // update data table after format changes
        $('.number-format').change(function() {
            updateTable(dataset, chart);
        });

        $('#reset-data-changes').click(function(){
            metadata.changes.revert();
        });

        // add event handler for ignoring data series
        var start;
        var $dataPreview = $("#data-preview");

        $('body').on('mousedown', bodyMouseDown);

        $('body').on('mouseup', function () {
            start = void 0;
        });

        $dataPreview.on('mousedown', '.ht_clone_top.handsontable th:has(.colHeader)', function (event) {
            start = getIndexOfTh(this);
            event.stopPropagation();
            $dataPreview.handsontable('deselectCell');

            if (selectedColumns.length == 1 && selectedColumns[0] == start) {
                // proceeding click on selected column header will unselect
                deselectColumns();
                $dataPreview.handsontable('render'); // refresh all cells and column headers
                showColumnSettings();
                return;
            }
            setTimeout(function() { //do it in timeout, so input blur has chance to run
                selectColumns(start);
            }, 0);
        });

        var last;
        $dataPreview.on('mouseenter', '.ht_clone_top.handsontable th:has(.colHeader)', function () {
            if(last === this) {
                return;
            }
            if(start !== void 0) {
                var current = getIndexOfTh(this);
                selectColumns(start, current);
            }
            last = this;
        });

        var selectedColumns = [];

        $('.sidebar').mousedown(function(event){
            event.stopPropagation(); //stop sidebar event propagation so clicking in #column-options won't deselect column selection
        });

        $('#column-options-hide').change(function(){
            var columnNames = [];
            selectedColumns.forEach(function(i) {
                columnNames.push(getSeriesOfIndex(i));
            });
            metadata.columnFormat.add(columnNames, 'ignore', this.checked);
        });


        syncColumnFormat('#column-type', 'type');
        syncColumnFormat('#number-format', 'number-format');
        syncColumnFormat('#number-divisor', 'number-divisor');
        syncColumnFormat('#number-append', 'number-append');
        syncColumnFormat('#number-prepend', 'number-prepend');

        $('#describe-source-url').blur(storeCorrectedSourceUrl);

        reload();

        // save changes before navigating to next step
        $('a[href=visualize]').click(function(evt) {
            if (chart.hasUnsavedChanges()) {
                evt.preventDefault();
                chart.onSave(function() {
                    location.href = 'visualize';
                });
                chart.save();
            }
        });

        // update currency in number-format select
        function updateCurrencyInNumberFormat() {
            var curOpt = $('#number-format option[value=c], #number-format option[value=c0]');
            Globalize.culture(_chartLocale).numberFormat.currency.symbol = $('#number-currency option:selected').data('symbol');
            curOpt.each(function(i, el) {
                el = $(el);
                el.html(Globalize.format(1234.567, el.val()));
            });
        }

        // swap between currency and unit
        function swapUnitAndCurrency() {
            if ($('#number-format').val()[0] == 'c') {
                $('#number-currency').show();
                $('#number-unit').hide();
            } else {
                $('#number-currency').hide();
                $('#number-unit').show();
            }
        }

        function updateTable() {
            var data = [],
                horzHeaders = chart.get('metadata.data.horizontal-header'),
                transpose = chart.get('metadata.data.transpose'),
                tr = [];

            dataset.ignoreIgnores = true;

            dataset.eachColumn(function(column) {
                tr.push(column.title());
            });
            data.push(tr);

            dataset.eachRow(function(row) {
                var tr = [];
                dataset.eachColumn(function(column, i) {
                    var val = column.raw(row);
                    tr.push(isNone(val) ? '' : val);
                });
                data.push(tr);
            });

            var ht = $dataPreview.handsontable('getInstance');

            if (ht) {
                ht.loadData(data);
                ht.render();
            }
            else {
                $dataPreview.handsontable({
                    data: data,
                    startRows: 6,
                    startCols: 8,
                    rowHeaders: true,
                    colHeaders: true,
                    fillHandle: false,
                    stretchH: 'all',
                    cells: function (row, col, prop) {
                        return {
                            renderer: myRenderer
                        };
                    },
                    afterChange: function(changes, source) {
                        if (source !== 'loadData') {
                            changes.forEach(function(change) {
                                if (change[2] != change[3]) {
                                    metadata.changes.add(change[0], change[1], change[3]);
                                }
                            });
                        }
                    },
                    afterGetColHeader: function (col, TH) {
                        if (selectedColumns.indexOf(col) !== -1) {
                            TH.classList.add('selected');
                        }

                        var serie = getSeriesOfIndex(col);
                        if(metadata.columnFormat.get(serie).ignore) {
                            TH.classList.add('ignored');
                        }
                        else {
                            TH.classList.remove('ignored');
                        }
                    }
                });

                $('#data-preview table').addClass('table table-bordered'); //Bootstrap class names

                ht = $dataPreview.handsontable('getInstance');
                ht.render(); //consider Bootstrap class names in auto column size
            }

            if(metadata.changes.exist()) {
                $('#reset-data-changes').removeClass('disabled');
            }
            else {
                $('#reset-data-changes').addClass('disabled');
            }
            if (selectedColumns.length) {
                // update automatic-format checkbox
                if (dataset.column(selectedColumns[0]).type() == 'number') {
                    updateAutomaticFormat();
                }
            }

            $('#data-preview .ht_clone_corner.handsontable table div').off('click').on('click', function() {
                chart.set('metadata.data.transpose', !chart.get('metadata.data.transpose', false));
            });

            function isNone(val) {
                return val === null || val === undefined || (_.isNumber(val) && isNaN(val));
            }

            function HtmlCellRender(instance, TD, row, col, prop, value, cellProperties) {
              var escaped = dw.utils.purifyHtml(Handsontable.helper.stringify(value));
              TD.innerHTML = escaped; //this is faster than innerHTML. See: https://github.com/warpech/jquery-handsontable/wiki/JavaScript-&-DOM-performance-tips
              if (cellProperties.readOnly) {
                instance.view.wt.wtDom.addClass(TD, 'htDimmed');
              }
              if (cellProperties.valid === false && cellProperties.invalidCellClassName) {
                instance.view.wt.wtDom.addClass(TD, cellProperties.invalidCellClassName);
              }
            }

            function myRenderer(instance, td, row, col, prop, value, cellProperties) {
                var column = dataset.column(col);
                if (row > 0) {
                    var formatter = chart.columnFormatter(column);
                    value = formatter(column.val(row - 1), true);
                }

                if (parseInt(value, 10) < 0) { //if row contains negative number
                    td.classList.add('negative');
                }
                td.classList.add(column.type()+'Type');
                if (row === 0) {
                    td.classList.add('firstRow');
                    if (colTypeIcons[column.type()]) {
                        value = '<i class="'+colTypeIcons[column.type()]+'"></i> ' + value;
                    }
                } else {
                    td.classList.add(row % 2 ? 'oddRow' : 'evenRow');
                }
                if (metadata.columnFormat.get(column.name()).ignore) {
                    td.classList.add('ignored');
                }
                if(selectedColumns.indexOf(col) > -1) {
                    td.classList.add('area'); //add blue area background if this cell is in selected column
                }
                if (row > 0 && !column.type(true).isValid(column.val(row-1))) {
                    td.classList.add('parsingError');
                }
                HtmlCellRender.apply(this, arguments);
            }
        } // end updateTable()

        function reload(f) {
            chart.load().done(function(ds) {
                dataset = ds;
                updateTable();
            });
        }

        function hasCorner() {
            return !!$('#data-preview tbody th').length;
        }

        function getIndexOfTh(th) {
            return $dataPreview.handsontable('getInstance').view.wt.wtTable.getCoords(th).col;
        }

        function getThOfIndex(index) {
            var offsetCol = $dataPreview.handsontable('getInstance').view.wt.getSetting('offsetColumn') || 0;
            var thIndex = index + 1 * hasCorner() - offsetCol;
            return document.querySelectorAll('#data-preview thead th')[thIndex];
        }

        function getSeriesOfIndex(index) {
            if (index < 0) {
                index = 0;
            }

            return dataset.column(index).name();
        }

        function deselectColumns() {
            selectedColumns.length = 0;
        }

        function selectColumns(from, to) {
            deselectColumns();

            if(to === void 0) {
                selectedColumns.push(from);
            }
            else {
                var min = Math.min(from, to);
                var max = Math.max(from, to);
                while(min <= max) {
                    selectedColumns.push(min);
                    min++;
                }
            }
            $dataPreview.handsontable('render');
            showColumnSettings();
        }

        function selectedSeries() {
            var out = [];
            selectedColumns.forEach(function(i){
                out.push(getSeriesOfIndex(i));
            });
            return out;
        }

        function allEqual(formats, series, property) {
            if (series.length > 1) {
                for (var i = 1; i < series.length; i++) {
                    var a = formats[series[i]] && formats[series[i]][property];
                    var b = formats[series[i - 1]] && formats[series[i - 1]][property];
                    if (a !== b) {
                        return false;
                    }
                }
            }
            return true;
        }

        function fillInField(selector, property) {
            var series = selectedSeries();
            var formats = chart.get('metadata.data.column-format', {});
            var $input = $(selector);
            if(allEqual(formats, series, property)) {
                var val = formats[series[0]] && formats[series[0]][property];
                if (val === undefined && $input.is('select')) val = '-';
                $input.val(val).removeClass('unresolved');
            }
            else {
                $input.val('').addClass('unresolved');
                $input.change(function() {
                    fillInField(selector, property);
                });
            }
        }

        function syncColumnFormat(selector, property) {
            $(selector).change(function(){
                var columnNames = [];
                selectedColumns.forEach(function(i) {
                    columnNames.push(getSeriesOfIndex(i));
                });
                metadata.columnFormat.add(columnNames, property, this.value === '-' ? undefined : this.value);

                if(property === 'type') {
                   showColumnSettings();
                }
            });
        }

        function showColumnSettings() {
            if(selectedColumns.length) {
                var serie = getSeriesOfIndex(selectedColumns[0]);
                if(metadata.columnFormat.get(serie).ignore) {
                    $('#column-options-hide')[0].checked = true;
                }
                else {
                    $('#column-options-hide')[0].checked = false;
                }

                if(metadata.columnFormat.get(serie).type) {
                    $('#column-type').val(metadata.columnFormat.get(serie).type);
                }
                else {
                    $('#column-type').val('-');
                }

                var fstCol = dataset.column(serie),
                    inputFmtDiv = $('#select-input-format'),
                    inputFmt = $('#input-format');

                if (fstCol.type() != 'text') {
                    var fmts = fstCol.type(true).ambiguousFormats();
                    console.log(fmts);
                    if (fmts.length > 1) {
                        $('option[value!=-]', inputFmt).remove();
                        inputFmtDiv.show();
                        _.each(fmts, function(fmt) {
                            $('<option />').attr('value', fmt[0]).html(fmt[1]).appendTo(inputFmt);
                        });
                        fillInField('#input-format', 'input-format');
                        syncColumnFormat('#input-format', 'input-format');
                    } else {
                        inputFmtDiv.hide();
                    }
                } else {
                    inputFmtDiv.hide();
                }

                if(dataset.column(serie).type() == 'number') {
                    fillInField('#number-format', 'number-format');
                    fillInField('#number-divisor', 'number-divisor');
                    fillInField('#number-append', 'number-append');
                    fillInField('#number-prepend', 'number-prepend');
                    $('#number-column-options').show();

                    updateAutomaticFormat();
                }
                else {
                    $('#number-column-options').hide();
                }

                // fill in default column type
                var defOpt = $('#column-type option[value=-]');
                var type = dataset.column(selectedColumns[0]).type();

                _.each(selectedColumns, function(i) {
                    type = type == dataset.column(i).type() ? type : undefined;
                });
                defOpt.html(defOpt.data('label'));
                if (type) {
                    // all selected columns have the same type
                    defOpt.html(defOpt.html()+' ('+$('#column-type option[value='+type+']').html()+')');
                }

                // update title
                $('.selected-columns').text(_.map(selectedColumns.slice(0,3), function(c) {
                    return dataset.column(c).title();
                }).join(', ') + (selectedColumns.length > 3 ? ', …' : ''));

                $('#table-options').hide();
                $('#column-options').show();
            }
            else {
                $('#column-options').hide();
                $('#table-options').show();
            }
        } // end showColumnSettings


        function updateAutomaticFormat() {
            $('#automatic-format')
                .prop('checked', _.isEqual(metadata.columnFormat.get(getSeriesOfIndex(selectedColumns[0])), 'auto'))
                .off('change')
                .on('change', function() {
                    if ($('#automatic-format').prop('checked')) {
                        metadata.columnFormat.add(_.map(selectedColumns, getSeriesOfIndex), null, 'auto');
                    } else {
                        metadata.columnFormat.add(_.map(selectedColumns, getSeriesOfIndex), null, {
                            'number-divisor': 0,
                            'number-format': '-'
                        });
                    }
                    updateUI(true);
                });
            function updateUI(reset) {
                var ctrls = $('#number-format, #number-divisor, #number-append, #number-prepend');
                if ($('#automatic-format').prop('checked')) {
                    //ctrls.parent().parent().hide();
                    $('.number-format input, .number-format select').prop('disabled', true);
                    $('.number-format label').css('opacity', 0.5);
                } else {
                    //ctrls.parent().parent().show();
                    $('.number-format input, .number-format select').prop('disabled', false);
                    $('.number-format label').css('opacity', 1);
                    if (reset) {
                        fillInField('#number-format', 'number-format');
                        fillInField('#number-divisor', 'number-divisor');
                        fillInField('#number-append', 'number-append');
                        fillInField('#number-prepend', 'number-prepend');
                    }
                }
            }
            updateUI();
        } // end updateAutomaticFormat

        function storeCorrectedSourceUrl() {
            var v = $(this).val();
            if (v.substr(0,2) != '//' && v.substr(0,7) != 'http://' &&  v.substr(0,8) != 'https://') {
                $(this).val('//'+v);
                chart.set('metadata.describe.source-url', $(this).val());
            }
        }

        function bodyMouseDown() {
            if(document.activeElement.nodeName === 'INPUT') {
                document.activeElement.blur(); //save changes from currently edited sidebar field
            }
            if(selectedColumns.length) {
                deselectColumns();
                $dataPreview.handsontable('render'); // refresh all cells and column headers
                showColumnSettings();
            }
        }

    } // end init();

    return {
        init: init
    };

});