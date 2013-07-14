
(function(){

    var root = this,
        dw = {};

    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = dw;
        }
        exports.dw = dw;
    } else {
        window.dw = dw;
    }

/*
 * NEW dataset class
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
            var minmax = [Number.MAX_VALUE, -Number.MAX_VALUE];
            this.eachSeries(function(s) {
                minmax[0] = Math.min(minmax[0], s.min);
                minmax[1] = Math.max(minmax[1], s.max);
            });
            return minmax;
        }

    };
    return dataset;
};

/*
 * OLD dataset model
 */
    // // Datawrapper.Dataset
    // // -------------------

    // //
    // var Dataset = Datawrapper.Dataset = function(options) {
    //     _.extend(options, {
    //         type: 'delimited'
    //     });
    //     this.__options = options;
    // };

    // _.extend(Dataset.prototype, {

    //     _initialize: function() {
    //         var me = this,
    //             opts = me.__options;
    //     },

    //     _fetchDelimited: function(callbacks) {
    //         var me = this,
    //             opts = me.__options;

    //         if (opts.url !== undefined) {
    //             if (me.__lastUrl == opts.url) {
    //                 // use cached data
    //                 loaded(me.__rawData);
    //             } else {
    //                 // load data from url
    //                 $.ajax({
    //                     url: opts.url,
    //                     method: 'GET',
    //                     dataType: "text", // NOTE (edouard): Without that jquery try to parse the content and return a Document
    //                     success: function(raw) {
    //                         me._delimtedLoaded(raw);
    //                         if (_.isFunction(callbacks.success)) {
    //                             callbacks.success();
    //                         }
    //                     }
    //                 });
    //             }
    //         }
    //     },

    //     _delimtedLoaded: function(raw, callbacks) {
    //         var me = this, opts = me.__options;
    //         me.__rawData = raw;
    //         // parse data
    //         var parser = new Datawrapper.Parsers.Delimited(opts),
    //             data = parser.parse(raw);
    //         me.__data = data;
    //         me.__loaded = true;
    //         me.__parser = parser;
    //         me._processData(data);
    //     },

    //     _processData: function(data) {
    //         var me = this,
    //             numParser = new NumberParser();
    //         me.__seriesByName = {};
    //         // at first we teach the parser all numbers we have
    //         _.each(data.series, function(s) {
    //             me.__seriesByName[s.name] = s;
    //             s._min = function() {
    //                 //console.warn('series._min() is deprecated, use series.min instead.');
    //                 return s.min;
    //             };
    //             s._max = function() {
    //                 //console.warn('series._max() is deprecated, use series.max instead.');
    //                 return s.max;
    //             };
    //             _.each(s.data, function(number) {
    //                 numParser.learn(number);
    //             });
    //         });
    //         // then we let parse the numbers
    //         _.each(data.series, function(s) {
    //             s.min = Number.MAX_VALUE;
    //             s.max = -Number.MAX_VALUE;
    //             s.total = 0;
    //             _.each(s.data, function(number, i) {
    //                 s.data[i] = numParser.parse(number);
    //                 if (!isNaN(s.data[i])) {
    //                     // this is buggy in IE7
    //                     s.min = Math.min(s.min, s.data[i]);
    //                     s.max = Math.max(s.max, s.data[i]);
    //                     s.total += s.data[i];
    //                 }
    //             });
    //             // store copy of original data in origdata
    //             s.origdata = s.data.slice();
    //         });
    //         // check if row names contain dates
    //         if (me.hasRowNames()) {
    //             var dateParser = new DateParser();
    //             me.eachRow(function(i) {
    //                 dateParser.learn(me.rowName(i));
    //             });
    //             if (dateParser.validFormat()) {
    //                 me.__dateFormat = dateParser.__format;
    //                 me.__rowDates = [];
    //                 me.eachRow(function(i) {
    //                     me.__rowDates.push(dateParser.parse(me.rowName(i)));
    //                 });
    //             }
    //         }
    //     },


    //     // PUBLIC API

    //     /*
    //      * loads a new dataset
    //      */
    //     fetch: function(callbacks) {
    //         var me = this, opts = me.__options;

    //         if (opts.type == "delimited") {
    //             me._fetchDelimited(callbacks);
    //         }
    //     },

    //     /*
    //      *
    //      */
    //     fetchRaw: function() {
    //         var me = this, opts = me.__options;
    //         if (opts.type == "delimited") {
    //             me._delimtedLoaded(opts.rawData);
    //         }
    //     },

    //     /*
    //      * returns either a single series by name or index, or a list of
    //      * all series, if no parameter x is given
    //      */
    //     series: function(x) {
    //         var me = this;
    //         if (_.isString(x)) {
    //             // single series by name
    //             if (me.__seriesByName[x] !== undefined) return me.__seriesByName[x];
    //             throw 'No series found with that name: "'+x+'"';
    //         }
    //         if (x !== undefined) {
    //             // single series by index
    //             if (me.__data.series[x] !== undefined) return me.__data.series[x];
    //             throw 'No series found with that index: '+x;
    //         }
    //         return this.__data.series;
    //     },

    //     hasRowNames: function() {
    //         return this.__data.rowNames !== undefined;
    //     },

    //     numRows: function() {
    //         return this.__data.series[0].data.length;
    //     },

    //     eachRow: function(func) {
    //         var i;
    //         for (i=0; i<this.numRows(); i++) {
    //             func(i);
    //         }
    //     },

    //     eachSeries: function(func) {
    //         _.each(this.series(), func);
    //     },

    //     rowNames: function() {
    //         return this.__data.rowNames;
    //     },

    //     rowName: function(i) {
    //         var me = this, k;
    //         if (!me.hasRowNames()) return '';
    //         k = me.__data.rowNames.length;
    //         return me.__data.rowNames[(i + k) % k];
    //     },

    //     rowNameLabel: function() {
    //         return this.__data.rowNameLabel !== undefined ? this.__data.rowNameLabel : '';
    //     },

    //     /*
    //      * removes every row except the one with index i
    //      * and updates min, max and total of each series
    //      */
    //     filterRows: function(rows) {
    //         this.eachSeries(function(s) {
    //             var d = [];
    //             s.total = 0;
    //             s.min = Number.MAX_VALUE;
    //             s.max = Number.MAX_VALUE*-1;
    //             _.each(rows, function(i) {
    //                 d.push(s.origdata[i]);
    //                 s.total += s.origdata[i];
    //                 s.min = Math.min(s.min, s.origdata[i]);
    //                 s.max = Math.max(s.max, s.origdata[i]);
    //             });
    //             s.data = d;
    //         });
    //     },

    //     /*
    //      * returns a tree data structure from this dataset
    //      */
    //     parseTree: function(row) {
    //         var tree = { children: [], depth: 0 };
    //         this.eachSeries(function(s) {
    //             var parts = s.name.split('>');
    //             var node = tree;
    //             _.each(parts, function(p, i) {
    //                 parts[i] = p = p.trim();
    //                 var found = false;
    //                 _.each(node.children, function(c) {
    //                     if (c.name.trim() == p) {
    //                         node = c;
    //                         found = true;
    //                         return false;
    //                     }
    //                 });
    //                 if (!found) { // child not found, create new one
    //                     var n = { name: p, children: [], _series: s, _row: 0, depth: i+1 };
    //                     if (i == parts.length-1) n.value = s.data[row];
    //                     node.children.push(n);
    //                     node = n;
    //                 }
    //             });
    //         });
    //         return tree;
    //     },

    //     serializeDelimited: function() {
    //         var me = this;
    //         var data = [[]];

    //         if (me.hasRowNames()) data[0].push('');

    //         function isNone(val) {
    //             return val === null || val === undefined || (_.isNumber(val) && isNaN(val));
    //         }

    //         _.each(me.series(), function(s) {
    //             data[0].push((!isNone(s.name) ? s.name : ''));
    //         });

    //         me.eachRow(function(row) {
    //             var tr = [];
    //             if (me.hasRowNames()) {
    //                 tr.push(!isNone(me.rowName(row)) ? me.rowName(row) : '');
    //             }
    //             me.eachSeries(function(s, i) {
    //                 var val = s.data[row];
    //                 tr.push((!isNone(s.data[row]) ? val : 'n/a'));
    //             });
    //             data.push(tr);
    //         });

    //         return data.map(function(row) { return row.join(me.__parser.delimiter); }).join('\n');
    //     },

    //     /*
    //      * removes ignored series from dataset
    //      */
    //     filterSeries: function(ignore) {
    //         var me = this;
    //         me.__data.series = me.__data.series.filter(function(s) {
    //             return !ignore[s.name];
    //         });
    //     },

    //     /**
    //      * Returns true if the datasets row labels could
    //      * correctly be parsed as date values.
    //      */
    //     isTimeSeries: function() {
    //         return this.__rowDates !== undefined;
    //     },

    //     /**
    //      * Returns a Date object for a given row.
    //      */
    //     rowDate: function(i) {
    //         if (i < 0) i += this.__rowDates.length;
    //         return this.__rowDates[i];
    //     },

    //     /**
    //      * Returns (a copy of) the list of all rows Date objects.
    //      */
    //     rowDates: function() {
    //         return this.__rowDates.slice(0);
    //     },

    //     /**
    //      * Returns array of min/max values
    //      */
    //     minMax: function() {
    //         var minmax = [Number.MAX_VALUE, -Number.MAX_VALUE];
    //         this.eachSeries(function(s) {
    //             minmax[0] = Math.min(minmax[0], s.min);
    //             minmax[1] = Math.max(minmax[1], s.max);
    //         });
    //         return minmax;
    //     }
    // });

    // var NumberParser = function() {
    //     this.__numbers = [];
    //     this.__knownFormats = {
    //         '-.': /^[\-\.]?[0-9]+(\.[0-9]+)?$/,
    //         '-,': /^[\-,]?[0-9]+(,[0-9]+)?$/,
    //         ',.': /^[0-9]{1,3}(,[0-9]{3})(\.[0-9]+)?$/,
    //         '.,': /^[0-9]{1,3}(\.[0-9]{3})(,[0-9]+)?$/,
    //         ' .': /^[0-9]{1,3}( [0-9]{3})(\.[0-9]+)?$/,
    //         ' ,': /^[0-9]{1,3}( [0-9]{3})(,[0-9]+)?$/
    //     };
    // };

    // _.extend(NumberParser.prototype, {

    //     // get some input numbers
    //     learn: function(number) {
    //         this.__numbers.push(number);
    //     },

    //     // test all numbers against certain
    //     _getFormat: function() {
    //         var me = this,
    //             matches = {},
    //             bestMatch = ['', 0];
    //         _.each(me.__numbers, function(n) {
    //             _.each(me.__knownFormats, function(regex, fmt) {
    //                 if (matches[fmt] === undefined) matches[fmt] = 0;
    //                 if (regex.test(n)) {
    //                     matches[fmt] += 1;
    //                     if (matches[fmt] > bestMatch[1]) {
    //                         bestMatch[0] = fmt;
    //                         bestMatch[1] = matches[fmt];
    //                     }
    //                 }
    //             });
    //         });
    //         return bestMatch[0];
    //     },

    //     parse: function(raw) {
    //         var me = this,
    //             number = raw,
    //             fmt = this.__format;
    //         if (raw === null || raw === undefined || raw === '') return 'n/a';
    //         if (fmt === undefined) {
    //             fmt = this.__format = this._getFormat();
    //         }
    //         // normalize number
    //         if (fmt[0] == ',' || fmt[0] == '.' || fmt[0] == ' ') {
    //             // remove kilo seperator
    //             number = number.replace(fmt[0], '');
    //         }
    //         if (fmt[1] != '.') {
    //             // replace decimal char w/ point
    //             number = number.replace(fmt[1], '.');
    //         }
    //         number = Number(number);
    //         return isNaN(number) ? raw : number;
    //     }

    // });

    // var DateParser = function() {
    //     var me = this;
    //     me.__dates = [];
    //     me.__knownFormats = {
    //         'year': /^([12][0-9]{3})$/,
    //         'quarter': /^([12][0-9]{3}) ?[\-\/Q|]([1234])$/,
    //         'month': /^([12][0-9]{3}) ?[-\/\.M](0[1-9]|1[0-2])$/,
    //         'date': /^([12][0-9]{3})[-\/](0[1-9]|1[0-2])[-\/]([0-2][0-9]|3[01])$/
    //     };
    // };

    // _.extend(DateParser.prototype, {
    //     // get some input numbers
    //     learn: function(date_str) {
    //         this.__dates.push(date_str);
    //     },

    //     // test all strings against the known formats
    //     _getFormat: function() {
    //         var me = this, format = false;
    //         _.each(me.__knownFormats, function(regex, fmt) {
    //             var valid = true;
    //             _.each(me.__dates, function(n) {
    //                 if (!regex.test(n)) {
    //                     valid = false;
    //                     return false;
    //                 }
    //             });
    //             if (valid) {
    //                 format = fmt;
    //                 return false;
    //             }
    //         });
    //         return format;
    //     },

    //     validFormat: function() {
    //         var me = this;
    //         me.__format = me._getFormat();
    //         return me.__format !== false;
    //     },

    //     parse: function(raw) {
    //         var me = this,
    //             date = raw,
    //             fmt = me.__format = me.__format === undefined ? me._getFormat() : me.__format;

    //         if (fmt === false) return raw;
    //         var regex = me.__knownFormats[fmt],
    //             m = raw.match(regex);

    //         if (!m) return raw;
    //         switch (fmt) {
    //             case 'year': return new Date(m[1], 0, 1);
    //             case 'quarter': return new Date(m[1], (m[2]-1) * 3, 1);
    //             case 'month': return new Date(m[1], (m[2]-1), 1);
    //             case 'date': return new Date(m[1], (m[2]-1), m[3]);
    //         }
    //         return raw;
    //     }
    // });


