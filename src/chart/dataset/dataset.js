import _range from 'underscore-es/range';
import _isString from 'underscore-es/isString';

/*
 * Dataset class
 */
export default function(columns) {
    // make column names unique
    var columnsByName = {};
    var origColumns = columns.slice(0);

    columns.forEach(col => {
        uniqueName(col);
        columnsByName[col.name()] = col;
    });

    // sets a unique name for a column
    function uniqueName(col) {
        var origColName = col.name();
        var colName = origColName;
        var appendix = 1;

        while (columnsByName.hasOwnProperty(colName)) {
            colName = origColName + '.' + appendix++;
        }
        if (colName != origColName) col.name(colName); // rename column
    }

    // public interface
    const dataset = {
        columns() {
            return columns;
        },

        column(x) {
            if (_isString(x)) {
                // single column by name
                if (columnsByName[x] !== undefined) return columnsByName[x];
                throw 'No column found with that name: "' + x + '"';
            } else {
                if (x < 0) {
                    return;
                }
            }

            // single column by index
            if (columns[x] !== undefined) return columns[x];
            throw 'No column found with that index: ' + x;
        },

        numColumns() {
            return columns.length;
        },

        numRows() {
            return columns[0].length;
        },

        eachColumn(func) {
            columns.forEach(func);
        },

        hasColumn(x) {
            return (_isString(x) ? columnsByName[x] : columns[x]) !== undefined;
        },

        indexOf(column_name) {
            if (!dataset.hasColumn(column_name)) return -1;
            return columns.indexOf(columnsByName[column_name]);
        },

        /*
         * returns a D3 friendly list of objects
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

        csv() {
            var csv = '';
            var sep = ',';
            var quote = '"';
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
                    var t = '' + (col.type() == 'date' ? col.raw(row) : col.val(row));
                    if (t.indexOf(quote) > -1) t.replace(quote, '\\' + quote);
                    if (t.indexOf(sep) > -1) t = quote + t + quote;
                    csv += (i > 0 ? sep : '') + t;
                });
            });
            return csv;
        },

        // DEPRECATED
        toCSV() {
            return this.csv();
        },

        /*
         * removes ignored columns from dataset
         */
        filterColumns(ignore) {
            columns = columns.filter(c => !ignore[c.name()]);
            ignore.forEach((ign, key) => {
                if (ign && columnsByName[key]) delete columnsByName[key];
            });
            return dataset;
        },

        /*
         * executes func for each row of the dataset
         */
        eachRow(func) {
            var i;
            for (i = 0; i < dataset.numRows(); i++) {
                func(i);
            }
            return dataset;
        },

        /*
         * adds a new column to the dataset
         */
        add(column) {
            uniqueName(column);
            columns.push(column);
            columnsByName[column.name()] = column;
            origColumns.push(column);
            return dataset;
        },

        reset() {
            columns = origColumns.slice(0);
            columnsByName = {};
            columns.forEach(col => {
                columnsByName[col.name()] = col;
            });
            return dataset;
        },

        limitRows(numRows) {
            columns.forEach(col => {
                col.limitRows(numRows);
            });
            return dataset;
        },

        limitColumns(numCols) {
            if (columns.length > numCols) {
                columns.length = numCols;
                origColumns.length = numCols;
            }
            return dataset;
        },

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
