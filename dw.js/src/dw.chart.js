
/* globals dw,$,_ */

dw.chart = function(attributes) {

    // private methods and properties
    var dataset,
        theme,
        visualization,
        metric_prefix,
        change_callbacks = $.Callbacks(),
        dataset_change_callbacks = $.Callbacks(),
        locale;

    var _ds;

    // public interface
    var chart = {
        // returns an attribute
        get: function(key, _default) {
            var keys = key.split('.'),
                pt = attributes;

            _.some(keys, function(key) {
                if (_.isUndefined(pt) || _.isNull(pt)) return true; // break out of the loop
                pt = pt[key];
                return false;
            });
            return _.isUndefined(pt) || _.isNull(pt) ? _default : pt;
        },

        set: function(key, value) {
            var keys = key.split('.'),
                lastKey = keys.pop(),
                pt = attributes;

            // resolve property until the parent dict
            _.each(keys, function(key) {
                if (_.isUndefined(pt[key]) || _.isNull(pt[key])) {
                    pt[key] = {};
                }
                pt = pt[key];
            });

            // check if new value is set
            if (!is_equal(pt[lastKey], value)) {
                pt[lastKey] = value;
                change_callbacks.fire(chart, key, value);
            }
            return this;
        },

        // loads the dataset and returns a deferred
        load: function(csv, externalData) {
            var datasource,
                dsopts = {
                    firstRowIsHeader: chart.get('metadata.data.horizontal-header', true),
                    transpose: chart.get('metadata.data.transpose', false)
                };

            if ((csv || csv === '') && !externalData) dsopts.csv = csv;
            else dsopts.url = externalData || 'data.csv';

            datasource = chart.get('metadata.data.json') ?
                dw.datasource.json(dsopts) :
                dw.datasource.delimited(dsopts);

            return datasource.dataset().pipe(function(ds) {
                chart.dataset(ds);
                dataset_change_callbacks.fire(chart, ds);
                return ds;
            });
        },

        // returns the dataset
        dataset: function(ds) {
            if (arguments.length) {
                if (ds !== true) _ds = ds;
                dataset = chart.get('metadata.data.json') ? _ds :
                    reorderColumns(applyChanges(addComputedColumns(_ds)));
                if (ds === true) return dataset;
                return chart;
            }
            return dataset;
        },

        // sets or gets the theme
        theme: function(_theme) {
            if (arguments.length) {
                theme = _theme;
                return chart;
            }
            return theme || {};
        },

        // sets or gets the visualization
        vis: function(_vis) {
            if (arguments.length) {
                visualization = _vis;
                visualization.chart(chart);
                return chart;
            }
            return visualization;
        },

        // returns true if the user has set any highlights
        hasHighlight: function() {
            var hl = chart.get('metadata.visualize.highlighted-series');
            return _.isArray(hl) && hl.length > 0;
        },

        isHighlighted: function(obj) {
            if (_.isUndefined(obj) === undefined) return false;
            var hl = this.get('metadata.visualize.highlighted-series'),
                obj_name = dw.utils.name(obj);
            return !_.isArray(hl) || hl.length === 0 || _.indexOf(hl, obj_name) >= 0;
        },

        locale: function(_locale, callback) {
            if (arguments.length) {
                locale = _locale.replace('_', '-');
                if (window["Globalize"]) {
                    if (Globalize.cultures.hasOwnProperty(locale)) {
                        Globalize.culture(locale);
                        if (typeof callback == "function") callback();
                    } else {
                        $.getScript(
                            "/static/vendor/globalize/cultures/globalize.culture." +
                                locale +
                                ".js",
                            function() {
                                chart.locale(locale);
                                if (typeof callback == "function") callback();
                            }
                        );
                    }
                }
                return chart;
            }
            return locale;
        },

        metricPrefix: function(_metric_prefix) {
            if (arguments.length) {
                metric_prefix = _metric_prefix;
                return chart;
            }
            return metric_prefix;
        },

        formatValue: function(val, full, round) {
            var format = chart.get('metadata.describe.number-format'),
                div = Number(chart.get('metadata.describe.number-divisor')),
                append = chart.get('metadata.describe.number-append', '').replace(' ', '&nbsp;'),
                prepend = chart.get('metadata.describe.number-prepend', '').replace(' ', '&nbsp;');

            if (div !== 0) val = Number(val) / Math.pow(10, div);
            if (format != '-') {
                if (round || val == Math.round(val)) format = format.substr(0,1)+'0';
                val = Globalize.format(val, format);
            } else if (div !== 0) {
                val = val.toFixed(1);
            }
            return full ? prepend + val + append : val;
        },

        render: function(container) {
            if (!visualization || !theme || !dataset) {
                throw 'cannot render the chart!';
            }
            visualization.chart(chart);
            visualization.__init();
            var $cont = $(container);
            $cont
                .parent()
                .addClass('vis-'+visualization.id)
                .addClass('theme-'+theme.id);
            visualization.render($cont);
        },

        attributes: function(attrs) {
            if (arguments.length) {
                attributes = attrs;
                return chart;
            }
            return attributes;
        },

        onChange: change_callbacks.add,

        onDatasetChange: dataset_change_callbacks.add,

        columnFormatter: function(column) {
            // pull output config from metadata
            // return column.formatter(config);
            var colFormat = chart.get('metadata.data.column-format', {});
            colFormat = colFormat[column.name()] || { type: 'auto', 'number-format': 'auto'};

            if (column.type() == 'number' && (colFormat == 'auto' || colFormat['number-format'] === undefined || colFormat['number-format'] == 'auto')) {
                var values = column.values();
                var dim = dw.utils.significantDimension(values);
                colFormat['number-divisor'] = 0;
                colFormat['number-format'] = 'n'+Math.max(0, dim);
            }
            return column.type(true).formatter(colFormat);
        },

        dataCellChanged: function(column, row) {
            var changes = chart.get('metadata.data.changes', []),
                transpose = chart.get('metadata.data.transpose', false),
                changed = false;

            _.each(changes, function(change) {
                var r = "row", c = "column";
                if (transpose) {
                    r = "column";
                    c = "row";
                }
                if (column == change[c] && change[r] == row) {
                    changed = true;
                }
            });
            return changed;
        }

    };

    function reorderColumns(dataset) {
        var order = chart.get('metadata.data.column-order', []);
        if (order.length && order.length == dataset.numColumns()) {
            dataset.columnOrder(order);
        }
        return dataset;
    }

    function applyChanges(dataset) {
        var changes = chart.get('metadata.data.changes', []);
        var transpose = chart.get('metadata.data.transpose', false);
        // apply changes
        _.each(changes, function(change) {
            var row = "row", column = "column";
            if (transpose) {
                row = "column";
                column = "row";
            }

            if (dataset.hasColumn(change[column])) {
                if (change[row] === 0) {
                    if (change.previous) {
                        const oldTitle = dataset.column(change[column]).title();
                        if (oldTitle !== change.previous) return;
                    }
                    dataset.column(change[column]).title(change.value);
                } else {
                    if (change.previous) {
                        const curValue = dataset.column(change[column]).raw(change[row] - 1);
                        if (curValue !== change.previous) return;
                    }
                    dataset.column(change[column]).raw(change[row] - 1, change.value);
                }
            }
        });

        // overwrite column types
        var columnFormats = chart.get('metadata.data.column-format', {});
        _.each(columnFormats, function(columnFormat, key) {
            if (columnFormat.type && dataset.hasColumn(key) && columnFormat.type != 'auto') {
                dataset.column(key).type(columnFormat.type);
            }
            if (columnFormat['input-format'] && dataset.hasColumn(key)) {
                dataset.column(key).type(true).format(columnFormat['input-format']);
            }
        });
        return dataset;
    }

    function addComputedColumns(dataset) {
        var v_columns = chart.get('metadata.describe.computed-columns', {}),
            data = dataset.list(),
            columnNameToVar = {},
            col_aggregates = {};

        dataset.eachColumn(function(col) {
            if (col.isComputed) return;
            columnNameToVar[col.name()] = column_name_to_var(col.name());
            if (col.type() == 'number') {
                col_aggregates[col.name()] = {
                    min: d3_min(col.values()),
                    max: d3_max(col.values()),
                    sum: d3_sum(col.values()),
                    mean: d3_mean(col.values()),
                    median: d3_median(col.values())
                };
            }
        });

        _.each(v_columns, add_computed_column);

        return dataset;

        function add_computed_column(formula, name) {
            var datefmt = function(d) { return d.getFullYear()+'-'+left_pad(1+d.getMonth(), 2, 0)+'-'+left_pad(1+d.getDate(), 2, 0); },
                values = data.map(function(row, row_i) {
                    var context = [];
                    context.push('var __row = '+row_i+';');
                    _.each(row, function(val, key) {
                        if (!columnNameToVar[key]) return;
                        context.push('var '+columnNameToVar[key]+' = '+JSON.stringify(val)+';');
                        if (dataset.column(key).type() == 'number') {
                            context.push('var '+columnNameToVar[key]+'__sum = '+col_aggregates[key].sum+';');
                            context.push('var '+columnNameToVar[key]+'__min = '+col_aggregates[key].min+';');
                            context.push('var '+columnNameToVar[key]+'__max = '+col_aggregates[key].max+';');
                            context.push('var '+columnNameToVar[key]+'__mean = '+col_aggregates[key].mean+';');
                            context.push('var '+columnNameToVar[key]+'__median = '+col_aggregates[key].median+';');
                        }
                    });
                    context.push('var max = Math.max, min = Math.min;');
                    // console.log(context.join('\n'));
                    return (function() {
                        try {
                            return eval(this.context.join('\n')+'\n'+formula);
                        } catch (e) {
                            console.warn(e);
                            return 'n/a';
                        }
                    }).call({ context: context });
                }).map(function(v) {
                    if (_.isBoolean(v)) return v ? 'yes' : 'no';
                    if (_.isDate(v)) return datefmt(v);
                    if (_.isNumber(v)) return ''+v;
                    return String(v);
                });
            var v_col = dw.column(name, values);
            v_col.isComputed = true;
            dataset.add(v_col);
        }

        function column_name_to_var(name) {
            // if you change this, change computed-columns.js as well
            return name.toString().toLowerCase()
                .replace(/\s+/g, '_')           // Replace spaces with _
                .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
                .replace(/-/g, '_')             // Replace multiple - with single -
                .replace(/\_\_+/g, '_')         // Replace multiple - with single -
                .replace(/^_+/, '')             // Trim - from start of text
                .replace(/_+$/, '')             // Trim - from end of text
                .replace(/^(\d)/, '_$1')        // If first char is a number, prefix with _
                .replace(/^(abstract|arguments|await|boolean|break|byte|case|catch|char|class|const|continue|debugger|default|delete|do|double|else|enum|eval|export|extends|false|final|finally|float|for|function|goto|if|implements|import|in|instanceof|int|interface|let|long|native|new|null|package|private|protected|public|return|short|static|super|switch|synchronized|this|throw|throws|transient|true|try|typeof|var|void|volatile|while|window|with|yield)$/, '$1_'); // avoid reserved keywords
        }

        function d3_min(array) {
          var i = -1, n = array.length, a, b;
          if (arguments.length === 1) {
            while (++i < n) if ((b = array[i]) != null && b >= b) {
              a = b;
              break;
            }
            while (++i < n) if ((b = array[i]) != null && a > b) a = b;
          }
          return a;
        }
        function d3_max(array) {
          var i = -1, n = array.length, a, b;
          if (arguments.length === 1) {
            while (++i < n) if ((b = array[i]) != null && b >= b) {
              a = b;
              break;
            }
            while (++i < n) if ((b = array[i]) != null && b > a) a = b;
          }
          return a;
        }
        function d3_sum(array) {
            var s = 0, n = array.length, a, i = -1;
            if (arguments.length === 1) {
                while (++i < n) if (d3_numeric(a = +array[i])) s += a;
            }
            return s;
        }
        function d3_mean(array) {
            var s = 0, n = array.length, a, i = -1, j = n;
            while (++i < n) if (d3_numeric(a = d3_number(array[i]))) s += a; else --j;
            if (j) return s / j;
        }
        function d3_median(array) {
            var numbers = [], n = array.length, a, i = -1;
            if (arguments.length === 1) {
                while (++i < n) if (d3_numeric(a = d3_number(array[i]))) numbers.push(a);
            }
            if (numbers.length) return d3_quantile(numbers.sort(d3_ascending), 0.5);
        }
        function d3_quantile(values, p) {
            var H = (values.length - 1) * p + 1, h = Math.floor(H), v = +values[h - 1], e = H - h;
            return e ? v + e * (values[h] - v) : v;
        }
        function d3_number(x) { return x === null ? NaN : +x; }
        function d3_numeric(x) { return !isNaN(x); }
        function d3_ascending(a, b) {
            return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
        }
        function left_pad(s, l, pad) {
            s = String(s);
            while (s.length < l) s = String(pad) + s;
            return s;
        }
    }

    function is_equal(a, b) {
        return JSON.stringify(a) == JSON.stringify(b);
    }

    return chart;
};
