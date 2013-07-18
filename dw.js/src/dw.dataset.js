
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

    opts = _.extend(opts, {
        firstColumnAsLabel: true
    });

    // public interface
    var dataset = {

        columns: function() {
            return columns;
        },

        column: function(x) {
            if (_.isString(x)) {
                // single series by name
                if (columnsByName[x] !== undefined) return columnsByName[x];
                throw 'No column found with that name: "'+x+'"';
            }
            // single series by index
            if (columns[x] !== undefined) return columns[x];
            throw 'No series found with that index: '+x;
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

        hasRowNames: function() {
            return opts.firstRowAsLabel;
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

        /*
         * removes ignored series from dataset
         */
        filterSeries: function(ignore) {
            columns = columns.filter(function(c) {
                return !ignore[c.name()];
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

