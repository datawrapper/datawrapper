
/*
 * Dataset class
 */
dw.dataset = function(columns, opts) {

    // make column names unique
    var columnsByName = {};
    _.each(columns, function(col) {
        var origColName = col.name(),
            colName = origColName,
            appendix = 1;

        while (columnsByName.hasOwnProperty(colName)) {
            colName = origColName+'.'+(appendix++);
        }
        if (colName != origColName) col.name(colName); // rename column
        columnsByName[colName] = col;
    });

    opts = _.extend(opts, {  });

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
                    var t = ''+col.val(row);
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
            return dataset;
        },


        // -----------------------------------------
        // everything below this line is kept for
        // backward compatibility only
        // -----------------------------------------

        series: function(x) {
            if (x !== undefined) {
                return dataset.column(x);
            }
            return dataset.columns();
        },

        /*
         * DEPREACTED
         */
        eachSeries: function(func) {
            _.each(columns, func);
        },

        eachRow: function(func) {
            var i;
            for (i=0; i<dataset.numRows(); i++) {
                func(i);
            }
        },

        rowNames: function() {
            return columns[0].raw();
        },

        /*
         * DEPRECATED
         *
         * This function emulates the old rowName API by returning
         * the raw value of the first column.
         */
        rowName: function(i) {
            if (i < 0) i += dataset.numRows();
            return columns[0].raw()[i];
        },

        // return the name of the first column
        rowNameLabel: function() {
            return columns[0].name();
        },

        /*
         * removes every row except the one with index i
         * and updates min, max and total of each series
         */
        filterRows: function(rows) {
            _.each(columns, function(col) {
                if (rows) col.filterRows(rows);
                else col.filterRows();
            });
        },

        /**
         * Returns true if the datasets row labels could
         * correctly be parsed as date values.
         */
        isTimeSeries: function() {
            return this.__rowDates !== undefined;
        },

        /**
         * Returns a Date object for a given row.
         */
        rowDate: function(i) {
            if (i < 0) i += this.__rowDates.length;
            return this.__rowDates[i];
        },

        /**
         * Returns (a copy of) the list of all rows Date objects.
         */
        rowDates: function() {
            return this.__rowDates.slice(0);
        },

        /**
         * Returns array of min/max values
         */
        minMax: function() {
            return dw.utils.minMax(dataset.columns());
        }

    };
    return dataset;
};