/*
 * DataColumn abstracts the functionality of each column
 * of a dataset. A column has a type (text|number|date).
 *
 * API:
 *
 * column.name() ... returns the name (string)
 * column.type() ... return column type (string)
 * column.length ... number of rows (number)
 * column.val(i) ... parsed value in row i
 * column.each(func) ... apply function to each value
 * column.raw() ... access raw, unparsed values
 *
 */
dw.column = function(name, rows, type) {

    function guessType(sample) {

        if (_.every(rows, _.isNumber)) return dw.column.types.number();
        if (_.every(rows, _.isDate)) return dw.column.types.date();
        // guessing column type by counting parsing errors
        // for every known type
        var types = [
                dw.column.types.date(sample),
                dw.column.types.number(sample),
                dw.column.types.text()
            ],
            type,
            k = rows.length,
            tolerance = 0.1; // allowing 10% mis-parsed values

        _.each(rows, function(val) {
            _.each(types, function(t) {
                t.parse(val);
            });
        });
        _.every(types, function(t) {
            if (t.errors() / k < tolerance) type = t;
            return !type;
        });
        return type;
    }

    // we pick random 100 values for column type testing
    var sample = _.map(_.shuffle(_.range(rows.length)).slice(0, 200), function(i) { return rows[i]; });

    type = type ? dw.column.types[type](sample) : guessType(sample);

    var range,
        total,
        origRows = rows.slice(0);

    // public interface
    var column = {
        // column label
        name: function() {
            if (arguments.length) {
                name = arguments[0];
                return column;
            }
            return name;
        },

        /**
         * number of rows
         */
        length: rows.length,

        /**
         * returns ith row of the col, parsed
         *
         * @param i
         * @param unfiltered  if set to true, precedent calls of filterRows are ignored
         */
        val: function(i, unfiltered) {
            var r = unfiltered ? origRows : rows;
            if (i < 0) i += r.length;
            return type.parse(r[i]);
        },

        /**
         * apply function to each value
         */
        each: function(f) {
            for (i=0; i<rows.length; i++) {
                f(column.val(i), i);
            }
        },

        // access to raw values
        raw: function() { return rows; },
        // column type
        type: function(o) { return o ? type : type.name(); },
        // [min,max] range
        range: function() {
            if (!type.toNum) return false;
            if (!range) {
                range = [Number.MAX_VALUE, -Number.MAX_VALUE];
                column.each(function(v) {
                    v = type.toNum(v);
                    if (v < range[0]) range[0] = v;
                    if (v > range[1]) range[1] = v;
                });
                range[0] = type.fromNum(range[0]);
                range[1] = type.fromNum(range[1]);
            }
            return range;
        },
        // sum of values
        total: function() {
            if (!type.toNum) return false;
            if (!total) {
                total = 0;
                column.each(function(v) {
                    total += type.toNum(v);
                });
                total = type.fromNum(total);
            }
            return total;
        },
        // remove rows from column, keep those whose index
        // is within @r
        filterRows: function(r) {
            rows = [];
            if (arguments.length) {
                _.each(r, function(i) {
                    rows.push(origRows[i]);
                });
            } else {
                rows = origRows.slice(0);
            }
            column.length = rows.length;
            // invalidate range and total
            range = total = false;
            return column;
        },

        toString: function() {
            return name + ' ('+type.name()+')';
        }
    };
    return column;
};

