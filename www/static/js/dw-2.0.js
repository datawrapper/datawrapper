/*! datawrapper - v1.8.2 - 2014-12-30 *///
// NOTE: This file is auto-generated using /dw.js/make
// from the source files /dw.js/src/*.js.
//
// If you want to change anything you need to change it
// in the source files and then re-run /dw.js/make, or
// otherwise your changes will be lost on the make.
//

(function(){

    var root = this,
        dw = {};

    // if (typeof 'define' !== 'undefined' && define.amd) {
    //     // make define backward compatible
    //     root.dw = dw;
    //     define(dw);
    // } else
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = dw;
        }
        exports.dw = dw;
    } else {
        window.dw = dw;
    }

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
        origRows = rows.slice(0),
        title;

    // public interface
    var column = {
        // column name (used for reference in chart metadata)
        name: function() {
            if (arguments.length) {
                name = arguments[0];
                return column;
            }
            return dw.utils.purifyHtml(name);
        },

        // column title (used for presentation)
        title: function() {
            if (arguments.length) {
              title = arguments[0];
              return column;
            }
            return dw.utils.purifyHtml(title || name);
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
            if (!arguments.length) return undefined;
            var r = unfiltered ? origRows : rows;
            if (i < 0) i += r.length;
            return type.parse(dw.utils.purifyHtml(r[i]));
        },

        /*
         * returns an array of parsed values
         */
        values: function(unfiltered) {
            var r = unfiltered ? origRows : rows;
            r = _.map(r, dw.utils.purifyHtml);
            return _.map(r, type.parse);
        },

        /**
         * apply function to each value
         */
        each: function(f) {
            for (var i=0; i<rows.length; i++) {
                f(column.val(i), i);
            }
        },

        // access to raw values
        raw: function(i, val) {
            if (!arguments.length) return rows;
            if (arguments.length == 2) {
                rows[i] = val;
                return column;
            }
            return dw.utils.purifyHtml(rows[i]);
        },

        /**
         * if called with no arguments, this returns the column type name
         * if called with true as argument, this returns the column type (as object)
         * if called with a string as argument, this sets a new column type
         */
        type: function(o) {
            if (o === true) return type;
            if (_.isString(o)) {
                if (dw.column.types[o]) {
                    type = dw.column.types[o](sample);
                    return column;
                } else {
                    throw 'unknown column type: '+o;
                }
            }
            return type.name();
        },

        // [min,max] range
        range: function() {
            if (!type.toNum) return false;
            if (!range) {
                range = [Number.MAX_VALUE, -Number.MAX_VALUE];
                column.each(function(v) {
                    v = type.toNum(v);
                    if (!_.isNumber(v) || _.isNaN(v)) return;
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
        },

        indexOf: function(val) {
            return _.find(_.range(rows.length), function(i) {
                return column.val(i) == val;
            });
        }
    };
    return column;
};

dw.column.types = {};


dw.column.types.text = function() {
    return {
        parse: _.identity,
        errors: function() { return 0; },
        name: function() { return 'text'; },
        formatter: function() { return _.identity; },
        isValid: function() { return true; },
        format: function() { }
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

    function signDigitsDecimalPlaces(num, sig) {
        if (num === 0) return 0;
        return Math.round( sig - Math.ceil( Math.log( Math.abs( num ) ) / Math.LN10 ) );
    }

    var format,
        errors = 0,
        knownFormats = {
            '-.': /^ *[-–—]?[0-9]*(\.[0-9]+)?(e[\+\-][0-9]+)?%? *$/,
            '-,': /^ *[-–—]?[0-9]*(,[0-9]+)?%? *$/,
            ',.': /^ *[-–—]?[0-9]{1,3}(,[0-9]{3})*(\.[0-9]+)?%? *$/,
            '.,': /^ *[-–—]?[0-9]{1,3}(\.[0-9]{3})*(,[0-9]+)?%? *$/,
            ' .': /^ *[-–—]?[0-9]{1,3}( [0-9]{3})*(\.[0-9]+)?%? *$/,
            ' ,': /^ *[-–—]?[0-9]{1,3}( [0-9]{3})*(,[0-9]+)?%? *$/,
            // excel sometimes produces a strange white-space:
            ' .': /^ *[-–—]?[0-9]{1,3}( [0-9]{3})*(\.[0-9]+)?%? *$/,
            ' ,': /^ *[-–—]?[0-9]{1,3}( [0-9]{3})*(,[0-9]+)?%? *$/
        },
        formatLabels = {
            '-.': '1234.56',
            '-,': '1234,56',
            ',.': '1,234.56',
            '.,': '1.234,56',
            ' .': '1 234.56',
            ' ,': '1 234,56',
            // excel sometimes produces a strange white-space:
            ' .': '1 234.56',
            ' ,': '1 234,56'
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
            if (_.isNumber(raw) || _.isUndefined(raw) || _.isNull(raw)) return raw;
            // replace percent sign, n-dash & m-dash
            var number = raw.replace("%", "").replace('–', '-').replace('—', '-');
            // normalize number
            if (format[0] != '-') {
                // remove kilo seperator
                number = number.replace(format[0], '');
            }
            if (format[1] != '.') {
                // replace decimal char w/ point
                number = number.replace(format[1], '.');
            }
            if (isNaN(number) || number === "") {
                if (!naStrings[number.toLowerCase()] && number !== "") errors++;
                return raw;
            }
            return Number(number);
        },
        toNum: function(i) { return i; },
        fromNum: function(i) { return i; },
        errors: function() { return errors; },
        name: function() { return 'number'; },

        // returns a function for formatting numbers
        formatter: function(config) {
            var format = config['number-format'] || '-',
                div = Number(config['number-divisor'] || 0),
                append = (config['number-append'] || '').replace(/ /g, '\u00A0'),
                prepend = (config['number-prepend'] || '').replace(/ /g, '\u00A0');

            return function(val, full, round) {
                if (isNaN(val)) return val;
                var _fmt = format;
                if (div !== 0 && _fmt == '-') _fmt = 'n1';
                if (div !== 0) val = Number(val) / Math.pow(10, div);
                if (_fmt.substr(0,1) == 's') {
                    // significant figures
                    var sig = +_fmt.substr(1);
                    _fmt = 'n'+Math.max(0, signDigitsDecimalPlaces(val, sig));
                }
                if (round) _fmt = 'n0';
                if (_fmt == '-') {
                    // guess number format
                    _fmt = val == Math.round(val) ? 'n0' :
                        val == Math.round(val*10)*0.1 ? 'n1' : 'n2';
                }
                val = Globalize.format(val, _fmt != '-' ? _fmt : null);
                return full ? prepend + val + append : val;
            };
        },

        isValid: function(val) {
            return val === "" || naStrings[String(val).toLowerCase()] || _.isNumber(type.parse(val));
        },

        ambiguousFormats: function() {
            var candidates = [];
            _.each(matches, function(cnt, fmt) {
                if (cnt == bestMatch[1]) {
                    candidates.push([fmt, formatLabels[fmt]]); // key, label
                }
            });
            return candidates;
        },

        format: function(fmt) {
            if (arguments.length) {
                format = fmt;
                return type;
            }
            return format;
        }
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
            // each format has two regex, a strict one for testing and a lazy one for parsing
            'YYYY': {
                test: /^ *(?:1[7-9]|20)\d{2} *$/,
                //parse: /^ *((?:1[7-9]|20)\d{2}) *$/,
                parse: /^ *(\d{4}) *$/,
                precision: 'year'
            },
            'YYYY-H': {
                test: /^ *[12]\d{3}[ \-\/]?[hH][12] *$/,
                parse: /^ *(\d{4})[ \-\/]?[hH]([12]) *$/,
                precision: 'half'
            },
            'H-YYYY': {
                test: /^ *[hH][12][ \-\/][12]\d{3} *$/,
                parse: /^ *[hH]([12])[ \-\/](\d{4}) *$/,
                precision: 'half'
            },
            'YYYY-Q': {
                test: /^ *[12]\d{3}[ \-\/]?[qQ][1234] *$/,
                parse: /^ *(\d{4})[ \-\/]?[qQ]([1234]) *$/,
                precision: 'quarter'
            },
            'Q-YYYY': {
                test: /^ *[qQ]([1234])[ \-\/][12]\d{3} *$/,
                parse: /^ *[qQ]([1234])[ \-\/](\d{4}) *$/,
                precision: 'quarter'
            },
            'YYYY-M': {
                test: /^ *([12]\d{3}) ?[ \-\/\.mM](0?[1-9]|1[0-2]) *$/,
                parse: /^ *(\d{4}) ?[ \-\/\.mM](0?[1-9]|1[0-2]) *$/,
                precision: 'month'
            },
            'M-YYYY': {
                test: /^ *(0?[1-9]|1[0-2]) ?[ \-\/\.][12]\d{3} *$/,
                parse: /^ *(0?[1-9]|1[0-2]) ?[ \-\/\.](\d{4}) *$/,
                precision: 'month'
            },
            'YYYY-WW': {
                test: /^ *[12]\d{3}[ -]?[wW](0?[1-9]|[1-4]\d|5[0-3]) *$/,
                parse: /^ *(\d{4})[ -]?[wW](0?[1-9]|[1-4]\d|5[0-3]) *$/,
                precision: 'week'
            },
            'MM/DD/YYYY': {
                test: /^ *(0?[1-9]|1[0-2])([\-\/] ?)(0?[1-9]|[1-2]\d|3[01])\2([12]\d{3})$/,
                parse: /^ *(0?[1-9]|1[0-2])([\-\/] ?)(0?[1-9]|[1-2]\d|3[01])\2(\d{4})$/,
                precision: 'day'
            },
            'DD/MM/YYYY': {
                test: /^ *(0?[1-9]|[1-2]\d|3[01])([\-\.\/ ?])(0?[1-9]|1[0-2])\2([12]\d{3})$/,
                parse: /^ *(0?[1-9]|[1-2]\d|3[01])([\-\.\/ ?])(0?[1-9]|1[0-2])\2(\d{4})$/,
                precision: 'day'
            },
            'YYYY-MM-DD': {
                test: /^ *([12]\d{3})([\-\/\. ?])(0?[1-9]|1[0-2])\2(0?[1-9]|[1-2]\d|3[01])$/,
                parse: /^ *(\d{4})([\-\/\. ?])(0?[1-9]|1[0-2])\2(0?[1-9]|[1-2]\d|3[01])$/,
                precision: 'day'
            },
            'YYYY-WW-d': { // year + ISO week + [day]
                test: /^ *[12]\d{3}[ \-]?[wW](0?[1-9]|[1-4]\d|5[0-3])(?:[ \-]?[1-7]) *$/,
                parse: /^ *(\d{4})[ \-]?[wW](0?[1-9]|[1-4]\d|5[0-3])(?:[ \-]?([1-7])) *$/,
                precision: 'day'
            },
            // dates with a time
            'MM/DD/YYYY HH:MM': {
                test: /^ *(0?[1-9]|1[0-2])([-\/] ?)(0?[1-9]|[1-2]\d|3[01])\2([12]\d{3}) *[ \-\|] *(0?\d|1\d|2[0-3]):([0-5]\d) *$/,
                parse: /^ *(0?[1-9]|1[0-2])([-\/] ?)(0?[1-9]|[1-2]\d|3[01])\2(\d{4}) *[ \-\|] *(0?\d|1\d|2[0-3]):([0-5]\d) *$/,
                precision: 'day-minutes'
            },
            'DD.MM.YYYY HH:MM': {
                test: /^ *(0?[1-9]|[1-2]\d|3[01])([-\.\/ ?])(0?[1-9]|1[0-2])\2([12]\d{3}) *[ \-\|] *(0?\d|1\d|2[0-3]):([0-5]\d) *$/,
                parse: /^ *(0?[1-9]|[1-2]\d|3[01])([-\.\/ ?])(0?[1-9]|1[0-2])\2(\d{4}) *[ \-\|] *(0?\d|1\d|2[0-3]):([0-5]\d) *$/,
                precision: 'day-minutes'
            },
            'YYYY-MM-DD HH:MM': {
                test: /^ *([12]\d{3})([-\/\. ?])(0?[1-9]|1[0-2])\2(0?[1-9]|[1-2]\d|3[01]) *[ \-\|] *(0?\d|1\d|2[0-3]):([0-5]\d) *$/,
                parse: /^ *(\d{4})([-\/\. ?])(0?[1-9]|1[0-2])\2(0?[1-9]|[1-2]\d|3[01]) *[ \-\|] *(0?\d|1\d|2[0-3]):([0-5]\d) *$/,
                precision: 'day-minutes'
            },
            // dates with a time
            'MM/DD/YYYY HH:MM:SS': {
                test: /^ *(0?[1-9]|1[0-2])([-\/] ?)(0?[1-9]|[1-2]\d|3[01])\2([12]\d{3}) *[ \-\|] *(0?\d|1\d|2[0-3]):([0-5]\d)(?::([0-5]\d))? *$/,
                parse: /^ *(0?[1-9]|1[0-2])([-\/] ?)(0?[1-9]|[1-2]\d|3[01])\2(\d{4}) *[ \-\|] *(0?\d|1\d|2[0-3]):([0-5]\d)(?::([0-5]\d))? *$/,
                precision: 'day-seconds'
            },
            'DD.MM.YYYY HH:MM:SS': {
                test: /^ *(0?[1-9]|[1-2]\d|3[01])([-\.\/ ?])(0?[1-9]|1[0-2])\2([12]\d{3}) *[ \-\|] *(0?\d|1\d|2[0-3]):([0-5]\d)(?::([0-5]\d))? *$/,
                parse: /^ *(0?[1-9]|[1-2]\d|3[01])([-\.\/ ?])(0?[1-9]|1[0-2])\2(\d{4}) *[ \-\|] *(0?\d|1\d|2[0-3]):([0-5]\d)(?::([0-5]\d))? *$/,
                precision: 'day-seconds'
            },
            'YYYY-MM-DD HH:MM:SS': {
                test: /^ *([12]\d{3})([-\/\. ?])(0?[1-9]|1[0-2])\2(0?[1-9]|[1-2]\d|3[01]) *[ \-\|] *(0?\d|1\d|2[0-3]):([0-5]\d)(?::([0-5]\d))? *$/,
                parse: /^ *(\d{4})([-\/\. ?])(0?[1-9]|1[0-2])\2(0?[1-9]|[1-2]\d|3[01]) *[ \-\|] *(0?\d|1\d|2[0-3]):([0-5]\d)(?::([0-5]\d))? *$/,
                precision: 'day-seconds'
            }
        };

    function test(str, key) {
        var fmt = knownFormats[key];
        if (_.isRegExp(fmt.test)) {
            return fmt.test.test(str);
        } else {
            return fmt.test(str, key);
        }
    }

    function parse(str, key) {
        var fmt = knownFormats[key];
        if (_.isRegExp(fmt.parse)) {
            return str.match(fmt.parse);
        } else {
            return fmt.parse(str, key);
        }
    }

    sample = sample || [];

    _.each(knownFormats, function(format, key) {
        _.each(sample, function(n) {
            if (matches[key] === undefined) matches[key] = 0;
            if (test(n, key)) {
                matches[key] += 1;
                if (matches[key] > bestMatch[1]) {
                    bestMatch[0] = key;
                    bestMatch[1] = matches[key];
                }
            }
        });
    });
    format = bestMatch[0];

    function dateFromIsoWeek(year, week, day) {
        var d = new Date(Date.UTC(year, 0, 3));
        d.setUTCDate(3 - d.getUTCDay() + (week-1)*7 + parseInt(day,10));
        return d;
    }

    function dateToIsoWeek(date) {
        var d = date.getUTCDay(),
            t = new Date(date.valueOf());
        t.setDate(t.getDate() - ((d + 6) % 7) + 3);
        var iso_year = t.getUTCFullYear(),
            w = Math.floor( (t.getTime() - new Date(iso_year, 0, 1, -6)) / 864e5);
        return [ iso_year, 1+Math.floor(w/7), d > 0 ? d : 7 ];
    }

    // public interface
    var type = {
        parse: function(raw) {
            if (_.isDate(raw) || _.isUndefined(raw)) return raw;
            if (!format || !_.isString(raw)) {
                errors++;
                return raw;
            }

            var m = parse(raw, format);

            if (!m) {
                errors++;
                return raw;
            } else {
                // increment errors anyway if string doesn't match strict format
                if (!test(raw, format)) errors++;
            }
            switch (format) {
                case 'YYYY': return new Date(m[1], 0, 1);
                case 'YYYY-H': return new Date(m[1], (m[2]-1) * 6, 1);
                case 'H-YYYY': return new Date(m[2], (m[1]-1) * 6, 1);
                case 'YYYY-Q': return new Date(m[1], (m[2]-1) * 3, 1);
                case 'Q-YYYY': return new Date(m[2], (m[1]-1) * 3, 1);
                case 'YYYY-M': return new Date(m[1], (m[2]-1), 1);
                case 'M-YYYY': return new Date(m[2], (m[1]-1), 1);
                case 'YYYY-WW': return dateFromIsoWeek(m[1], m[2], 1);
                case 'YYYY-WW-d': return dateFromIsoWeek(m[1], m[2], m[3]);
                case 'YYYY-MM-DD': return new Date(m[1], (m[3]-1), m[4]);
                case 'DD/MM/YYYY': return new Date(m[4], (m[3]-1), m[1]);
                case 'MM/DD/YYYY': return new Date(m[4], (m[1]-1), m[3]);
                case 'YYYY-MM-DD HH:MM': return new Date(m[1], (m[3]-1), m[4], m[5] || 0, m[6] || 0, 0);
                case 'DD.MM.YYYY HH:MM': return new Date(m[4], (m[3]-1), m[1], m[5] || 0, m[6] || 0, 0);
                case 'MM/DD/YYYY HH:MM': return new Date(m[4], (m[1]-1), m[3], m[5] || 0, m[6] || 0, 0);
                case 'YYYY-MM-DD HH:MM:SS': return new Date(m[1], (m[3]-1), m[4], m[5] || 0, m[6] || 0, m[7] || 0);
                case 'DD.MM.YYYY HH:MM:SS': return new Date(m[4], (m[3]-1), m[1], m[5] || 0, m[6] || 0, m[7] || 0);
                case 'MM/DD/YYYY HH:MM:SS': return new Date(m[4], (m[1]-1), m[3], m[5] || 0, m[6] || 0, m[7] || 0);
            }
            errors++;
            return raw;
        },
        toNum: function(d) { return d.getTime(); },
        fromNum: function(i) { return new Date(i); },
        errors: function() { return errors; },
        name: function() { return 'date'; },

        format: function(fmt) {
            if (arguments.length) {
                format = fmt;
                return type;
            }
            return format;
        },

        precision: function() { return knownFormats[format].precision; },

        // returns a function for formatting dates
        formatter: function(config) {
            if (!format) return _.identity;
            var M_pattern = Globalize.culture().calendar.patterns.M.replace('MMMM','MMM');
            switch (knownFormats[format].precision) {
                case 'year': return function(d) { return !_.isDate(d) ? d : d.getFullYear(); };
                case 'half': return function(d) { return !_.isDate(d) ? d : d.getFullYear() + ' H'+(d.getMonth()/6 + 1); };
                case 'quarter': return function(d) { return !_.isDate(d) ? d : d.getFullYear() + ' Q'+(d.getMonth()/3 + 1); };
                case 'month': return function(d) { return !_.isDate(d) ? d : Globalize.format(d, 'MMM yy'); };
                case 'week': return function(d) { return !_.isDate(d) ? d : dateToIsoWeek(d).slice(0,2).join(' W'); };
                case 'day': return function(d, verbose) { return !_.isDate(d) ? d : Globalize.format(d, verbose ? 'D' : 'd'); };
                case 'day-minutes': return function(d) { return !_.isDate(d) ? d : Globalize.format(d, M_pattern).replace(' ', '&nbsp;')+' - '+ Globalize.format(d, 't').replace(' ', '&nbsp;'); };
                case 'day-seconds': return function(d) { return !_.isDate(d) ? d : Globalize.format(d, 'T').replace(' ', '&nbsp;'); };
            }
        },

        isValid: function(val) {
            return _.isDate(type.parse(val));
        },

        ambiguousFormats: function() {
            var candidates = [];
            _.each(matches, function(cnt, fmt) {
                if (cnt == bestMatch[1]) {
                    candidates.push([fmt, fmt]); // key, label
                }
            });
            return candidates;
        }
    };
    return type;
};


// namespace for dataset sources

// API for sources is
//
// dw.datasource.delimited(opts).dataset();
//
dw.datasource = {};

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




dw.utils = {

    /*
     * returns the min/max range of a set of columns
     */
    minMax: function (columns) {
        var minmax = [Number.MAX_VALUE, -Number.MAX_VALUE];
            _.each(columns, function(column) {
                minmax[0] = Math.min(minmax[0], column.range()[0]);
                minmax[1] = Math.max(minmax[1], column.range()[1]);
            });
        return minmax;
    },

    /*
     * return a custom date tick format function for d3.time.scales
     *
     * @param daysDelta    the number of days between minimum and maximum date
     */
    dateFormat: function(daysDelta) {
        var new_month = true, last_date = false;
        function timeFormat(formats) {
            return function(date) {
                new_month = !last_date || date.getMonth() != last_date.getMonth();
                last_date = date;
                var i = formats.length - 1, f = formats[i];
                while (!f[1](date)) f = formats[--i];
                return f[0](date);
            };
        }

        function time_fmt(fmt) {
            var format = function(date) {
                var r = Globalize.format(date, fmt);
                return fmt != 'htt' ? r : r.toLowerCase();
            };
            return format;
        }

        var fmt = (function(lang) {
            return {
                date: lang == 'de' ? "dd." : "dd",
                hour: lang != 'en' ? "H:00" : "htt",
                minute: lang == 'de' ? "H:mm" : 'h:mm',
                mm: lang == 'de' ? 'd.M.' : 'MM/dd',
                mmm: lang == 'de' ? 'd.MMM' : 'MMM dd',
                mmmm: lang == 'de' ? 'd. MMMM' : 'MMMM dd'
            };
        })(Globalize.culture().language);

        // use globalize instead of d3
        return timeFormat([
            [time_fmt("yyyy"),
                function() { return true; }],
            [time_fmt(daysDelta > 70 ? "MMM" : "MMM"),
                function(d) { return d.getMonth() !== 0; }],  // not January
            [time_fmt(fmt.date),
                function(d) { return d.getDate() != 1; }],  // not 1st of month
            [time_fmt(daysDelta < 7 ? fmt.mm : daysDelta > 70 ? fmt.mmm : fmt.mmm),
                function(d) { return d.getDate() != 1 && new_month; }],  // not 1st of month
            //[time_fmt("%a %d"), function(d) { return d.getDay() && d.getDate() != 1; }],  // not monday
            [time_fmt(fmt.hour),
                function(d) { return d.getHours(); }],
            [time_fmt(fmt.minute),
                function(d) { return d.getMinutes(); }],
            [time_fmt(":ss"),
                function(d) { return d.getSeconds(); }],
            [time_fmt(".fff"),
                function(d) { return d.getMilliseconds(); }]
        ]);
    },

    /**
     * DEPRECATED
     * returns a function for formating a date based on the
     * input format of the dates in the dataset
     */
    longDateFormat: function(column) {
        return function(d) {
            if (column.type() == 'date') {
                switch (column.type(true).precision()) {
                    case 'year': return d.getFullYear();
                    case 'quarter': return d.getFullYear() + ' Q'+(d.getMonth()/3 + 1);
                    case 'month': return Globalize.format(d, 'MMM yy');
                    case 'day': return Globalize.format(d, 'MMM d');
                    case 'minute': return Globalize.format(d, 't');
                    case 'second': return Globalize.format(d, 'T');
                }
            } else {
                return d;
            }
        };
    },

    columnNameColumn: function(columns) {
        var names = _.map(columns, function(col) { return col.title(); });
        return dw.column('', names);
    },

    name: function(obj) {
        return _.isFunction(obj.name) ? obj.name() : _.isString(obj.name) ? obj.name : obj;
    },

    getMaxChartHeight: function(el) {
        function margin(el, type) {
            if ($(el).css('margin-' + type) == 'auto') return 0;
            return +$(el).css('margin-' + type).replace('px', '');
        }
        var ch = 0, bottom = 0; // summed height of children, 10px for top & bottom margin
        $('body > *').each(function(i, el) {
            var t = el.tagName.toLowerCase();
            if (t != 'script' && t != 'style' && el.id != 'chart' && !$(el).hasClass('tooltip') &&
                !$(el).hasClass('qtip') && !$(el).hasClass('container') &&
                !$(el).hasClass('noscript')) {
                ch += $(el).outerHeight(false); // element height
            }
            ch += Math.max(margin(el, 'top'), bottom);
            bottom = margin(el, 'bottom');
        });
        ch += bottom;
        // subtract body padding
        //ch += $('body').innerHeight() - $('body').height();
        var mt = $('#chart').css('margin-top').replace('px', ''),
            mb = $('#chart').css('margin-bottom').replace('px', ''),
            // FIXME: -8 instead of -2 because when `introduction` is filled, a scrollbar appears.
            // Should be dynamic.
            maxH = $(window).height() - ch - 8;
        // IE Fix
        if (!$.support.leadingWhitespace) maxH -= 15;
        maxH -= $('body').css('padding-top').replace('px', '');
        maxH -= $('body').css('padding-bottom').replace('px', '');
        return maxH;
    },

    /*
     * Remove all html tags from the given string
     *
     * written by Kevin van Zonneveld et.al.
     * taken from https://github.com/kvz/phpjs/blob/master/functions/strings/strip_tags.js
     */
    purifyHtml: function(input, allowed) {
        var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
            commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi,
            default_allowed = "<b><br><br/><i><strong><sup><sub><strike><u><em><tt>",
            allowed_split = {};

        if (allowed === undefined) allowed = default_allowed;
        allowed_split[allowed] = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)

        function purifyHtml(input, allowed) {
            if (!_.isString(input) || input.indexOf("<") < 0) {
                return input;
            }
            if (allowed === undefined) {
                allowed = default_allowed;
            }
            if (!allowed_split[allowed]) {
                allowed_split[allowed] = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
            }
            return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
                return allowed_split[allowed].indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
            });
        }
        dw.utils.purifyHtml = purifyHtml;
        return purifyHtml(input, allowed);
    },

    /*
     *
     */
    significantDimension: function(values) {
        var result = [], dimension = 0,
            uniqValues = _.uniq(values),
            check, diff;

        if (uniqValues.length == 1) {
            return -1 * Math.floor(Math.log(uniqValues[0])/Math.LN10);
        }

        if (_.uniq(_.map(uniqValues, round)).length == uniqValues.length) {
            check = function() { return _.uniq(result).length == uniqValues.length; };
            diff = -1;
        } else {
            check = function() { return _.uniq(result).length < uniqValues.length; };
            diff = +1;
        }
        var max_iter = 100;
        do {
            result = _.map(uniqValues, round);
            dimension += diff;
        } while (check() && max_iter-- > 0);
        if (max_iter < 10) {
            console.warn('maximum iteration reached', values, result, dimension);
        }
        if (diff < 0) dimension += 2; else dimension--;
        function round(v) {
            return dw.utils.round(v, dimension);
        }
        return dimension;
    },

    round: function(value, dimension) {
        var base = Math.pow(10, dimension);
        return Math.round(value * base) / base;
    },

    /*
     * Rounds a set of unique numbers to the lowest
     * precision where the values remain unique
     */
    smartRound: function(values, add_precision) {
        var dim = dw.utils.significantDimension(values);
        dim += add_precision || 0;
        return _.map(values, function(v) { return dw.utils.round(v, dim); });
    },

    /*
     * returns the number in array that is closest
     * to the given value
     */
    nearest: function(array, value) {
        var min_diff = Number.MAX_VALUE, min_diff_val;
        _.each(array, function(v) {
            var d = Math.abs(v - value);
            if (d < min_diff) {
                min_diff = d;
                min_diff_val = v;
            }
        });
        return min_diff_val;
    },

    metricSuffix: function(locale) {
        switch (locale.substr(0, 2).toLowerCase()) {
            case 'de': return { 3: ' Tsd.', 6: ' Mio.', 9: ' Mrd.', 12: ' Bio.' };
            case 'fr': return { 3: ' mil', 6: ' Mio', 9: ' Mrd' };
            case 'es': return { 3: ' Mil', 6: ' millón' };
            default: return { 3: 'k', 6: 'M', 9: ' bil' };
        }
    },

    magnitudeRange: function(minmax) {
        var e0 = Math.round(Math.log(minmax[0]) / Math.LN10),
            e1 = Math.round(Math.log(minmax[1]) / Math.LN10);
        return e1 - e0;
    },

    logTicks: function(min, max) {
        var e0 = Math.round(Math.log(min) / Math.LN10),
            e1 = Math.round(Math.log(max) / Math.LN10);
        return _.map(_.range(e0, e1), function(exp) { return Math.pow(10, exp); });
    }

};

