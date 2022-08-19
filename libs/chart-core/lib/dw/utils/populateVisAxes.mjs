import column from '../dataset/column.mjs';
import { each, isArray, filter, find, indexOf, map, range } from 'underscore';

/**
 * Assign dataset columns to visualization axes. Non-optional columns
 * will automatically be assigned based on a matching column type and
 * column name (if the vis axis defined a regex).
 *
 * Optional axes can define a `overrideOptionalKey` which will turn
 * it into a non-optional axis in case the specified metadata key
 * contains a truthy value.
 *
 * @param {Dataset} dataset - the parsed dataset
 * @param {object} visAxes - axis definitions from visualization
 * @param {object} userAxes - user preferences for axis assignments
 *                            (from chart.metadata.axis)
 * @param {object} overrideKeys - map of all axes overrideOptionalKeys
 *                                and the current metadata values
 * @returns {object}
 */
export default function populateVisAxes({ dataset, visAxes, userAxes, overrideKeys }) {
    userAxes = userAxes || {};
    overrideKeys = overrideKeys || {};
    const usedColumns = {};
    const axes = {};
    const axesAsColumns = {};

    // get user preference
    each(visAxes, (o, key) => {
        if (userAxes[key]) {
            let columns = userAxes[key];

            if (o.optional && o.overrideOptionalKey && !overrideKeys[o.overrideOptionalKey]) {
                return;
            }

            if (
                columnExists(columns) &&
                checkColumn(o, columns, true) &&
                !!o.multiple === isArray(columns)
            ) {
                axes[key] = o.multiple && !isArray(columns) ? [columns] : columns;
                // mark columns as used
                if (!isArray(columns)) columns = [columns];
                each(columns, function (column) {
                    usedColumns[column] = true;
                });
            }
        }
    });

    var checked = [];

    each(visAxes, axisDef => {
        if (axisDef.optional) {
            // chart settings may override this
            if (axisDef.overrideOptionalKey && overrideKeys[axisDef.overrideOptionalKey]) {
                // now the axis is mandatory
                axisDef.optional = false;
            }
        }
    });

    // auto-populate remaining axes
    each(visAxes, (axisDef, key) => {
        function remainingRequiredColumns(accepts) {
            // returns how many required columns there are for the remaining axes
            // either an integer or "multiple" if there's another multi-column axis coming up
            function equalAccepts(a1, a2) {
                if (typeof a1 === 'undefined' && typeof a2 !== 'undefined') return false;
                if (typeof a2 === 'undefined' && typeof a1 !== 'undefined') return false;
                if (a1.length !== a2.length) return false;

                for (let i = 0; i < a1.length; i++) {
                    if (a2.indexOf(a1[i]) === -1) return false;
                }
                return true;
            }

            let res = 0;
            each(visAxes, function (axisDef, key) {
                if (checked.indexOf(key) > -1) return;
                if (!equalAccepts(axisDef.accepts, accepts)) return;
                if (typeof res === 'string') return;
                if (axisDef.optional) return;
                if (axisDef.multiple) {
                    res = 'multiple';
                    return;
                }
                res += 1;
            });
            return res;
        }
        function remainingAvailableColumns(dataset) {
            let count = 0;
            dataset.eachColumn(c => {
                if (checkColumn(axisDef, c)) {
                    count++;
                }
            });
            return count;
        }
        checked.push(key);
        if (axes[key]) return; // user has defined this axis already
        if (!axisDef.optional) {
            // we only populate mandatory axes
            if (!axisDef.multiple) {
                const accepted = filter(dataset.columns(), c => checkColumn(axisDef, c));
                let firstMatch;
                if (axisDef.preferred) {
                    // axis defined a regex for testing column names
                    const regex = new RegExp(axisDef.preferred, 'i');
                    firstMatch = find(accepted, function (col) {
                        return (
                            regex.test(col.name()) ||
                            (col.title() !== col.name() && regex.test(col.title()))
                        );
                    });
                }
                // simply use first colulmn accepted by axis
                if (!firstMatch) firstMatch = accepted[0];
                if (firstMatch) {
                    usedColumns[firstMatch.name()] = true; // mark column as used
                    axes[key] = firstMatch.name();
                } else {
                    // try to auto-populate missing text column
                    if (indexOf(axisDef.accepts, 'text') >= 0) {
                        // try using the first text column in the dataset instead
                        const acceptedAllowUsed = filter(dataset.columns(), function (col) {
                            return indexOf(axisDef.accepts, col.type()) >= 0;
                        });
                        if (acceptedAllowUsed.length) {
                            axes[key] = acceptedAllowUsed[0].name();
                        } else {
                            // no other text column in dataset, so genetate one with A,B,C,D...
                            const col = column(
                                key,
                                map(range(dataset.numRows()), function (i) {
                                    return (
                                        (i > 25 ? String.fromCharCode(64 + i / 26) : '') +
                                        String.fromCharCode(65 + (i % 26))
                                    );
                                }),
                                'text'
                            );
                            dataset.add(col);
                            usedColumns[col.name()] = true;
                            axes[key] = col.name();
                        }
                    }
                }
            } else {
                const required = remainingRequiredColumns(axisDef.accepts);
                let available = remainingAvailableColumns(dataset);

                // fill axis with all accepted columns
                axes[key] = [];
                dataset.eachColumn(function (c) {
                    if (required === 'multiple' && axes[key].length) return;
                    else if (available <= required) return;

                    if (checkColumn(axisDef, c)) {
                        usedColumns[c.name()] = true;
                        axes[key].push(c.name());
                        available--;
                    }
                });
            }
        } else {
            axes[key] = false;
        }
    });

    each(axes, (columns, key) => {
        if (!isArray(columns)) {
            axesAsColumns[key] = columns !== false ? dataset.column(columns) : null;
        } else {
            axesAsColumns[key] = [];
            each(columns, function (column, i) {
                axesAsColumns[key][i] = column !== false ? dataset.column(column) : null;
            });
        }
    });

    return { axes, axesAsColumns, usedColumns };

    function columnExists(columns) {
        if (!isArray(columns)) columns = [columns];
        for (var i = 0; i < columns.length; i++) {
            if (!dataset.hasColumn(columns[i])) return false;
        }
        return true;
    }

    function checkColumn(axisDef, columns, allowMultipleUse) {
        if (!isArray(columns)) columns = [columns];
        columns = columns.map(el => (typeof el === 'string' ? dataset.column(el) : el));
        for (var i = 0; i < columns.length; i++) {
            if (
                (!allowMultipleUse && usedColumns[columns[i].name()]) ||
                indexOf(axisDef.accepts, columns[i].type()) === -1
            ) {
                return false;
            }
        }
        return true;
    }
}
