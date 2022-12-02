import { formatDelimited, guessDelimiterFromLocale } from '../utils/delimited.mjs';
import { isString, range, each } from 'underscore';

/*
 * Dataset class
 * @class dw.Dataset
 *
 * @param {dw.Column[]} columns
 */
export default function Dataset(columns) {
    // make column names unique
    const columnsByName = {};
    const origColumns = columns.slice(0);

    columns.forEach(col => {
        uniqueName(col);
        columnsByName[col.name()] = col;
    });

    // sets a unique name for a column
    function uniqueName(col) {
        const origColName = col.name();
        let baseColName, suffix, colName;
        if (origColName) {
            baseColName = origColName;
            suffix = 0;
            colName = baseColName;
        } else {
            baseColName = 'X';
            suffix = 1;
            colName = `${baseColName}.${suffix}`;
        }
        while (Object.prototype.hasOwnProperty.call(columnsByName, colName)) {
            colName = `${baseColName}.${++suffix}`;
        }
        if (colName !== origColName) {
            col.name(colName, origColName);
        }
    }

    // public interface
    const dataset = {
        /**
         * returns all columns of the dataset
         * @returns {dw.Column[]}
         */
        columns() {
            return columns;
        },

        /**
         * returns a specific column by name or index
         *
         * @param {string|number} nameOrIndex -- the name or index of the column to return
         * @returns {dw.Column}
         */
        column(nameOrIndex) {
            if (isString(nameOrIndex)) {
                // single column by name
                if (columnsByName[nameOrIndex] !== undefined) return columnsByName[nameOrIndex];
                throw new Error('No column found with that name: "' + nameOrIndex + '"');
            } else {
                if (nameOrIndex < 0) {
                    return;
                }
            }

            // single column by index
            if (columns[nameOrIndex] !== undefined) return columns[nameOrIndex];
            throw new Error('No column found with that name or index: ' + nameOrIndex);
        },

        /**
         * returns the number of columns in the dataset
         * @returns {number}
         */
        numColumns() {
            return columns.length;
        },

        /**
         * returns the number of rows in the dataset
         * @returns {number}
         */
        numRows() {
            return columns.length ? columns[0].length : 0;
        },

        /** calls a function for each column of the dataset */
        eachColumn(func) {
            columns.forEach(func);
        },

        /**
         * tests if a column name or index exists
         *
         * @param {string|number} nameOrIndex -- the name or index of the column
         * @returns {boolean}
         */
        hasColumn(nameOrIndex) {
            return (
                (isString(nameOrIndex) ? columnsByName[nameOrIndex] : columns[nameOrIndex]) !==
                undefined
            );
        },

        /**
         * returns the index of a column
         * @param {string} columnName
         * @returns {number}
         */
        indexOf(columnName) {
            if (!dataset.hasColumn(columnName)) return -1;
            return columns.indexOf(columnsByName[columnName]);
        },

        /**
         * returns a D3 friendly list of plain objects
         * @returns {object[]}
         */
        list() {
            if (!columns.length) {
                return [];
            }
            return range(columns[0].length).map(dataset.row);
        },

        /**
         * returns an object containing the column values of the row
         * @param {number} index the row index
         * @returns {object}
         */
        row(index) {
            if (!columns.length || index >= columns[0].length) {
                return {};
            }
            const o = {};
            columns.forEach(col => {
                o[col.name()] = col.val(index);
            });
            return o;
        },

        /**
         * returns a CSV string representation of the dataset
         * @param {Object} opt -- options
         * @param {boolean} [opt.includeComputedColumns=true] -- include computed columns in the CSV
         * @param {boolean} [opt.includeHeader=true] -- include header row in the CSV
         * @param {string} [opt.numeral=null] -- format numbers using this Numeral.js instance
         * @returns {string}
         */
        csv({
            includeComputedColumns = true,
            includeHeader = true,
            includeOrder = true,
            includeFiltered = false,
            numeral = null,
            ...opts
        } = {}) {
            if (!columns.length) {
                return '';
            }
            const numRows = dataset.numRows();
            const cols = includeOrder ? columns : origColumns;
            const filteredColumns = cols.filter(col => {
                if (!includeComputedColumns && col.isComputed) {
                    return false;
                }
                if (!includeFiltered && columns.indexOf(col) === -1) {
                    return false;
                }
                return true;
            });
            const table = filteredColumns.map(col => [
                ...(includeHeader ? [col.title()] : []),
                ...col.formatted(numeral)
            ]);
            const rows = table[0].map((_, i) => table.map(row => row[i])).slice(0, numRows + 1);
            if (!opts.delimiter && numeral) {
                opts.delimiter = guessDelimiterFromLocale(numeral);
            }
            return formatDelimited(rows, opts);
        },

        /**
         * @alias csv
         * @deprecated
         */
        toCSV() {
            return this.csv(...arguments);
        },

        /**
         * removes ignored columns from dataset
         * @param {object} ignore -- object of column names to ignore
         */
        filterColumns(ignore) {
            columns = columns.filter(c => !ignore[c.name()]);
            each(ignore, (ign, key) => {
                if (ign && columnsByName[key]) delete columnsByName[key];
            });
            return dataset;
        },

        /**
         * executes func for each row of the dataset
         */
        eachRow(func) {
            var i;
            for (i = 0; i < dataset.numRows(); i++) {
                func(i);
            }
            return dataset;
        },

        /**
         * adds a new column to the dataset
         * @param {dw.Column} column
         */
        add(column) {
            uniqueName(column);
            columns.push(column);
            columnsByName[column.name()] = column;
            origColumns.push(column);
            return dataset;
        },

        /**
         * cuts each column in the dataset to a maximum number of rows
         * @param {number} numRows
         * @returns {dw.Dataset}
         */
        limitRows(numRows) {
            columns.forEach(col => {
                col.limitRows(numRows);
            });
            return dataset;
        },

        /**
         * cuts the number of columns to a maximum value
         * @param {number} numCols
         * @returns {dw.Dataset}
         */
        limitColumns(numCols) {
            if (columns.length > numCols) {
                columns.length = numCols;
                origColumns.length = numCols;
            }
            return dataset;
        },

        /**
         * Sorts columns according to give `sortOrder`.
         *
         * Columns that don't appear in `sortOrder` will be put at the end.
         *
         * @param {number[]} sortOrder -- array of original column indexes in the desired order
         */
        columnOrder(sortOrder) {
            if (arguments.length) {
                const columnsWithNewIndexes = columns.map((column, i) => {
                    const newIndex = sortOrder.indexOf(i);
                    return [column, newIndex !== -1 ? newIndex : columns.length];
                });
                columns = columnsWithNewIndexes.sort((a, b) => a[1] - b[1]).map(x => x[0]);
                return dataset;
            }
            return columns.map(function (c) {
                return origColumns.indexOf(c);
            });
        },

        /**
         * make sure all columns have the same number of rows
         *
         * pad with empty string by default, because that's a neutral value that doesn't make the
         * cell invalid
         *
         * @param {*} [value=''] -- pad short columns with this value
         */
        align(value = '') {
            const maxNumRows = Math.max(...columns.map(column => column.length));
            for (const column of columns) {
                const padding = Array(maxNumRows - column.length).fill(value);
                column.add(...padding);
            }
        },

        /**
         * create a copy of the dataset
         * @returns {dw.Dataset}
         */
        clone() {
            return Dataset(columns.map(column => column.clone()));
        },

        /**
         * remove all rows from all columns of the dataset
         */
        clear() {
            for (const column of columns) {
                column.clear();
            }
        },

        /**
         * deletes one or more rows from dataset
         * @param {...number} rowIndex
         * @returns {dw.Dataset}
         */
        deleteRow(...rowIndexes) {
            rowIndexes.sort();
            for (const column of columns) {
                let numDeleted = 0;
                rowIndexes.forEach(rowIndex => {
                    const deletedRows = column.deleteRow(rowIndex - numDeleted);
                    numDeleted += deletedRows.length;
                });
            }
            return dataset;
        }
    };

    return dataset;
}