dw.utils.filter = function (column, active, type, format) {
    var callbacks = [];

    type = type || 'auto';
    format = format || _.identity;

    if (type == 'auto') {
        if (column.type() == 'date') type = 'timescale';
        else if (column.type() == 'text') type = column.length < 6 ? 'buttons' : 'select';
    }

    var filter = {
        ui: getFilterUI(type),
        change: function(callback) {
            callbacks.push(callback);
        }
    };

    function update(i) {
        _.each(callbacks, function(cb) {
            if (_.isFunction(cb)) {
                cb(column.val(i), i);
            }
        });
    }


    function getFilterUI(type) {
        var f;

        if (type == 'auto') {
            type = column.type() == 'date' ? 'timescale' :
                column.length < 6 ? 'buttons' : 'select';
        }

        if (column.length < 2) return function() { return false; };

        if (type == 'select') f = function(vis) {
            // use <select>
            var select = $('<select />');
            column.each(function(val, i) {
                var lbl = format(val);
                if (!lbl) return;
                select.append('<option value="'+i+'">'+(_.isString(lbl) ? $.trim(lbl) : lbl)+'</option>');
            });
            select.change(function(evt) {
                var cur = select.val();
                update(cur);
            });
            select.addClass('filter-ui filter-select');
            return select;
        };

        if (type == 'buttons') f = function(vis) {
            // use link buttons
            var div = $('<div />');
            div.addClass('filter-ui filter-links');
            column.each(function(val, i) {
                var lbl = format(val);
                if (!lbl) return;
                var a = $('<a href="#'+i+'"'+(i == active ? ' class="active" ': '')+'>'+(_.isString(lbl) ? $.trim(lbl) : lbl)+'</a>').data('row', i);
                div.append(a);
            });
            $('a', div).click(function(e) {
                var a = $(e.target);
                e.preventDefault();
                if (a.hasClass('active')) return;
                $('a', div).removeClass('active');
                a.addClass('active');
                update(a.data('row'));
            });
            div.appendTo('body');
            var fy = $('a:first', div).offset().top,
                ly = $('a:last', div).offset().top;
            if (fy != ly) {
                div.remove();
                return getFilterUI('select')(vis); // fall back to select
            }
            return div;
        };

        if (type == 'timescale') f = function(vis) {
            var w = Math.min(vis.__w-30, Math.max(300, vis.__w * 0.7)),
                timescale = d3.time.scale()
                    .domain([column.val(0), column.val(-1)])
                    .range([0, w]),
                timesel = $('<div></div>').css({
                    position:'relative',
                    height: 45,
                    'margin-left': 3
                }).addClass('filter-ui'),
                nticks = w / 80,
                ticks = timescale.ticks(nticks),
                daysDelta = Math.round((column.val(-1).getTime() - column.val(0).getTime()) / 86400000),
                fmt = dw.utils.dateFormat(daysDelta),
                lfmt = column.type(true).formatter(),
                dots = timescale.ticks(w / 8),
                lbl_x = function(i) { return Math.max(-18, timescale(column.val(i)) - 40); };

            // show text labels for bigger tick marks (about every 80 pixel)
            _.each(ticks, function(d) {
                var s = $('<span>'+fmt(d)+'</span>'),
                    x = timescale(d) - 40,
                    lw = vis.labelWidth(fmt(d));
                if (40 - lw*0.5 + x < 0) x = -40 +0.5 * lw;
                s.css({ position: 'absolute', top:0, width: 80, left: x,
                    'text-align': 'center', opacity: 0.55 });
                timesel.append(s);
            });

            // show tiny tick marks every 15 pixel
            _.each(dots, function(d) {
                if (d.getTime() < column.val(0).getTime() || d.getTime() > column.val(-1).getTime()) return;
                var s = $('<span class="dot"></span>');
                s.css({
                    position: 'absolute',
                    bottom: 19,
                    width: 1,
                    height: '1ex',
                    'border-left': '1px solid #000',
                    'vertical-align': 'bottom',
                    left: Math.round(timescale(d))+0.5
                });
                if (!_.find(ticks, function(td) { return d.getTime() == td.getTime(); })) {
                    s.css({ height: '0.6ex', opacity: 0.5 });
                }
                timesel.append(s);
            });

            // a pointer symbol to highlight the current date
            var pointer = $('<div>▲</div>').css({
                position: 'absolute',
                width: 20,
                bottom: 2,
                left: timescale(column.val(active))-9,
                'text-align': 'center'});
            timesel.append(pointer);

            // a label to show the current date
            var lbl = $('<div><span></span></div>').css({
                position: 'absolute',
                width: 80,
                top: 0,
                left: lbl_x(active),
                'text-align': 'center'
            })
             .data('last-txt', lfmt(column.val(active)))
             .data('last-left', lbl_x(active));

            $('span', lbl).css({
                background: vis.theme().colors.background,
                'font-weight': 'bold',
                'padding': '0 1ex'
            }).html(lfmt(column.val(active)));
            timesel.append(lbl);

            // add hairline as time axis
            $('<div />').css({
                position: 'absolute',
                width: w+1,
                bottom: 15,
                height: 2,
                'border-bottom': '1px solid #000'
            }).appendTo(timesel);

            // add an invisible div to catch mouse events
            var bar = $('<div />').css({
                position: 'absolute',
                left: 0,
                width: w,
                height: 40
            });
            timesel.append(bar);

            /*
             * this helper function returns the nearest date to an x position
             */
            function nearest(rel_x) {
                var x_date = timescale.invert(rel_x),
                    min_dist = Number.MAX_VALUE,
                    nearest_row = 0;
                // find nearest date
                column.each(function(date, i) {
                    var dist = Math.abs(date.getTime() - x_date.getTime());
                    if (dist < min_dist) {
                        min_dist = dist;
                        nearest_row = i;
                    }
                });
                return nearest_row;
            }

            var autoClickTimer;

            // clicking the bar updates the visualization
            bar.click(function(evt) {
                // find nearest data row
                var rel_x = evt.clientX - bar.offset().left,
                    nearest_row = nearest(rel_x);
                update(nearest_row);
                timesel.data('update-func')(nearest_row);
                clearTimeout(autoClickTimer);
            });

            // hovering the bar shows nearest date
            bar.mousemove(function(evt) {
                var rel_x = evt.clientX - bar.offset().left,
                    nearest_row = nearest(rel_x);
                $('span', lbl).html(lfmt(column.val(nearest_row)));
                lbl.css({ left: lbl_x(nearest_row) });
                pointer.css({ left: timescale(column.val(nearest_row)) - 10 });
                clearTimeout(autoClickTimer);
                autoClickTimer = setTimeout(function() {
                    update(nearest_row);
                    lbl.data('last-left', lbl_x(nearest_row));
                    lbl.data('last-txt', lbl.text());
                }, 500);
            });

            // reset position after mouse has gone
            bar.mouseleave(function() {
                lbl.css({ left: lbl.data('last-left') });
                pointer.css({ left: lbl.data('last-left')+30 });
                $('span', lbl).html(lbl.data('last-txt'));
                clearTimeout(autoClickTimer);
            });

            timesel.data('update-func', function(i) {
                pointer.stop().animate({ left: timescale(column.val(i)) - 10 }, 500, 'expoInOut');

                var l_x = lbl_x(i),
                    lbl_txt = lfmt(column.val(i));

                $('span', lbl).html(lbl_txt);
                lbl.css({ left: l_x });
                lbl.data('last-left', l_x);
                lbl.data('last-txt', lbl_txt);
            });
            return timesel;
        };

        return f;
    }

    return filter;
};

