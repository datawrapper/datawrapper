
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

        /*
         * executes func for each row of the dataset
         */
        eachRow: function(func) {
            var i;
            for (i=0; i<dataset.numRows(); i++) {
                func(i);
            }
        }

    };
    return dataset;
};

