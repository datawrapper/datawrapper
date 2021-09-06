import { each, isBoolean, isDate, isNumber, isNull } from 'underscore';
import column from './column.mjs';
import columnNameToVariable from '@datawrapper/shared/columnNameToVariable.js';
import get from '@datawrapper/shared/get.js';
import applyChanges from './applyChanges.mjs';
import { Parser } from '../utils/parser.mjs';

export default function addComputedColumns(chart, dataset) {
    let virtualColumns = get(chart.get(), 'metadata.describe.computed-columns', {});
    if (!Array.isArray(virtualColumns)) {
        // convert to array
        virtualColumns = Object.keys(virtualColumns).reduce((acc, cur) => {
            acc.push({
                name: cur,
                formula: virtualColumns[cur]
            });
            return acc;
        }, []);
    }

    const data = applyChanges(chart, dataset).list();
    const columnNameToVar = {};
    const colAggregates = {};
    const parser = new Parser();

    dataset.eachColumn(function(col) {
        if (col.isComputed) return;
        columnNameToVar[col.name()] = columnNameToVariable(col.name());
        if (col.type() === 'number') {
            const [min, max] = col.range();
            colAggregates[col.name()] = {
                min,
                max,
                sum: col.sum(),
                mean: col.mean(),
                median: col.median()
            };
        } else if (col.type() === 'date') {
            const [min, max] = col.range();
            colAggregates[col.name()] = { min, max };
        }
    });

    // initialize meta objects for each computed column
    const vNamesToVar = virtualColumns.reduce((acc, val, idx) => {
        const key = columnNameToVariable(val.name);
        return acc.set(key, {
            name: val.name,
            index: dataset.numColumns() + idx,
            key,
            formula: val.formula,
            visited: 0,
            computed: false,
            dependsOn: []
        });
    }, new Map());

    // parse formulas to detect cross-column dependencies
    virtualColumns.forEach(({ formula, name }) => {
        const col = vNamesToVar.get(columnNameToVariable(name));
        if (formula.trim()) {
            try {
                col.expr = parser.parse(formula.trim());
                col.expr.variables().forEach(v => {
                    v = v.split('__')[0];
                    if (vNamesToVar.has(v)) {
                        col.dependsOn.push(vNamesToVar.get(v));
                    }
                });
            } catch (e) {
                col.error = e.message;
                // console.error('err', e);
            }
        } else {
            col.expr = {
                evaluate() {
                    return '';
                },
                variables() {
                    return [];
                }
            };
        }
    });

    // sort computed columns in order of their dependency graph
    // circular dependencies are not allowed and will result in
    // errors
    const computedColumns = [];

    let curIter = 0;
    while (vNamesToVar.size) {
        if (curIter > 1000) break;
        vNamesToVar.forEach(col => {
            curIter++;
            try {
                visit(col, []);
            } catch (e) {
                if (e.message.startsWith('circular-dependency')) {
                    col.error = e.message;
                    // col.computed = true;
                    vNamesToVar.delete(col.key);
                    computedColumns.push(col);
                } else {
                    throw e;
                }
            }
        });
    }

    // compute in order of dependencies
    computedColumns.forEach(col => {
        if (col.error) {
            const errorCol = column(
                col.name,
                data.map(() => 'null')
            );
            errorCol.isComputed = true;
            errorCol.formula = col.formula;
            errorCol.errors = [
                {
                    message: col.error,
                    row: 'all'
                }
            ];
            col.column = errorCol;
        } else {
            col.column = addComputedColumn(col);
        }
    });

    // add to dataset in original order
    computedColumns.sort((a, b) => a.index - b.index).forEach(({ column }) => dataset.add(column));

    return dataset;

    function visit(col, stack) {
        if (col.computed) return;
        stack.push(col.name);
        for (let i = 0; i < stack.length - 2; i++) {
            if (col.name === stack[i]) {
                throw new Error('circular-dependency: ' + stack.join(' ‣ '));
            }
        }
        col.curIter = curIter;
        let allComputed = true;
        for (let i = 0; i < col.dependsOn.length; i++) {
            allComputed = allComputed && col.dependsOn[i].computed;
        }
        if (allComputed) {
            // no dependencies, we can compute this now
            col.computed = true;
            computedColumns.push(col);
            vNamesToVar.delete(col.key);
        } else {
            if (stack.length < 10) {
                col.dependsOn.forEach(c => {
                    visit(c, stack.slice(0));
                });
            }
        }
    }

    function addComputedColumn({ formula, name, expr, error, index }) {
        const errors = [];
        if (error) {
            errors.push({ row: 'all', message: error });
        }

        // create a map of changes for this column
        const changes = get(chart, 'metadata.data.changes', [])
            .filter(change => change.column === index && change.row > 0)
            .reduce((acc, cur) => {
                const old = acc.get(cur.row - 1);
                if (old) {
                    // overwrite previous value
                    cur.previous = old.previous;
                }
                acc.set(cur.row - 1, cur);
                return acc;
            }, new Map());

        const values = data.map(function(row, index) {
            const context = {
                ROWNUMBER: index
            };
            each(row, function(val, key) {
                if (!columnNameToVar[key]) return;
                context[columnNameToVar[key]] = val;
                if (colAggregates[key]) {
                    Object.keys(colAggregates[key]).forEach(aggr => {
                        context[`${columnNameToVar[key]}__${aggr}`] = colAggregates[key][aggr];
                    });
                }
            });
            let value;
            try {
                value = expr.evaluate(context);
                if (typeof value === 'function') {
                    errors.push({ message: 'formula returned function', row: index });
                    value = null;
                }
            } catch (error) {
                errors.push({ message: error.message, row: index });
                value = null;
            }
            if (changes.has(index)) {
                const change = changes.get(index);
                if (change.previous === undefined || change.previous == value) {
                    // we have a change and it's still valid
                    return change.value;
                }
            }
            return value;
        });
        columnNameToVar[name] = columnNameToVariable(name);
        // apply values to rows so they can be used in formulas
        values.forEach((val, i) => {
            data[i][name] = val;
        });
        var virtualColumn = column(
            name,
            values.map(function(v) {
                if (isBoolean(v)) return v ? 'yes' : 'no';
                if (isDate(v)) return v.toISOString();
                if (isNumber(v)) return String(v);
                if (isNull(v)) return null;
                return String(v);
            })
        );
        // aggregate values
        if (virtualColumn.type() === 'number') {
            const [min, max] = virtualColumn.range();
            colAggregates[name] = {
                min,
                max,
                sum: virtualColumn.sum(),
                mean: virtualColumn.mean(),
                median: virtualColumn.median()
            };
        } else if (virtualColumn.type() === 'date') {
            const [min, max] = virtualColumn.range();
            colAggregates[name] = { min, max };
        }
        virtualColumn.isComputed = true;
        virtualColumn.errors = errors;
        virtualColumn.formula = formula;
        return virtualColumn;
    }
}