dw.chart = function(attributes) {

    // private methods and properties
    var dataset,
        theme,
        visualization,
        metric_prefix,
        change_callbacks = $.Callbacks(),
        locale;

    // public interface
    var chart = {
        // returns an attribute
        get: function(key, _default) {
            var keys = key.split('.'),
                pt = attributes;

            _.some(keys, function(key) {
                if (_.isUndefined(pt) || _.isNull(pt)) return true; // break out of the loop
                pt = pt[key];
                return false;
            });
            return _.isUndefined(pt) || _.isNull(pt) ? _default : pt;
        },

        set: function(key, value) {
            var keys = key.split('.'),
                lastKey = keys.pop(),
                pt = attributes;

            // resolve property until the parent dict
            _.each(keys, function(key) {
                if (_.isUndefined(pt[key]) || _.isNull(pt[key])) {
                    pt[key] = {};
                }
                pt = pt[key];
            });

            // check if new value is set
            if (!_.isEqual(pt[lastKey], value)) {
                pt[lastKey] = value;
                change_callbacks.fire(chart, key, value);
            }
            return this;
        },

        // loads the dataset and returns a deferred
        load: function() {
            var datasource;

            datasource = dw.datasource.delimited({
                url: 'data.csv',
                firstRowIsHeader: chart.get('metadata.data.horizontal-header', true),
                transpose: chart.get('metadata.data.transpose', false)
            });

            return datasource.dataset().pipe(function(ds) {
                chart.dataset(ds);
                return ds;
            });
        },

        // returns the dataset
        dataset: function(ds) {
            if (arguments.length) {
                dataset = applyChanges(ds);
                return chart;
            }
            return dataset;
        },

        // sets or gets the theme
        theme: function(_theme) {
            if (arguments.length) {
                theme = _theme;
                return chart;
            }
            return theme || {};
        },

        // sets or gets the visualization
        vis: function(_vis) {
            if (arguments.length) {
                visualization = _vis;
                visualization.chart(chart);
                return chart;
            }
            return visualization;
        },

        // returns true if the user has set any highlights
        hasHighlight: function() {
            var hl = chart.get('metadata.visualize.highlighted-series');
            return _.isArray(hl) && hl.length > 0;
        },

        isHighlighted: function(obj) {
            if (_.isUndefined(obj) === undefined) return false;
            var hl = this.get('metadata.visualize.highlighted-series'),
                obj_name = dw.utils.name(obj);
            return !_.isArray(hl) || hl.length === 0 || _.indexOf(hl, obj_name) >= 0;
        },

        locale: function(_locale) {
            if (arguments.length) {
                locale = _locale;
                Globalize.culture(locale);
                return chart;
            }
            return locale;
        },

        metricPrefix: function(_metric_prefix) {
            if (arguments.length) {
                metric_prefix = _metric_prefix;
                return chart;
            }
            return metric_prefix;
        },

        formatValue: function(val, full, round) {
            var format = chart.get('metadata.describe.number-format'),
                div = Number(chart.get('metadata.describe.number-divisor')),
                append = chart.get('metadata.describe.number-append', '').replace(' ', '&nbsp;'),
                prepend = chart.get('metadata.describe.number-prepend', '').replace(' ', '&nbsp;');

            if (div !== 0) val = Number(val) / Math.pow(10, div);
            if (format != '-') {
                if (round || val == Math.round(val)) format = format.substr(0,1)+'0';
                val = Globalize.format(val, format);
            } else if (div !== 0) {
                val = val.toFixed(1);
            }
            return full ? prepend + val + append : val;
        },

        render: function(container) {
            if (!visualization || !theme || !dataset) {
                throw 'cannot render the chart!';
            }
            visualization.chart(chart);
            visualization.__init();
            var $cont = $(container);
            $cont
                .parent()
                .addClass('vis-'+visualization.id)
                .addClass('theme-'+theme.id);
            visualization.render($cont);
        },

        attributes: function(attrs) {
            if (arguments.length) {
                attributes = attrs;
                return chart;
            }
            return attributes;
        },

        onChange: change_callbacks.add,

        columnFormatter: function(column) {
            // pull output config from metadata
            // return column.formatter(config);
            var colFormat = chart.get('metadata.data.column-format', {});
            colFormat = colFormat[column.name()] || {};

            if (column.type() == 'number' && colFormat == 'auto') {
                var mtrSuf = dw.utils.metricSuffix(chart.locale()),
                    values = column.values(),
                    dim = dw.utils.significantDimension(values),
                    div = dim < -2 ? (Math.round((dim*-1) / 3) * 3) :
                            (dim > 2 ? dim*-1 : 0),
                    ndim = dw.utils.significantDimension(_.map(values, function(v) {
                        return v / Math.pow(10, div);
                    }));

                colFormat = {
                    'number-divisor': div,
                    'number-append': div ? mtrSuf[div] || ' × 10<sup>'+div+'</sup>' : '',
                    'number-format': 'n'+Math.max(0, ndim)
                };
            }
            return column.type(true).formatter(colFormat);
        }

    };

    function applyChanges(dataset) {
        var changes = chart.get('metadata.data.changes', []);
        var transpose = chart.get('metadata.data.transpose', false);
        _.each(changes, function(change) {
            var row = "row", column = "column";
            if (transpose) {
                row = "column";
                column = "row";
            }

            if (dataset.hasColumn(change[column])) {
                if (change[row] === 0) {
                    dataset.column(change[column]).title(change.value);
                }
                else {
                    dataset.column(change[column]).raw(change[row] - 1, change.value);
                }
            }
        });

        var columnFormats = chart.get('metadata.data.column-format', {});
        _.each(columnFormats, function(columnFormat, key) {
            if (columnFormat.type && dataset.hasColumn(key)) {
                dataset.column(key).type(columnFormat.type);
            }
            if (columnFormat['input-format'] && dataset.hasColumn(key)) {
                dataset.column(key).type(true).format(columnFormat['input-format']);
            }
        });
        return dataset;
    }

    return chart;
};



