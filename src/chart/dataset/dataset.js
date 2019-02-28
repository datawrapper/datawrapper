import _range from 'underscore-es/range';
import _each from 'underscore-es/each';
import _isString from 'underscore-es/isString';

/*
 * Dataset class
 * @class dw.Dataset
 *
 * @param {dw.Column[]} columns
 */
export default function(columns) {
    // make column names unique
    let columnsByName = {};
    const origColumns = columns.slice(0);

    columns.forEach(col => {
        uniqueName(col);
        columnsByName[col.name()] = col;
    });

    // sets a unique name for a column
    function uniqueName(col) {
        const origColName = col.name();
        let colName = origColName;
        let appendix = 1;

        while (columnsByName.hasOwnProperty(colName)) {
            colName = origColName + '.' + appendix++;
        }
        if (colName !== origColName) col.name(colName); // rename column
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
            if (_isString(nameOrIndex)) {
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
            return columns[0].length;
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
                (_isString(nameOrIndex) ? columnsByName[nameOrIndex] : columns[nameOrIndex]) !==
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
            return _range(columns[0].length).map(function(r) {
                var o = {};
                columns.forEach(col => {
                    o[col.name()] = col.val(r);
                });
                return o;
            });
        },

        /**
         * returns a CSV string representation of the dataset
         * @returns {string}
         */
        csv() {
            let csv = '';
            const sep = ',';
            const quote = '"';
            // add header
            columns.forEach((col, i) => {
                var t = col.title();
                if (t.indexOf(quote) > -1) t.replace(quote, '\\' + quote);
                if (t.indexOf(sep) > -1) t = quote + t + quote;
                csv += (i > 0 ? sep : '') + t;
            });
            // add values
            _range(dataset.numRows()).forEach(row => {
                csv += '\n';
                columns.forEach((col, i) => {
                    var t = '' + (col.type() === 'date' ? col.raw(row) : col.val(row));
                    if (t.indexOf(quote) > -1) t.replace(quote, '\\' + quote);
                    if (t.indexOf(sep) > -1) t = quote + t + quote;
                    csv += (i > 0 ? sep : '') + t;
                });
            });
            return csv;
        },

        /**
         * @alias csv
         * @deprecated
         */
        toCSV() {
            return this.csv();
        },

        /**
         * removes ignored columns from dataset
         * @param {object} ignore -- object of column names to ignore
         */
        filterColumns(ignore) {
            columns = columns.filter(c => !ignore[c.name()]);
            _each(ignore, (ign, key) => {
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
         * resets the datasets to its original columns
         * @returns {dw.Dataset}
         */
        reset() {
            columns = origColumns.slice(0);
            columnsByName = {};
            columns.forEach(col => {
                columnsByName[col.name()] = col;
            });
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
         * returns the columns in a given order
         * @param {number[]} sortOrder -- array of indexes
         */
        columnOrder(sortOrder) {
            if (arguments.length) {
                columns.length = 0;
                sortOrder.forEach(function(i) {
                    columns.push(origColumns[i]);
                });
                return dataset;
            }
            return columns.map(function(c) {
                return origColumns.indexOf(c);
            });
        }
    };

    return dataset;
}
