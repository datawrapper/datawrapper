import _each from 'underscore-es/each';
import _isDate from 'underscore-es/isDate';
import _isBoolean from 'underscore-es/isBoolean';
import _isNumber from 'underscore-es/isNumber';

export default function(chart, dataset) {
    const v_columns = chart.getMetadata('describe.computed-columns', {});
    const data = dataset.list();
    const columnNameToVar = {};
    const col_aggregates = {};

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

    _each(v_columns, add_computed_column);

    return dataset;

    function add_computed_column(formula, name) {
        var datefmt = d => {
            return (
                d.getFullYear() +
                '-' +
                left_pad(1 + d.getMonth(), 2, 0) +
                '-' +
                left_pad(1 + d.getDate(), 2, 0)
            );
        };

        var values = data
            .map((row, row_i) => {
                var context = [];
                context.push('var __row = ' + row_i + ';');
                row.forEach((val, key) => {
                    if (!columnNameToVar[key]) return;
                    context.push('var ' + columnNameToVar[key] + ' = ' + JSON.stringify(val) + ';');
                    if (dataset.column(key).type() == 'number') {
                        context.push(
                            'var ' +
                                columnNameToVar[key] +
                                '__sum = ' +
                                col_aggregates[key].sum +
                                ';'
                        );
                        context.push(
                            'var ' +
                                columnNameToVar[key] +
                                '__min = ' +
                                col_aggregates[key].min +
                                ';'
                        );
                        context.push(
                            'var ' +
                                columnNameToVar[key] +
                                '__max = ' +
                                col_aggregates[key].max +
                                ';'
                        );
                        context.push(
                            'var ' +
                                columnNameToVar[key] +
                                '__mean = ' +
                                col_aggregates[key].mean +
                                ';'
                        );
                        context.push(
                            'var ' +
                                columnNameToVar[key] +
                                '__median = ' +
                                col_aggregates[key].median +
                                ';'
                        );
                    }
                });
                context.push('var max = Math.max, min = Math.min;');
                // console.log(context.join('\n'));
                return function() {
                    try {
                        return eval(this.context.join('\n') + '\n' + formula);
                    } catch (e) {
                        console.warn(e);
                        return 'n/a';
                    }
                }.call({ context: context });
            })
            .map(function(v) {
                if (_isBoolean(v)) return v ? 'yes' : 'no';
                if (_isDate(v)) return datefmt(v);
                if (_isNumber(v)) return '' + v;
                return String(v);
            });
        var v_col = dw.column(name, values);
        v_col.isComputed = true;
        dataset.add(v_col);
    }

    function column_name_to_var(name) {
        // if you change this, change computed-columns.js as well
        return name
            .toString()
            .toLowerCase()
            .replace(/\s+/g, '_') // Replace spaces with _
            .replace(/[^\w\-]+/g, '') // Remove all non-word chars
            .replace(/-/g, '_') // Replace multiple - with single -
            .replace(/\_\_+/g, '_') // Replace multiple - with single -
            .replace(/^_+/, '') // Trim - from start of text
            .replace(/_+$/, '') // Trim - from end of text
            .replace(/^(\d)/, '_$1') // If first char is a number, prefix with _
            .replace(
                /^(abstract|arguments|await|boolean|break|byte|case|catch|char|class|const|continue|debugger|default|delete|do|double|else|enum|eval|export|extends|false|final|finally|float|for|function|goto|if|implements|import|in|instanceof|int|interface|let|long|native|new|null|package|private|protected|public|return|short|static|super|switch|synchronized|this|throw|throws|transient|true|try|typeof|var|void|volatile|while|window|with|yield)$/,
                '$1_'
            ); // avoid reserved keywords
    }

    function d3_min(array) {
        var i = -1;
        var n = array.length;
        var a;
        var b;
        if (arguments.length === 1) {
            while (++i < n)
                if ((b = array[i]) != null && b >= b) {
                    a = b;
                    break;
                }
            while (++i < n) if ((b = array[i]) != null && a > b) a = b;
        }
        return a;
    }
    function d3_max(array) {
        var i = -1;
        var n = array.length;
        var a;
        var b;
        if (arguments.length === 1) {
            while (++i < n)
                if ((b = array[i]) != null && b >= b) {
                    a = b;
                    break;
                }
            while (++i < n) if ((b = array[i]) != null && b > a) a = b;
        }
        return a;
    }
    function d3_sum(array) {
        var s = 0;
        var n = array.length;
        var a;
        var i = -1;
        if (arguments.length === 1) {
            while (++i < n) if (d3_numeric((a = +array[i]))) s += a;
        }
        return s;
    }
    function d3_mean(array) {
        var s = 0;
        var n = array.length;
        var a;
        var i = -1;
        var j = n;
        while (++i < n)
            if (d3_numeric((a = d3_number(array[i])))) s += a;
            else --j;
        if (j) return s / j;
    }
    function d3_median(array) {
        var numbers = [];
        var n = array.length;
        var a;
        var i = -1;
        if (arguments.length === 1) {
            while (++i < n) if (d3_numeric((a = d3_number(array[i])))) numbers.push(a);
        }
        if (numbers.length) return d3_quantile(numbers.sort(d3_ascending), 0.5);
    }
    function d3_quantile(values, p) {
        var H = (values.length - 1) * p + 1;
        var h = Math.floor(H);
        var v = +values[h - 1];
        var e = H - h;
        return e ? v + e * (values[h] - v) : v;
    }
    function d3_number(x) {
        return x === null ? NaN : +x;
    }
    function d3_numeric(x) {
        return !isNaN(x);
    }
    function d3_ascending(a, b) {
        return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
    }
    function left_pad(s, l, pad) {
        s = String(s);
        while (s.length < l) s = String(pad) + s;
        return s;
    }
}
