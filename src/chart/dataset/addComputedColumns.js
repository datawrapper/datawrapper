import _each from 'underscore-es/each';
import _isDate from 'underscore-es/isDate';
import _isBoolean from 'underscore-es/isBoolean';
import _isNumber from 'underscore-es/isNumber';
import column from './column';
import arrayMin from 'd3-array/src/min';
import arrayMax from 'd3-array/src/max';
import arraySum from 'd3-array/src/sum';
import arrayMean from 'd3-array/src/mean';
import arrayMedian from 'd3-array/src/median';

export default function(chart, dataset) {
    const virtualColumns = chart.getMetadata('describe.computed-columns', {});
    const data = dataset.list();
    const columnNameToVar = {};
    const columnAggregates = {};

    dataset.eachColumn(function(col) {
        if (col.isComputed) return;
        columnNameToVar[col.name()] = convertColumnNameToVariable(col.name());
        if (col.type() === 'number') {
            columnAggregates[col.name()] = {
                min: arrayMin(col.values()),
                max: arrayMax(col.values()),
                sum: arraySum(col.values()),
                mean: arrayMean(col.values()),
                median: arrayMedian(col.values())
            };
        }
    });

    _each(virtualColumns, addComputedColumn);

    return dataset;

    function addComputedColumn(formula, name) {
        const datefmt = d => {
            return (
                d.getFullYear() +
                '-' +
                leftPad(1 + d.getMonth(), 2, 0) +
                '-' +
                leftPad(1 + d.getDate(), 2, 0)
            );
        };
        const values = data
            .map((row, rowIndex) => {
                var context = [];
                context.push('var __row = ' + rowIndex + ';');
                row.forEach((val, key) => {
                    if (!columnNameToVar[key]) return;
                    context.push('var ' + columnNameToVar[key] + ' = ' + JSON.stringify(val) + ';');
                    if (dataset.column(key).type() === 'number') {
                        context.push(
                            'var ' +
                                columnNameToVar[key] +
                                '__sum = ' +
                                columnAggregates[key].sum +
                                ';'
                        );
                        context.push(
                            'var ' +
                                columnNameToVar[key] +
                                '__min = ' +
                                columnAggregates[key].min +
                                ';'
                        );
                        context.push(
                            'var ' +
                                columnNameToVar[key] +
                                '__max = ' +
                                columnAggregates[key].max +
                                ';'
                        );
                        context.push(
                            'var ' +
                                columnNameToVar[key] +
                                '__mean = ' +
                                columnAggregates[key].mean +
                                ';'
                        );
                        context.push(
                            'var ' +
                                columnNameToVar[key] +
                                '__median = ' +
                                columnAggregates[key].median +
                                ';'
                        );
                    }
                });
                context.push('var max = Math.max, min = Math.min;');
                // console.log(context.join('\n'));
                return function() {
                    try {
                        return eval(this.context.join('\n') + '\n' + formula); // eslint-disable-line
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
        const virtualColumn = column(name, values);
        virtualColumn.isComputed = true;
        dataset.add(virtualColumn);
    }

    function convertColumnNameToVariable(name) {
        // if you change this, change computed-columns.js as well
        return name
            .toString()
            .toLowerCase()
            .replace(/\s+/g, '_') // Replace spaces with _
            .replace(/[^\w-]+/g, '') // Remove all non-word chars
            .replace(/-/g, '_') // Replace multiple - with single -
            .replace(/__+/g, '_') // Replace multiple - with single -
            .replace(/^_+/, '') // Trim - from start of text
            .replace(/_+$/, '') // Trim - from end of text
            .replace(/^(\d)/, '_$1') // If first char is a number, prefix with _
            .replace(
                /^(abstract|arguments|await|boolean|break|byte|case|catch|char|class|const|continue|debugger|default|delete|do|double|else|enum|eval|export|extends|false|final|finally|float|for|function|goto|if|implements|import|in|instanceof|int|interface|let|long|native|new|null|package|private|protected|public|return|short|static|super|switch|synchronized|this|throw|throws|transient|true|try|typeof|var|void|volatile|while|window|with|yield)$/,
                '$1_'
            ); // avoid reserved keywords
    }

    function leftPad(s, l, pad) {
        s = String(s);
        while (s.length < l) s = String(pad) + s;
        return s;
    }
}
