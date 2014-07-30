/*
* dataset source for delimited files (CSV, TSV, ...)
*/

/**
* Smart delimited data parser.
* - Handles CSV and other delimited data.
* Includes auto-guessing of delimiter character
* Parameters:
*   options
*     delimiter : ","
*/


dw.datasource.delimited = function(opts) {

    function loadAndParseCsv() {
        if (opts.url) {
            return $.ajax({
                url: opts.url,
                method: 'GET',
                dataType: "text" // NOTE (edouard): Without that jquery try to parse the content and return a Document
            }).then(function(raw) {
                return new DelimitedParser(opts).parse(raw);
            });
        } else if (opts.csv) {
            var dfd = $.Deferred(),
                parsed = dfd.then(function(raw) {
                return new DelimitedParser(opts).parse(raw);
            });
            dfd.resolve(opts.csv);
            return parsed;
        }
        throw 'you need to provide either an URL or CSV data.';
    }

    var delimited = {
        dataset: loadAndParseCsv
    };
    return delimited;
};


var DelimitedParser = function(opts) {

    opts = _.extend({
        delimiter: "auto",
        quoteChar: "\"",
        skipRows: 0,
        emptyValue: null,
        transpose: false,
        firstRowIsHeader: true
    }, opts);

    this.__delimiterPatterns = getDelimiterPatterns(opts.delimiter, opts.quoteChar);
    this.opts = opts;
};

function getDelimiterPatterns(delimiter, quoteChar) {
    return new RegExp(
    (
    // Delimiters.
    "(\\" + delimiter + "|\\r?\\n|\\r|^)" +
    // Quoted fields.
    "(?:" + quoteChar + "([^" + quoteChar + "]*(?:" + quoteChar + "\"[^" + quoteChar + "]*)*)" + quoteChar + "|" +
    // Standard fields.
    "([^" + quoteChar + "\\" + delimiter + "\\r\\n]*))"), "gi");
}

_.extend(DelimitedParser.prototype, {

    parse: function(data) {

        var me = this,
            opts = this.opts;

        me.__rawData = data;

        if (opts.delimiter == 'auto') {
            opts.delimiter = me.guessDelimiter(data, opts.skipRows);
            me.__delimiterPatterns = getDelimiterPatterns(opts.delimiter, opts.quoteChar);
        }
        var closure = opts.delimiter != '|' ? '|' : '#',
            arrData;

        data = closure + data.replace(/\s+$/g, '') + closure;

        function parseCSV(delimiterPattern, strData, strDelimiter) {
            // implementation and regex borrowed from:
            // http://www.bennadel.com/blog/1504-Ask-Ben-Parsing-CSV-Strings-With-Javascript-Exec-Regular-Expression-Command.htm

            // Check to see if the delimiter is defined. If not,
            // then default to comma.
            strDelimiter = (strDelimiter || ",");

            // Create an array to hold our data. Give the array
            // a default empty first row.
            var arrData = [
                []
            ];

            // Create an array to hold our individual pattern
            // matching groups.
            var arrMatches = null,
                strMatchedValue;

            // Keep looping over the regular expression matches
            // until we can no longer find a match.
            while (arrMatches = delimiterPattern.exec(strData)) {
                // Get the delimiter that was found.
                var strMatchedDelimiter = arrMatches[1];

                // Check to see if the given delimiter has a length
                // (is not the start of string) and if it matches
                // field delimiter. If id does not, then we know
                // that this delimiter is a row delimiter.
                if (
                    strMatchedDelimiter.length && (strMatchedDelimiter != strDelimiter)) {

                    // Since we have reached a new row of data,
                    // add an empty row to our data array.
                    arrData.push([]);

                }


                // Now that we have our delimiter out of the way,
                // let's check to see which kind of value we
                // captured (quoted or unquoted).
                if (arrMatches[2]) {

                    // We found a quoted value. When we capture
                    // this value, unescape any double quotes.
                    strMatchedValue = arrMatches[2].replace(new RegExp("\"\"", "g"), "\"");

                } else {

                    // We found a non-quoted value.
                    strMatchedValue = arrMatches[3];

                }


                // Now that we have our value string, let's add
                // it to the data array.
                arrData[arrData.length - 1].push(strMatchedValue);
            }

            // remove closure
            if (arrData[0][0].substr(0, 1) == closure) {
                arrData[0][0] = arrData[0][0].substr(1);
            }
            var p = arrData.length - 1,
                q = arrData[p].length - 1,
                r = arrData[p][q].length - 1;
            if (arrData[p][q].substr(r) == closure) {
                arrData[p][q] = arrData[p][q].substr(0, r);
            }

            // Return the parsed data.
            return (arrData);
        } // end parseCSV

        function transpose(arrMatrix) {
            // borrowed from:
            // http://www.shamasis.net/2010/02/transpose-an-array-in-javascript-and-jquery/
            var a = arrMatrix,
                w = a.length ? a.length : 0,
                h = a[0] instanceof Array ? a[0].length : 0;
            if (h === 0 || w === 0) {
                return [];
            }
            var i, j, t = [];
            for (i = 0; i < h; i++) {
                t[i] = [];
                for (j = 0; j < w; j++) {
                    t[i][j] = a[j][i];
                }
            }
            return t;
        }

        function makeDataset(arrData) {
            var columns = [],
                columnNames = {},
                rowCount = arrData.length,
                columnCount = arrData[0].length,
                rowIndex = opts.skipRows;

            // compute series
            var srcColumns = [];
            if (opts.firstRowIsHeader) {
                srcColumns = arrData[rowIndex];
                rowIndex++;
            }

            // check that columns names are unique and not empty

            for (var c = 0; c < columnCount; c++) {
                var col = _.isString(srcColumns[c]) ? srcColumns[c].replace(/^\s+|\s+$/g, '') : '',
                    suffix = col !== '' ? '' : 1;
                col = col !== '' ? col : 'X.';
                while (columnNames[col + suffix] !== undefined) {
                    suffix = suffix === '' ? 1 : suffix + 1;
                }
                columns.push({
                    name: col + suffix,
                    data: []
                });
                columnNames[col + suffix] = true;
            }

            _.each(_.range(rowIndex, rowCount), function(row) {
                _.each(columns, function(c, i) {
                    c.data.push(arrData[row][i] !== '' ? arrData[row][i] : opts.emptyValue);
                });
            });

            columns = _.map(columns, function(c) { return dw.column(c.name, c.data); });
            return dw.dataset(columns);
        } // end makeDataset

        arrData = parseCSV(this.__delimiterPatterns, data, opts.delimiter);
        if (opts.transpose) {
            arrData = transpose(arrData);
        }
        return makeDataset(arrData);
    }, // end parse


    guessDelimiter: function(strData) {
        // find delimiter which occurs most often
        var maxMatchCount = 0,
            k = -1,
            me = this,
            delimiters = ['\t', ';', '|', ','];
        _.each(delimiters, function(delimiter, i) {
            var regex = getDelimiterPatterns(delimiter, me.quoteChar),
                c = strData.match(regex).length;
            if (c > maxMatchCount) {
                maxMatchCount = c;
                k = i;
            }
        });
        return delimiters[k];
    }

}); // end _.extend(DelimitedParser)