dw.column.types = {};


dw.column.types.text = function() {
    return {
        parse: function(v) { return v; },
        errors: function() { return 0; },
        name: function() { return 'text'; }
    };
};

/*
 * A type for numbers:
 *
 * Usage:
 * var parse = dw.type.number(sampleData);
 * parse()
 */
dw.column.types.number = function(sample) {

    var format,
        errors = 0,
        knownFormats = {
            '-.': /^ *-?[0-9]*(\.[0-9]+)? *$/,
            '-,': /^ *-?[0-9]*(,[0-9]+)? *$/,
            ',.': /^ *-?[0-9]{1,3}(,[0-9]{3})*(\.[0-9]+)? *$/,
            '.,': /^ *-?[0-9]{1,3}(\.[0-9]{3})*(,[0-9]+)? *$/,
            ' .': /^ *-?[0-9]{1,3}( [0-9]{3})*(\.[0-9]+)? *$/,
            ' ,': /^ *-?[0-9]{1,3}( [0-9]{3})*(,[0-9]+)? *$/,
            // excel sometimes produces a strange white-space:
            ' .': /^ *-?[0-9]{1,3}( [0-9]{3})*(\.[0-9]+)? *$/,
            ' ,': /^ *-?[0-9]{1,3}( [0-9]{3})*(,[0-9]+)? *$/
        },
        // a list of strings that are recognized as 'not available'
        naStrings = {
            'na': 1,
            'n/a': 1,
            '-': 1,
            ':': 1
        };

    var matches = {},
        bestMatch = ['-.', 0];

    sample = sample || [];

    _.each(sample, function(n) {
        _.each(knownFormats, function(regex, fmt) {
            if (matches[fmt] === undefined) matches[fmt] = 0;
            if (regex.test(n)) {
                matches[fmt] += 1;
                if (matches[fmt] > bestMatch[1]) {
                    bestMatch[0] = fmt;
                    bestMatch[1] = matches[fmt];
                }
            }
        });
    });
    format = bestMatch[0];

    // public interface
    var type = {
        parse: function(raw) {
            if (_.isNumber(raw)) return raw;
            var number = raw;
            // normalize number
            if (format[0] != '-') {
                // remove kilo seperator
                number = number.replace(format[0], '');
            }
            if (format[1] != '.') {
                // replace decimal char w/ point
                number = number.replace(format[1], '.');
            }

            if (isNaN(number)) {
                if (!naStrings[number] && number !== "") errors++;
                return raw;
            }
            return Number(number);
        },
        toNum: function(i) { return i; },
        fromNum: function(i) { return i; },
        errors: function() { return errors; },
        name: function() { return 'number'; }
    };
    return type;
};