dw.visualization = (function(){

    var __vis = {};

    var visualization = function(id) {
        return new __vis[id]();
    };

    visualization.register = function(id) {
        var parent = arguments.length == 3 ? __vis[arguments[1]].prototype : dw.visualization.base,
            props = arguments[arguments.length - 1],
            vis = __vis[id] = function() {};

        _.extend(vis.prototype, parent, { id: id }, props);
    };

    return visualization;

})();



// Every visualization must extend this class.
// It provides the basic API between the chart template
// page and the visualization class.

dw.visualization.base = (function() {}).prototype;

_.extend(dw.visualization.base, {

    // called before rendering
    __init: function() {
        this.__renderedDfd = $.Deferred();
        if (window.parent && window.parent['postMessage']) {
            window.parent.postMessage('datawrapper:vis:init', '*');
        }
        return this;
    },

    render: function(el) {
        $(el).html('implement me!');
    },

    theme: function(theme) {
        if (!arguments.length) return this.__theme;
        this.__theme = theme;
        var attr_properties = ['horizontalGrid', 'verticalGrid', 'yAxis', 'xAxis'];
        _.each(attr_properties, function(prop) {
            // convert camel-case to dashes
            if (theme.hasOwnProperty(prop)) {
                for (var key in theme[prop]) {
                    // dasherize
                    var lkey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
                    if (!theme[prop].hasOwnProperty(lkey)) {
                        theme[prop][lkey] = theme[prop][key];
                    }
                }
            }
        });
        return this;
    },

    size: function(width, height) {
        var me = this;
        if (!arguments.length) return [me.__w, me.__h];
        me.__w = width;
        me.__h = height;
        return me;
    },

    /**
     * short-cut for this.chart.get('metadata.visualize.*')
     */
    get: function(str, _default) {
        return this.chart().get('metadata.visualize.'+str, _default);
    },

    notify: function(str) {
        if (dw.backend && _.isFunction(dw.backend.notify)) {
            return dw.backend.notify(str);
        } else {
            if (window.parent && window.parent['postMessage']) {
                window.parent.postMessage('notify:'+str, '*');
            } else if (window['console']) {
                console.log(str);
            }
        }
    },

    /**
     * returns a signature for this visualization which will be used
     * to test correct rendering of the chart in different browsers.
     * See raphael-chart.js for example implementation.
     */
    signature: function() {
        // nothing here, please overload
    },

    translate: function(str) {
        var locale = this.meta.locale, lang = this.lang;
        return locale[str] ? locale[str][lang] || locale[str] : str;
    },

    checkBrowserCompatibility: function(){
        return true;
    },

    chart: function(chart) {
        var me = this;
        if (!arguments.length) return me.__chart;
        me.dataset = chart.dataset();
        me.theme(chart.theme());
        me.__chart = chart;
        var columnFormat = chart.get('metadata.data.column-format', {});
        var ignore = {};
        _.each(columnFormat, function(format, key) {
            ignore[key] = !!format.ignore;
        });
        me.dataset.filterColumns(ignore);
        return me;
    },

    axes: function(returnAsColumns) {
        var me = this,
            dataset = me.dataset,
            usedColumns = {},
            axes = {},
            axesDef,
            axesAsColumns = {},
            errors = [];

        // get user preference
        axesDef = me.chart().get('metadata.axes', {});
        _.each(me.meta.axes, function(o, key) {
            if (axesDef[key]) {
                var columns = axesDef[key];
                if (columnExists(columns)) {
                    axes[key] = columns;
                    // mark columns as used
                    if (!_.isArray(columns)) columns = [columns];
                    _.each(columns, function(column) {
                        usedColumns[column] = true;
                    });
                }
            }
        });

        // auto-populate remaining axes
        _.each(me.meta.axes, function(axisDef, key) {
            function checkColumn(col) {
                return !usedColumns[col.name()] &&
                    _.indexOf(axisDef.accepts, col.type()) >= 0;
            }
            function errMissingColumn() {
                var msg = dw.backend ?
                        dw.backend.messages.insufficientData :
                        'The visualization needs at least one column of the type %type to populate axis %key';
                errors.push(msg.replace('%type', axisDef.accepts).replace('%key', key));
            }
            if (axes[key]) return;  // user has defined this axis already
            if (!axisDef.optional) {
                if (!axisDef.multiple) {
                    // find first colulmn accepted by axis
                    var c = _.find(dataset.columns(), checkColumn);
                    if (c) {
                        usedColumns[c.name()] = true; // mark column as used
                        axes[key] = c.name();
                    } else {
                        // try to auto-populate missing text column
                        if (_.indexOf(axisDef.accepts, 'text') >= 0) {
                            var col = dw.column(key, _.map(_.range(dataset.numRows()), function(i) {
                                return (i > 25 ? String.fromCharCode(64+i/26) : '') + String.fromCharCode(65+(i%26));
                            }), 'text');
                            dataset.add(col);
                            me.chart().dataset(dataset);
                            usedColumns[col.name()] = true;
                            axes[key] = col.name();
                        } else {
                            errMissingColumn();
                        }
                    }
                } else {
                    axes[key] = [];
                    dataset.eachColumn(function(c) {
                        if (checkColumn(c)) {
                            usedColumns[c.name()] = true;
                            axes[key].push(c.name());
                        }
                    });
                    if (!axes[key].length) {
                        errMissingColumn();
                    }
                }
            } else {
                axes[key] = false;
            }
        });

        if (errors.length) {
            me.notify(errors.join('<br />'));
        }

        _.each(axes, function(columns, key) {
            if (!_.isArray(columns)) {
                axesAsColumns[key] = columns !== false ? me.dataset.column(columns) : null;
            } else {
                axesAsColumns[key] = [];
                _.each(columns, function(column, i) {
                    axesAsColumns[key][i] = column !== false ? me.dataset.column(column) : null;
                });
            }
        });

        me.axes = function(returnAsColumns) {
            return returnAsColumns ? axesAsColumns : axes;
        };

        function columnExists(columns) {
            if (!_.isArray(columns)) columns = [columns];
            for (var i=0; i<columns.length; i++) {
                if (!dataset.hasColumn(columns[i])) return false;
            }
            return true;
        }

        return me.axes(returnAsColumns);
    },

    keys: function() {
        var me = this,
            axesDef = me.axes();
        if (axesDef.labels) {
            var lblCol = me.dataset.column(axesDef.labels),
                fmt = me.chart().columnFormatter(lblCol),
                keys = [];
            lblCol.each(function(val) {
                keys.push(String(fmt(val)));
            });
            return keys;
        }
        return [];
    },

    keyLabel: function(key) {
        return key;
    },

    /*
     * called by the core whenever the chart is re-drawn
     * without reloading the page
     */
    reset: function() {
        this.clear();
        $('#chart').html('').off('click').off('mousemove').off('mouseenter').off('mouseover');
        $('.chart .filter-ui').remove();
        $('.chart .legend').remove();
    },

    clear: function() {

    },

    renderingComplete: function() {
        if (window.parent && window.parent['postMessage']) {
            window.parent.postMessage('datawrapper:vis:rendered', '*');
        }
        this.__renderedDfd.resolve();
    },

    rendered: function() {
        return this.__renderedDfd.promise();
    },

    /*
     * smart rendering means that a visualization is able to
     * re-render itself without having to instantiate it again
     */
    supportsSmartRendering: function() {
        return false;
    },

    /*
     * this hook is used for optimizing the thumbnails on Datawrapper
     * the function is expected to return the svg element that contains
     * the elements to be rendered in the thumbnails
     */
    _svgCanvas: function() {
        return false;
    }

});




