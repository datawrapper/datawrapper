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

    function escapeCSVValue(value, delimiter, quoteChar) {
        const s = String(value);
        if (s.indexOf(quoteChar) !== -1) {
            // A double-quote appearing inside a field MUST be escaped by preceding it with another
            // double quote, and the field itself MUST be enclosed in double quotes.
            // See paragraph 8 at https://csv-spec.org/#csv-format-specification
            return (
                quoteChar + s.replace(new RegExp(quoteChar, 'g'), quoteChar + quoteChar) + quoteChar
            );
        }
        if (new RegExp(`[\n\r${delimiter}]`).test(s)) {
            // Fields containing line breaks (CRLF, LF, or CR), double quotes, or the delimiter
            // character (normally a comma) MUST be enclosed in double-quotes.
            // See paragraph 7 at https://csv-spec.org/#csv-format-specification
            return quoteChar + s + quoteChar;
        }
        return s;
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
            return range(columns[0].length).map(function(r) {
                var o = {};
                columns.forEach(col => {
                    o[col.name()] = col.val(r);
                });
                return o;
            });
        },

        /**
         * returns a CSV string representation of the dataset
         * @param {Object} opt -- options
         * @param {boolean} [opt.includeComputedColumns=true] -- include computed columns in the CSV
         * @param {boolean} [opt.includeHeader=true] -- include header row in the CSV
         * @returns {string}
         */
        csv({
            includeComputedColumns = true,
            includeHeader = true,
            delimiter = ',',
            quoteChar = '"',
            lineTerminator = '\n'
        } = {}) {
            const numRows = dataset.numRows();
            const rows = [];
            const filteredColumns = includeComputedColumns
                ? columns
                : columns.filter(col => !col.isComputed);
            if (includeHeader) {
                rows.push(filteredColumns.map(col => col.title()));
            }
            for (var row = 0; row < numRows; row++) {
                rows.push(
                    filteredColumns.map(col =>
                        col.type() === 'date' ? col.raw(row) : col.val(row)
                    )
                );
            }
            return rows
                .map(row =>
                    row.map(value => escapeCSVValue(value, delimiter, quoteChar)).join(delimiter)
                )
                .join(lineTerminator);
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
         * deletes a row from dataset
         * @param {number} rowIndex
         * @returns {dw.Dataset}
         */
        deleteRow(rowIndex) {
            columns.forEach(col => {
                col.deleteRow(rowIndex);
            });
            return dataset;
        }
    };

    return dataset;
}