/*
 * type for date values, e.g. 2004 Q1
 */
dw.column.types.date = function(sample) {

    var format,
        errors = 0,
        matches = {},
        bestMatch = ['', 0],
        knownFormats = {
            'YYYY': {
                regex: /^ *([12][0-9]{3}) *$/,
                precision: 'year'
            },
            'YYYY-H': {
                regex: /^ *([12][0-9]{3})[ \-\/]?H([12]) *$/,
                precision: 'month'
            },
            'H-YYYY': {
                regex: /^ *H([12])[ \-\/]([12][0-9]{3}) *$/,
                precision: 'month'
            },
            'YYYY-Q': {
                regex: /^ *([12][0-9]{3})[ \-\/]?Q([1234]) *$/,
                precision: 'quarter'
            },
            'Q-YYYY': {
                regex: /^ *Q([1234])[ \-\/]([12][0-9]{3}) *$/,
                precision: 'quarter'
            },
            'YYYY-M': {
                regex: /^ *([12][0-9]{3}) ?[ -\/\.M](0?[1-9]|1[0-2]) *$/,
                precision: 'month'
            },
            'M-YYYY': {
                regex: /^ *(0?[1-9]|1[0-2]) ?[ -\/\.]([12][0-9]{3}) *$/,
                precision: 'month'
            },
            'MM/DD/YYYY': {
                regex: /^ *(0?[1-9]|1[0-2])([-\/] ?)(0?[1-9]|[1-2][0-9]|3[01])\2([12][0-9]{3})(?: (0?[0-9]|1[0-9]|2[0-3]):([0-5][0-9])(?::([0-5][0-9]))?)? *$/,
                precision: 'day'
            },
            'DD.MM.YYYY': {
                regex: /^ *(0?[1-9]|[1-2][0-9]|3[01])([-\.\/ ?])(0?[1-9]|1[0-2])\2([12][0-9]{3})(?: (0?[0-9]|1[0-9]|2[0-3]):([0-5][0-9])(?::([0-5][0-9]))?)? *$/,
                precision: 'day'
            },
            'YYYY-MM-DD': {
                regex: /^ *([12][0-9]{3})([-\/\. ?])(0?[1-9]|1[0-2])\2(0?[1-9]|[1-2][0-9]|3[01])(?: (0?[0-9]|1[0-9]|2[0-3]):([0-5][0-9])(?::([0-5][0-9]))?)? *$/,
                precision: 'day'
            }
        };

    sample = sample || [];

    _.each(sample, function(n) {
        _.each(knownFormats, function(format, key) {
            if (matches[key] === undefined) matches[key] = 0;
            if (format.regex.test(n)) {
                matches[key] += 1;
                if (matches[key] > bestMatch[1]) {
                    bestMatch[0] = key;
                    bestMatch[1] = matches[key];
                }
            }
        });
    });
    format = bestMatch[0];

    // public interface
    var type = {
        parse: function(raw) {
            if (_.isDate(raw)) return raw;
            if (!format || !_.isString(raw)) {
                errors++;
                return raw;
            }
            var regex = knownFormats[format].regex,
                m = raw.match(regex);

            if (!m) {
                errors++;
                return raw;
            }
            switch (format) {
                case 'YYYY': return new Date(m[1], 0, 1);
                case 'YYYY-H': return new Date(m[1], (m[2]-1) * 6, 1);
                case 'H-YYYY': return new Date(m[2], (m[1]-1) * 6, 1);
                case 'YYYY-Q': return new Date(m[1], (m[2]-1) * 3, 1);
                case 'Q-YYYY': return new Date(m[2], (m[1]-1) * 3, 1);
                case 'YYYY-M': return new Date(m[1], (m[2]-1), 1);
                case 'M-YYYY': return new Date(m[2], (m[1]-1), 1);
                case 'YYYY-MM-DD': return new Date(m[1], (m[3]-1), m[4], m[5] || 0, m[6] || 0, m[7] || 0);
                case 'DD.MM.YYYY': return new Date(m[4], (m[3]-1), m[1], m[5] || 0, m[6] || 0, m[7] || 0);
                case 'MM/DD/YYYY': return new Date(m[4], (m[1]-1), m[3], m[5] || 0, m[6] || 0, m[7] || 0);
            }
            errors++;
            return raw;
        },
        toNum: function(d) { return d.getTime(); },
        fromNum: function(i) { return new Date(i); },
        errors: function() { return errors; },
        name: function() { return 'date'; },
        format: function() { return format; },
        precision: function() { return knownFormats[format].precision; }
    };
    return type;
};

