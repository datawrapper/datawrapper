
/*
 * Dataset class
 */
dw.dataset = function(columns, opts) {

    // make column names unique
    var columnsByName = {},
        origColumns = columns.slice(0);
    _.each(columns, function(col) {
        uniqueName(col);
        columnsByName[col.name()] = col;
    });

    opts = _.extend(opts, {  });

    // sets a unique name for a column
    function uniqueName(col) {
        var origColName = col.name(),
            colName = origColName,
            appendix = 1;

        while (columnsByName.hasOwnProperty(colName)) {
            colName = origColName+'.'+(appendix++);
        }
        if (colName != origColName) col.name(colName); // rename column
    }


    // public interface
    var dataset = {

        columns: function() {
            return columns;
        },

        column: function(x) {
            if (_.isString(x)) {
                // single column by name
                if (columnsByName[x] !== undefined) return columnsByName[x];
                throw 'No column found with that name: "'+x+'"';
            } else {
                if (x < 0) {
                    return;
                }
            }

            // single column by index
            if (columns[x] !== undefined) return columns[x];
            throw 'No column found with that index: '+x;
        },

        numColumns: function() {
            return columns.length;
        },

        numRows: function() {
            return columns[0].length;
        },

        eachColumn: function(func) {
            _.each(columns, func);
        },

        hasColumn: function(x) {
            return (_.isString(x) ? columnsByName[x] : columns[x]) !== undefined;
        },

        indexOf: function(column_name) {
            if (!dataset.hasColumn(column_name)) return -1;
            return _.indexOf(columns, columnsByName[column_name]);
        },

        /*
         * returns a D3 friendly list of objects
         */
        list: function() {
            return _.range(columns[0].length).map(function(r) {
                var o = {};
                _.each(columns, function(col) { o[col.name()] = col.val(r); });
                return o;
            });
        },

        toCSV: function() {
            var csv = "",
                sep = ",",
                quote = "\"";
            // add header
            _.each(columns, function(col, i) {
                var t = col.title();
                if (t.indexOf(quote) > -1) t.replace(quote, '\\'+quote);
                if (t.indexOf(sep) > -1) t = quote + t + quote;
                csv += (i > 0 ? sep : '') + t;
            });
            // add values
            _.each(_.range(dataset.numRows()), function(row) {
                csv += '\n';
                _.each(columns, function(col, i) {
                    var t = ''+(col.type() == 'date' ? col.raw(row) : col.val(row));
                    if (t.indexOf(quote) > -1) t.replace(quote, '\\'+quote);
                    if (t.indexOf(sep) > -1) t = quote + t + quote;
                    csv += (i > 0 ? sep : '') + t;
                });
            });
            return csv;
        },

        /*
         * removes ignored columns from dataset
         */
        filterColumns: function(ignore) {
            columns = _.filter(columns, function(c) {
                return !ignore[c.name()];
            });
            _.each(ignore, function(ign, key) {
                if (ign && columnsByName[key]) delete columnsByName[key];
            });
            return dataset;
        },

        /*
         * executes func for each row of the dataset
         */
        eachRow: function(func) {
            var i;
            for (i=0; i<dataset.numRows(); i++) {
                func(i);
            }
            return dataset;
        },

        /*
         * adds a new column to the dataset
         */
        add: function(column) {
            uniqueName(column);
            columns.push(column);
            columnsByName[column.name()] = column;
            return dataset;
        },

        reset: function() {
            columns = origColumns.slice(0);
            columnsByName = {};
            _.each(columns, function(col) {
                columnsByName[col.name()] = col;
            });
            return dataset;
        }

    };
    return dataset;
};