dw.theme = (function(){

    var __themes = {};

    var theme = function(id) {
        return __themes[id];
    };

    theme.register = function(id) {
        var parent = arguments.length == 3 ? __themes[arguments[1]] : dw.theme.base,
            props = arguments[arguments.length - 1];

        __themes[id] = extend({}, parent, { id: id }, props);
    };

    /*
     * taken from jQuery 1.10.2 $.extend, but changed a little
     * so that arrays are not deep-copied. also deep-coping
     * cannot be turned off anymore.
     */
    function extend() {
        var options, name, src, copy, clone,
            target = arguments[0] || {},
            i = 1,
            length = arguments.length;

        // Handle case when target is a string or something (possible in deep copy)
        if ( typeof target !== "object" && !_.isFunction(target) ) {
            target = {};
        }

        for ( ; i < length; i++ ) {
            // Only deal with non-null/undefined values
            if ( (options = arguments[ i ]) != null ) {
                // Extend the base object
                for ( name in options ) {
                    src = target[ name ];
                    copy = options[ name ];

                    // Prevent never-ending loop
                    if ( target === copy ) {
                        continue;
                    }

                    // Recurse if we're merging plain objects or arrays
                    if ( copy && isPlainObject(copy) ) {
                        clone = src && isPlainObject(src) ? src : {};

                        // Never move original objects, clone them
                        target[ name ] = extend( clone, copy );
                    // Don't bring in undefined values
                    } else if ( copy !== undefined ) {
                        target[ name ] = copy;
                    }
                }
            }
        }
        // Return the modified object
        return target;
    }

    function isPlainObject(o) {
        return _.isObject(o) && !_.isArray(o) && !_.isFunction(o);
    }

    return theme;

})();