// namespace for dataset sources

// API for sources is
//
// dw.datasource.delimited(opts).dataset();
//
dw.datasource = {};
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
        firstRowIsHeader: true,
        firstColumnIsHeader: true
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
        var columns = [],
            closure = opts.delimiter != '|' ? '|' : '#',
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

        function makeDataset(arrData, skipRows, emptyValue, firstRowIsHeader, firstColIsHeader) {
            var columns = [],
                columnNames = {},
                rowCount = arrData.length,
                columnCount = arrData[0].length,
                rowIndex = skipRows;

            // compute series
            var srcColumns = [];
            if (firstRowIsHeader) {
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

            _.each(_.range(1, rowCount), function(rowIndex) {
                _.each(columns, function(c, i) {
                    c.data.push(arrData[rowIndex][i] !== '' ? arrData[rowIndex][i] : emptyValue);
                });
            });

            columns = _.map(columns, function(c) { return dw.column(c.name, c.data); });
            return dw.dataset(columns, { firstColumnAsLabel: firstColIsHeader });
        } // end makeDataset

        arrData = parseCSV(this.__delimiterPatterns, data, opts.delimiter);
        if (opts.transpose) {
            arrData = transpose(arrData);
            // swap row/column header setting
            var t = opts.firstRowIsHeader;
            opts.firstRowIsHeader = opts.firstColumnIsHeader;
            opts.firstColumnIsHeader = t;
        }
        return makeDataset(arrData, opts.skipRows, opts.emptyValue, opts.firstRowIsHeader, opts.firstColumnIsHeader);
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


}).call(this);