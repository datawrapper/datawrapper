import column from '../dataset/column.js';
import resolveVisAxesDefinitions from './resolveVisAxesDefinitions.js';

import each from 'lodash/each.js';
import isArray from 'lodash/isArray.js';
import filter from 'lodash/filter.js';
import find from 'lodash/find.js';
import indexOf from 'lodash/indexOf.js';
import map from 'lodash/map.js';
import range from 'lodash/range.js';
/**
 * Assigns dataset columns to visualization axes. Non-optional columns will automatically be
 * assigned based on a matching column type and column name (if the vis axis defined a regex).
 *
 * Optional axes can define a `overrideOptionalKey` which will turn it into a non-optional axis in
 * case the specified metadata key contains a truthy value.
 *
 * @param {Dataset} dataset - the parsed dataset
 * @param {object} visAxes - axis definitions from visualization
 * @param {object} userAxes - user preferences for axis assignments
 *                            (from chart.metadata.axis)
 * @param {object} overrideKeys - map of all axes overrideOptionalKeys
 *                                and the current metadata values
 * @returns {object}
 */
export default function populateVisAxes({ dataset, visAxes, userAxes, overrideKeys = {} }) {
    visAxes = resolveVisAxesDefinitions(visAxes, overrideKeys);
    userAxes = userAxes || {};
    const usedColumns = {};
    const axes = {};
    const axesAsColumns = {};

    // pull axes that may not be reused to the front, so they get assigned first
    visAxes = Object.fromEntries(
        Object.entries(visAxes).sort(([, a], [, b]) => {
            return a.preventMultipleUse && !b.preventMultipleUse
                ? -1
                : !a.preventMultipleUse && b.preventMultipleUse
                  ? 1
                  : 0;
        })
    );

    // get user preference
    each(visAxes, (axisDef, key) => {
        if (userAxes[key]) {
            let columns = userAxes[key];
            if (
                columnExists(columns) &&
                checkColumn(axisDef, columns, true) &&
                !!axisDef.multiple === isArray(columns)
            ) {
                axes[key] = axisDef.multiple && !isArray(columns) ? [columns] : columns;
                // mark columns as used
                if (!isArray(columns)) columns = [columns];
                each(columns, function (column) {
                    usedColumns[column] = true;
                });
            }
        }
    });

    var checked = [];

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
            const usedUserAxes = Object.values(userAxes).filter(axis => axis in usedColumns);
            let countUnused = 0;
            const reusable = [];
            dataset.eachColumn(c => {
                const unused = checkColumn(axisDef, c);
                if (unused) {
                    countUnused++;
                } else if (usedUserAxes.includes(c.name()) && checkColumn(axisDef, c, true)) {
                    reusable.push(c.name());
                }
            });
            return { available: countUnused, reusable };
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
                    // no unused column found for this axis! We have to resort to reusing one,
                    // or if there are no available columns, to generate one (text columns only)

                    // Note: unclear why this logic historically hasn't been applied for date columns
                    // @todo: maybe revisit this
                    if (['text', 'number'].some(type => axisDef.accepts.includes(type))) {
                        const usedColumnsMap = getColumnAxisMap(axes);

                        // only allow reusing columns that may be reused, and match the allowed types for this axis
                        const acceptedAllowUsed = filter(dataset.columns(), function (col) {
                            if (!axisDef.accepts.includes(col.type())) return false;
                            const usedFor = usedColumnsMap[col.name()];
                            if (usedFor && visAxes[usedFor].preventMultipleUse) {
                                return false;
                            }
                            return true;
                        });

                        if (acceptedAllowUsed.length) {
                            // reuse first available assigned column
                            const column = acceptedAllowUsed[0].name();
                            // if this axis column may not be reused
                            // we need to unassign it from the previous assignment
                            if (axisDef.preventMultipleUse) {
                                const usedForAxis = usedColumnsMap[column];
                                // undo previous assignment, in favour of assigning to this non-reusable axis
                                if (usedForAxis && userAxes[usedForAxis]) {
                                    axes[usedForAxis] = false;
                                }
                            }
                            axes[key] = column;
                        } else {
                            // axis accepts text column, but there is no other text column in dataset,
                            // lets genetate one with A,B,C,D...
                            if (axisDef.accepts.includes('text')) {
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
                            } else {
                                // no useable column found for this axis
                                axes[key] = false;
                            }
                        }
                    }
                }
            } else {
                const required = remainingRequiredColumns(axisDef.accepts);
                const availableColumnsResult = remainingAvailableColumns(dataset);
                let { available } = availableColumnsResult;
                const { reusable } = availableColumnsResult;

                // fill axis with all accepted columns
                axes[key] = [];
                dataset.eachColumn(function (c) {
                    // if we haven't found any columns for this axis
                    // and no unused columns are available, allow reusing a user-assigned axis
                    const allowReuseAxis =
                        !available && !axes[key].length && reusable.includes(c.name());
                    if (required === 'multiple' && axes[key].length) return;
                    else if (available <= required && !allowReuseAxis) return;
                    if (checkColumn(axisDef, c, allowReuseAxis)) {
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

    /**
     * Determines whether or not a particular column can be assigned to a given axis
     * Depending on whether it is accepted by the axis type, and isn't already used
     */
    function checkColumn(axisDef, columns, allowMultipleUse) {
        if (!isArray(columns)) columns = [columns];
        columns = columns.map(el => (typeof el === 'string' ? dataset.column(el) : el));
        for (var i = 0; i < columns.length; i++) {
            const columnName = columns[i].name();
            const usedForAxis = getColumnAxisMap(axes)[columnName];
            if (usedForAxis && visAxes[usedForAxis].preventMultipleUse) {
                allowMultipleUse = false;
            }
            if (
                (!allowMultipleUse && usedColumns[columnName]) ||
                indexOf(axisDef.accepts, columns[i].type()) === -1
            ) {
                return false;
            }
        }
        return true;
    }

    function getColumnAxisMap(axes) {
        return Object.entries(axes).reduce((usedColumns, [key, column]) => {
            if (column) {
                if (isArray(column)) {
                    column.forEach(column => (usedColumns[column] = key));
                } else {
                    usedColumns[column] = key;
                }
            }
            return usedColumns;
        }, {});
    }
}