// Every theme must extend this class.
// It provides the basic API between the chart template
// page and the visualization class.

dw.theme.base = {

    /*
     * colors used in the theme
     */
    colors: {
        palette: ['#6E7DA1', '#64A4C4', '#53CCDD',  '#4EF4E8'],
        secondary: ["#000000", '#777777', '#cccccc', '#ffd500', '#6FAA12'],

        positive: '#85B4D4',
        negative: '#E31A1C',
        // colors background and text needs to be set in CSS as well!
        background: '#ffffff',
        text: '#000000',

        /*
         * gradients that might be used by color gradient selectors
         *
         * Colors from www.ColorBrewer2.org by Cynthia A. Brewer,
         * Geography, Pennsylvania State University.
         */
        gradients: [
            ['#fefaca', '#008b15'], // simple yellow to green
            ['#f0f9e8','#ccebc5','#a8ddb5','#7bccc4','#43a2ca','#0868ac'],  // GnBu
            ['#feebe2','#fcc5c0','#fa9fb5','#f768a1','#c51b8a','#7a0177'],  // RdPu
            ['#ffffcc','#c7e9b4','#7fcdbb','#41b6c4','#2c7fb8','#253494'],  // YlGnbu

            ['#8c510a','#d8b365','#f6e8c3','#f5f7ea','#c7eae5','#5ab4ac','#01665e'],  // BrBG
            ['#c51b7d','#e9a3c9','#fde0ef','#faf6ea','#e6f5d0','#a1d76a','#4d9221'],  // PiYG
            ['#b2182b','#ef8a62','#fddbc7','#f8f6e9','#d1e5f0','#67a9cf','#2166ac'],  // RdBu
            //['#b35806','#f1a340','#fee0b6','#f7f7f7','#d8daeb','#998ec3','#542788'],  // PuOr
        ],

        /*
         * presets for category colors
         *
         * Colors from www.ColorBrewer2.org by Cynthia A. Brewer,
         * Geography, Pennsylvania State University.
         */
        categories: [
            ["#7fc97f", "#beaed4", "#fdc086", "#ffff99", "#386cb0", "#f0027f", "#bf5b17", "#666666"], // Accent
            ["#fbb4ae", "#b3cde3", "#ccebc5", "#decbe4", "#fed9a6", "#ffffcc", "#e5d8bd", "#fddaec", "#f2f2f2"], // Pastel1
            ["#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99", "#e31a1c", "#fdbf6f", "#ff7f00", "#cab2d6", "#6a3d9a", "#ffff99", "#b15928"] // Paired
        ]
    },

    annotation: {
        background: '#000',
        opacity: 0.08
    },

    /*
     * padding around the chart area
     */
    padding: {
        left: 0,
        right: 20,
        bottom: 30,
        top: 10
    },

    /*
     * custom properties for line charts
     */
    lineChart: {
        // stroke width used for lines, in px
        strokeWidth: 3,
        // the maximum width of direct labels, in px
        maxLabelWidth: 80,
        // the opacity used for fills between two lines
        fillOpacity: 0.2,
        // distance between labels and x-axis
        xLabelOffset: 20
    },

    /*
     * custom properties for column charts
     */
    columnChart: {
        // if set to true, the horizontal grid lines are cut
        // so that they don't overlap with the grid label.
        cutGridLines: false,
        // you can customize bar attributes
        barAttrs: {
            'stroke-width': 1
        },
        // make strokes a little darker than the fill
        darkenStroke: 18
    },

    /*
     * custom properties for bar charts
     */
    barChart: {
        // you can customize bar attributes
        barAttrs: {
            'stroke-width': 1
        }
    },

    /*
     * attributes of x axis, if there is any
     */
    xAxis: {
        stroke: '#333'
    },

    /*
     * attributes of y-axis if there is any shown
     */
    yAxis: {
        strokeWidth: 1
    },


    /*
     * attributes applied to horizontal grids if displayed
     * e.g. in line charts, column charts, ...
     *
     * you can use any property that makes sense on lines
     * such as stroke, strokeWidth, strokeDasharray,
     * strokeOpacity, etc.
     */
    horizontalGrid: {
        stroke: '#d9d9d9'
    },

    /*
     * just like horizontalGrid. used in line charts only so far
     *
     * you can define the grid line attributes here, e.g.
     * verticalGrid: { stroke: 'black', strokeOpacity: 0.4 }
     */
    verticalGrid: false,

    /*
     * draw a frame around the chart area (only in line chart)
     *
     * you can define the frame attributes here, e.g.
     * frame: { fill: 'white', stroke: 'black' }
     */
    frame: false,

    /*
     * if set to true, the frame border is drawn separately above
     * the other chart elements
     */
    frameStrokeOnTop: false,

    /*
     * probably deprecated
     */
    yTicks: false,


    hover: true,
    tooltip: true,

    hpadding: 0,
    vpadding: 10,

    /*
     * some chart types (line chart) go into a 'compact'
     * mode if the chart width is below this value
     */
    minWidth: 100,

    /*
     * theme locale, probably unused
     */
    locale: 'de_DE',

    /*
     * duration for animated transitions (ms)
     */
    duration: 1000,

    /*
     * easing for animated transitions
     */
     easing: 'expoInOut'

};

}).call(this);