/*! datawrapper - v1.24.0 *///
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
            origColumns.push(column);
            return dataset;
        },

        reset: function() {
            columns = origColumns.slice(0);
            columnsByName = {};
            _.each(columns, function(col) {
                columnsByName[col.name()] = col;
            });
            return dataset;
        },

        limitRows: function(numRows) {
            _.each(columns, function(col) {
                col.limitRows(numRows);
            });
            return dataset;
        },

        limitColumns: function(numCols) {
            if (columns.length > numCols) {
                columns.length = numCols;
                origColumns.length = numCols;
            }
            return dataset;
        },

        columnOrder: function(sortOrder) {
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

    };
    return dataset;
};


/**
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
    function notEmpty(d) {
        return d !== null && d !== undefined && d !== '';
    }

    function guessType(sample) {
        if (_.every(rows, _.isNumber)) return dw.column.types.number();
        if (_.every(rows, _.isDate)) return dw.column.types.date();
        // guessing column type by counting parsing errors
        // for every known type
        var types = [dw.column.types.date(sample), dw.column.types.number(sample), dw.column.types.text()];
        var type;
        var k = rows.filter(notEmpty).length;
        var tolerance = 0.1; // allowing 10% mis-parsed values
        var maxAllowedAbsError = 1; // allowing 1 mis-parsed value

        _.each(rows, function(val) {
            _.each(types, function(t) {
                t.parse(val);
            });
        });
        _.every(types, function(t) {
            if (t.errors() / k < tolerance || t.errors() <= maxAllowedAbsError) type = t;
            return !type;
        });
        if (_.isUndefined(type)) type = types[2]; // default to text;
        return type;
    }

    // we pick random 200 non-empty values for column type testing
    var sample = _.shuffle(_.range(rows.length))
        .filter(function(i) {
            return notEmpty(rows[i]);
        })
        .slice(0, 200)
        .map(function(i) {
            return rows[i];
        });

    type = type ? dw.column.types[type](sample) : guessType(sample);

    var range;
    var total;
    var origRows = rows.slice(0);
    var title;

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
            r = _.map(r, function(d) {
                return dw.utils.purifyHtml(d);
            });
            return _.map(r, type.parse);
        },

        /**
         * apply function to each value
         */
        each: function(f) {
            for (var i = 0; i < rows.length; i++) {
                f(column.val(i), i);
            }
        },

        // access to raw values
        raw: function(i, val) {
            if (!arguments.length) return rows;
            if (arguments.length === 2) {
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
                    throw new Error('unknown column type: ' + o);
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
            return name + ' (' + type.name() + ')';
        },

        indexOf: function(val) {
            return _.find(_.range(rows.length), function(i) {
                return column.val(i) === val;
            });
        },

        limitRows: function(numRows) {
            if (origRows.length > numRows) {
                origRows.length = numRows;
                rows.length = numRows;
                column.length = numRows;
            }
        }
    };
    return column;
};

/* eslint no-irregular-whitespace: "off"*/
dw.column.types = {};

dw.column.types.text = function() {
    return {
        parse: _.identity,
        errors: function() {
            return 0;
        },
        name: function() {
            return 'text';
        },
        formatter: function() {
            return _.identity;
        },
        isValid: function() {
            return true;
        },
        format: function() {}
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
        return Math.round(sig - Math.ceil(Math.log(Math.abs(num)) / Math.LN10));
    }
    var format,
        errors = 0,
        knownFormats = {
            '-.': /^ *[-–—−]?[0-9]*(\.[0-9]+)?(e[+-][0-9]+)?%? *$/,
            '-,': /^ *[-–—−]?[0-9]*(,[0-9]+)?%? *$/,
            ',.': /^ *[-–—−]?[0-9]{1,3}(,[0-9]{3})*(\.[0-9]+)?%? *$/,
            '.,': /^ *[-–—−]?[0-9]{1,3}(\.[0-9]{3})*(,[0-9]+)?%? *$/,
            ' .': /^ *[-–—−]?[0-9]{1,3}( [0-9]{3})*(\.[0-9]+)?%? *$/,
            ' ,': /^ *[-–—−]?[0-9]{1,3}( [0-9]{3})*(,[0-9]+)?%? *$/,
            // thin spaces
            ' .': /^ *[-–—−]?[0-9]{1,3}( [0-9]{3})*(\.[0-9]+)?%? *$/,
            ' ,': /^ *[-–—−]?[0-9]{1,3}( [0-9]{3})*(,[0-9]+)?%? *$/,
            // excel sometimes produces a strange white-space:
            ' .': /^ *[-–—−]?[0-9]{1,3}( [0-9]{3})*(\.[0-9]+)?%? *$/,
            ' ,': /^ *[-–—−]?[0-9]{1,3}( [0-9]{3})*(,[0-9]+)?%? *$/,
            "'.": /^ *[-–—−]?[0-9]{1,3}('[0-9]{3})*(\.[0-9]+)?%? *$/
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
            ' ,': '1 234,56',
            ' .': '1 234.56',
            ' ,': '1 234,56'
        },
        // a list of strings that are recognized as 'not available'
        naStrings = {
            na: 1,
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
            var number = raw
                .replace('%', '')
                .replace('−', '-')
                .replace('–', '-')
                .replace('—', '-');
            // normalize number
            if (format[0] != '-') {
                // remove kilo seperator
                number = number.replace(new RegExp(format[0] == '.' ? '\\.' : format[0], 'g'), '');
            }
            if (format[1] != '.') {
                // replace decimal char w/ point
                number = number.replace(format[1], '.');
            }
            if (isNaN(number) || number === '') {
                if (!naStrings[number.toLowerCase()] && number !== '') errors++;
                return raw;
            }
            return Number(number);
        },
        toNum: function(i) {
            return i;
        },
        fromNum: function(i) {
            return i;
        },
        errors: function() {
            return errors;
        },
        name: function() {
            return 'number';
        },

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
                if (_fmt.substr(0, 1) == 's') {
                    // significant figures
                    var sig = +_fmt.substr(1);
                    _fmt = 'n' + Math.max(0, signDigitsDecimalPlaces(val, sig));
                }
                if (round) _fmt = 'n0';
                if (_fmt == '-') {
                    // guess number format based on single number
                    _fmt = dw.utils.equalish(val, Math.round(val))
                        ? 'n0'
                        : dw.utils.equalish(val, Math.round(val * 10) * 0.1)
                        ? 'n1'
                        : dw.utils.equalish(val, Math.round(val * 100) * 0.01)
                        ? 'n2'
                        : dw.utils.equalish(val, Math.round(val * 1000) * 0.001)
                        ? 'n3'
                        : dw.utils.equalish(val, Math.round(val * 10000) * 0.0001)
                        ? 'n4'
                        : dw.utils.equalish(val, Math.round(val * 100000) * 0.00001)
                        ? 'n5'
                        : 'n6';
                }
                val = Globalize.format(val, _fmt != '-' ? _fmt : null);
                if (prepend.indexOf('{+/-}') > -1) {
                    var testVal = Number(val.replace(/[^\d-]/g, ''));
                    if (testVal < 0) {
                        val = val.replace('-', '');
                        prepend = prepend.replace('{+/-}', '-');
                    } else if (testVal > 0) {
                        prepend = prepend.replace('{+/-}', '+');
                    } else {
                        prepend = prepend.replace('{+/-}', '');
                    }
                }

                return full ? prepend + val + append : val;
            };
        },

        isValid: function(val) {
            return val === '' || naStrings[String(val).toLowerCase()] || _.isNumber(type.parse(val));
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
dw.column.types.date = (function() {
    var begin = /^ */.source,
        end = /[\*']* *$/.source,
        s0 = /[ \-\/\.]?/.source, // optional separator
        s1 = /[ \-\/\.]/.source, // mandatory separator
        s2 = /[ \-\/\.,]/.source, // mandatory separator
        s3 = /[ \-\|T]/.source, // mandatory separator
        sM = /[ \-\/\.m]/.source, // manadatory separator, can be "M"
        rx = {
            YY: { parse: /['’‘]?(\d{2})/ },
            YYYY: { test: /([12]\d{3})/, parse: /(\d{4})/ },
            YYYY2: { test: /(?:1[7-9]|20)\d{2}/, parse: /(\d{4})/ },
            H: { parse: /h([12])/ },
            Q: { parse: /q([1234])/ },
            W: { parse: /w([0-5]?[0-9])/ },
            MM: { test: /(0?[1-9]|1[0-2])/, parse: /(0?[1-9]|1[0-2])/ },
            DD: { parse: /(0?[1-9]|[1-2][0-9]|3[01])/ },
            DOW: { parse: /([0-7])/ },
            HHMM: { parse: /(0?\d|1\d|2[0-3]):([0-5]\d)(?::([0-5]\d))? *(am|pm)?/ }
        };
    ('2001M2');
    var MONTHS = {
            // feel free to add more localized month names
            0: ['jan', 'january', 'januar', 'jänner', 'jän', 'janv', 'janvier', 'ene', 'enero', 'gen', 'gennaio', 'janeiro'],
            1: ['feb', 'february', 'febr', 'februar', 'fév', 'févr', 'février', 'febrero', 'febbraio', 'fev', 'fevereiro'],
            2: ['mar', 'mär', 'march', 'mrz', 'märz', 'mars', 'mars', 'marzo', 'marzo', 'março'],
            3: ['apr', 'april', 'apr', 'april', 'avr', 'avril', 'abr', 'abril', 'aprile'],
            4: ['may', 'mai', 'mayo', 'mag', 'maggio', 'maio', 'maj'],
            5: ['jun', 'june', 'juni', 'juin', 'junio', 'giu', 'giugno', 'junho'],
            6: ['jul', 'july', 'juli', 'juil', 'juillet', 'julio', 'lug', 'luglio', 'julho'],
            7: ['aug', 'august', 'août', 'ago', 'agosto'],
            8: ['sep', 'september', 'sept', 'septembre', 'septiembre', 'set', 'settembre', 'setembro'],
            9: ['oct', 'october', 'okt', 'oktober', 'octobre', 'octubre', 'ott', 'ottobre', 'out', 'outubro'],
            10: ['nov', 'november', 'november', 'novembre', 'noviembre', 'novembre', 'novembro'],
            11: ['dec', 'december', 'dez', 'des', 'dezember', 'déc', 'décembre', 'dic', 'diciembre', 'dicembre', 'desember', 'dezembro']
        },
        MMM_key = {},
        MMM_reg = [];

    _.each(MONTHS, function(abbr, m) {
        _.each(abbr, function(a) {
            MMM_key[a] = m;
        });
    });

    rx.MMM = { parse: new RegExp('(' + _.flatten(_.values(MONTHS)).join('|') + ')') };

    _.each(rx, function(r, k) {
        r.parse = r.parse.source;
        if (_.isRegExp(r.test)) r.test = r.test.source;
        else r.test = r.parse;
    });

    var knownFormats = {
        // each format has two regex, a strict one for format guessing
        // based on a sample and a lazy one for parsing
        YYYY: {
            test: reg(rx.YYYY2.test),
            parse: reg(rx.YYYY2.parse),
            precision: 'year'
        },
        'YYYY-H': {
            test: reg(rx.YYYY.test, s0, rx.H.test),
            parse: reg(rx.YYYY.parse, s0, rx.H.parse),
            precision: 'half'
        },
        'H-YYYY': {
            test: reg(rx.H.test, s1, rx.YYYY.test),
            parse: reg(rx.H.parse, s1, rx.YYYY.parse),
            precision: 'half'
        },
        'YYYY-Q': {
            test: reg(rx.YYYY.test, s0, rx.Q.test),
            parse: reg(rx.YYYY.parse, s0, rx.Q.parse),
            precision: 'quarter'
        },
        'Q-YYYY': {
            test: reg(rx.Q.test, s1, rx.YYYY.test),
            parse: reg(rx.Q.parse, s1, rx.YYYY.parse),
            precision: 'quarter'
        },
        'YYYY-M': {
            test: reg(rx.YYYY.test, sM, rx.MM.test),
            parse: reg(rx.YYYY.parse, sM, rx.MM.parse),
            precision: 'month'
        },
        'M-YYYY': {
            test: reg(rx.MM.test, s1, rx.YYYY.test),
            parse: reg(rx.MM.parse, s1, rx.YYYY.parse),
            precision: 'month'
        },
        'YYYY-MMM': {
            test: reg(rx.YYYY.test, s1, rx.MMM.parse),
            parse: reg(rx.YYYY.parse, s1, rx.MMM.parse),
            precision: 'month'
        },
        'MMM-YYYY': {
            test: reg(rx.MMM.parse, s1, rx.YYYY.test),
            parse: reg(rx.MMM.parse, s1, rx.YYYY.parse),
            precision: 'month'
        },
        'MMM-YY': {
            test: reg(rx.MMM.parse, s1, rx.YY.test),
            parse: reg(rx.MMM.parse, s1, rx.YY.parse),
            precision: 'month'
        },
        MMM: {
            test: reg(rx.MMM.parse),
            parse: reg(rx.MMM.parse),
            precision: 'month'
        },
        'YYYY-WW': {
            test: reg(rx.YYYY.test, s0, rx.W.test),
            parse: reg(rx.YYYY.parse, s0, rx.W.parse),
            precision: 'week'
        },
        'WW-YYYY': {
            test: reg(rx.W.test, s1, rx.YYYY.test),
            parse: reg(rx.W.parse, s1, rx.YYYY.parse),
            precision: 'week'
        },
        'MM/DD/YYYY': {
            test: reg(rx.MM.test, '([\\-\\/])', rx.DD.test, '\\2', rx.YYYY.test),
            parse: reg(rx.MM.parse, '([\\-\\/])', rx.DD.parse, '\\2', rx.YYYY.parse),
            precision: 'day'
        },
        'DD/MM/YYYY': {
            test: reg(rx.DD.test, '([\\-\\.\\/ ?])', rx.MM.test, '\\2', rx.YYYY.test),
            parse: reg(rx.DD.parse, '([\\-\\.\\/ ?])', rx.MM.parse, '\\2', rx.YYYY.parse),
            precision: 'day'
        },
        'DD/MMM/YYYY': {
            test: reg(rx.DD.test, '([\\-\\.\\/ ?])', rx.MMM.test, '\\2', rx.YYYY.test),
            parse: reg(rx.DD.parse, '([\\-\\.\\/ ?])', rx.MMM.parse, '\\2', rx.YYYY.parse),
            precision: 'day'
        },
        'DD/MMM/YY': {
            test: reg(rx.DD.test, '([\\-\\.\\/ ?])', rx.MMM.test, '\\2', rx.YY.test),
            parse: reg(rx.DD.parse, '([\\-\\.\\/ ?])', rx.MMM.parse, '\\2', rx.YY.parse),
            precision: 'day'
        },
        'YYYY-MM-DD': {
            test: reg(rx.YYYY.test, '([\\-\\.\\/ ?])', rx.MM.test, '\\2', rx.DD.test),
            parse: reg(rx.YYYY.parse, '([\\-\\.\\/ ?])', rx.MM.parse, '\\2', rx.DD.parse),
            precision: 'day'
        },

        'MMM-DD-YYYY': {
            test: reg(rx.MMM.test, s1, rx.DD.test, s2, rx.YYYY.test),
            parse: reg(rx.MMM.parse, s1, rx.DD.parse, s2, rx.YYYY.parse),
            precision: 'day'
        },

        'YYYY-WW-d': {
            // year + ISO week + [day]
            test: reg(rx.YYYY.test, s0, rx.W.test, s1, rx.DOW.test),
            parse: reg(rx.YYYY.parse, s0, rx.W.parse, s1, rx.DOW.parse),
            precision: 'day'
        },

        // dates with a time
        'MM/DD/YYYY HH:MM': {
            test: reg(rx.MM.test, '([\\-\\/])', rx.DD.test, '\\2', rx.YYYY.test, s3, rx.HHMM.test),
            parse: reg(rx.MM.parse, '([\\-\\/])', rx.DD.parse, '\\2', rx.YYYY.parse, s3, rx.HHMM.parse),
            precision: 'day-minutes'
        },
        'DD.MM.YYYY HH:MM': {
            test: reg(rx.DD.test, '([\\-\\.\\/ ?])', rx.MM.test, '\\2', rx.YYYY.test, s3, rx.HHMM.test),
            parse: reg(rx.DD.parse, '([\\-\\.\\/ ?])', rx.MM.parse, '\\2', rx.YYYY.parse, s3, rx.HHMM.parse),
            precision: 'day-minutes'
        },
        'YYYY-MM-DD HH:MM': {
            test: reg(rx.YYYY.test, '([\\-\\.\\/ ?])', rx.MM.test, '\\2', rx.DD.test, s3, rx.HHMM.test),
            parse: reg(rx.YYYY.parse, '([\\-\\.\\/ ?])', rx.MM.parse, '\\2', rx.DD.parse, s3, rx.HHMM.parse),
            precision: 'day-minutes'
        },
        ISO8601: {
            test: /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/,
            parse: function(str) {
                return str;
            },
            precision: 'day-seconds'
        }
    };

    function reg() {
        return new RegExp(begin + Array.prototype.slice.call(arguments).join(' *') + end, 'i');
    }

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

    function dateFromIsoWeek(year, week, day) {
        var d = new Date(Date.UTC(year, 0, 3));
        d.setUTCDate(3 - d.getUTCDay() + (week - 1) * 7 + parseInt(day, 10));
        return d;
    }

    function dateToIsoWeek(date) {
        var d = date.getUTCDay(),
            t = new Date(date.valueOf());
        t.setDate(t.getDate() - ((d + 6) % 7) + 3);
        var iso_year = t.getUTCFullYear(),
            w = Math.floor((t.getTime() - new Date(iso_year, 0, 1, -6)) / 864e5);
        return [iso_year, 1 + Math.floor(w / 7), d > 0 ? d : 7];
    }

    function hour(hr, amPm) {
        if (hr != 12) return hr + (amPm == 'pm' ? 12 : 0);
        return amPm == 'am' ? 0 : 12;
    }

    return function(sample) {
        var format,
            errors = 0,
            matches = {},
            bestMatch = ['', 0];

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

        // public interface
        var type = {
            parse: function(raw) {
                if (_.isDate(raw) || _.isUndefined(raw)) return raw;
                if (!format || !_.isString(raw)) {
                    errors++;
                    return raw;
                }

                var m = parse(raw.toLowerCase(), format);

                if (!m) {
                    errors++;
                    return raw;
                } else {
                    // increment errors anyway if string doesn't match strict format
                    if (!test(raw, format)) errors++;
                }

                function guessTwoDigitYear(yr) {
                    yr = +yr;
                    if (yr < 30) return 2000 + yr;
                    else return 1900 + yr;
                }

                var curYear = new Date().getFullYear();

                switch (format) {
                    case 'YYYY':
                        return new Date(m[1], 0, 1);
                    case 'YYYY-H':
                        return new Date(m[1], (m[2] - 1) * 6, 1);
                    case 'H-YYYY':
                        return new Date(m[2], (m[1] - 1) * 6, 1);
                    case 'YYYY-Q':
                        return new Date(m[1], (m[2] - 1) * 3, 1);
                    case 'Q-YYYY':
                        return new Date(m[2], (m[1] - 1) * 3, 1);
                    case 'YYYY-M':
                        return new Date(m[1], m[2] - 1, 1);
                    case 'M-YYYY':
                        return new Date(m[2], m[1] - 1, 1);

                    case 'YYYY-MMM':
                        return new Date(+m[1], MMM_key[m[2]], 1);
                    case 'MMM-YYYY':
                        return new Date(+m[2], MMM_key[m[1]], 1);
                    case 'MMM-YY':
                        return new Date(guessTwoDigitYear(+m[2]), MMM_key[m[1]], 1);
                    case 'MMM':
                        return new Date(curYear, MMM_key[m[1]], 1);

                    case 'YYYY-WW':
                        return dateFromIsoWeek(m[1], m[2], 1);
                    case 'WW-YYYY':
                        return dateFromIsoWeek(m[2], m[1], 1);

                    case 'YYYY-WW-d':
                        return dateFromIsoWeek(m[1], m[2], m[3]);
                    case 'YYYY-MM-DD':
                        return new Date(m[1], m[3] - 1, m[4]);
                    case 'DD/MM/YYYY':
                        return new Date(m[4], m[3] - 1, m[1]);
                    case 'DD/MMM/YYYY':
                        return new Date(m[4], MMM_key[m[3]], m[1]);
                    case 'DD/MMM/YY':
                        return new Date(guessTwoDigitYear(m[4]), MMM_key[m[3]], m[1]);
                    case 'MM/DD/YYYY':
                        return new Date(m[4], m[1] - 1, m[3]);
                    case 'MMM-DD-YYYY':
                        return new Date(m[3], MMM_key[m[1]], m[2]);

                    case 'YYYY-MM-DD HH:MM':
                        return new Date(+m[1], m[3] - 1, +m[4], hour(+m[5], m[8]), +m[6] || 0, +m[7] || 0);
                    case 'DD.MM.YYYY HH:MM':
                        return new Date(+m[4], m[3] - 1, +m[1], hour(+m[5], m[8]), +m[6] || 0, +m[7] || 0);
                    case 'MM/DD/YYYY HH:MM':
                        return new Date(+m[4], m[1] - 1, +m[3], hour(+m[5], m[8]), +m[6] || 0, +m[7] || 0);

                    case 'ISO8601':
                        return new Date(m.toUpperCase());

                    default:
                        console.warn('unknown format', format);
                }
                errors++;
                return raw;
            },
            toNum: function(d) {
                return d.getTime();
            },
            fromNum: function(i) {
                return new Date(i);
            },
            errors: function() {
                return errors;
            },
            name: function() {
                return 'date';
            },

            format: function(fmt) {
                if (arguments.length) {
                    format = fmt;
                    return type;
                }
                return format;
            },

            precision: function() {
                return knownFormats[format].precision;
            },

            // returns a function for formatting dates
            formatter: function(config) {
                if (!format) return _.identity;
                var M_pattern = Globalize.culture().calendar.patterns.M.replace('MMMM', 'MMM');
                switch (knownFormats[format].precision) {
                    case 'year':
                        return function(d) {
                            return !_.isDate(d) ? d : d.getFullYear();
                        };
                    case 'half':
                        return function(d) {
                            return !_.isDate(d) ? d : d.getFullYear() + ' H' + (d.getMonth() / 6 + 1);
                        };
                    case 'quarter':
                        return function(d) {
                            return !_.isDate(d) ? d : d.getFullYear() + ' Q' + (d.getMonth() / 3 + 1);
                        };
                    case 'month':
                        return function(d) {
                            return !_.isDate(d) ? d : Globalize.format(d, 'MMM yy');
                        };
                    case 'week':
                        return function(d) {
                            return !_.isDate(d)
                                ? d
                                : dateToIsoWeek(d)
                                      .slice(0, 2)
                                      .join(' W');
                        };
                    case 'day':
                        return function(d, verbose) {
                            return !_.isDate(d) ? d : Globalize.format(d, verbose ? 'D' : 'd');
                        };
                    case 'day-minutes':
                        return function(d) {
                            return !_.isDate(d)
                                ? d
                                : Globalize.format(d, M_pattern).replace(' ', '&nbsp;') + ' - ' + Globalize.format(d, 't').replace(' ', '&nbsp;');
                        };
                    case 'day-seconds':
                        return function(d) {
                            return !_.isDate(d) ? d : Globalize.format(d, 'T').replace(' ', '&nbsp;');
                        };
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
})();


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

/* globals dw,$,_ */

dw.datasource.delimited = function(opts) {
    function loadAndParseCsv() {
        if (opts.url) {
            var host = (window.location.hostname || '').split('.'),
                rootDomain = '';

            if (host.length >= 2) var rootDomain = host[host.length - 2] + '.' + host[host.length - 1];

            return $.ajax({
                url: opts.url + (opts.url.indexOf('?') > -1 ? '&' : '?') + 'v=' + new Date().getTime(),
                method: 'GET',
                dataType: 'text',
                xhrFields: {
                    withCredentials: opts.url.indexOf(rootDomain) > -1
                }
            }).then(function(raw) {
                return new DelimitedParser(opts).parse(raw);
            });
        } else if (opts.csv || opts.csv === '') {
            var dfd = $.Deferred(),
                parsed = dfd.then(function(raw) {
                    return new DelimitedParser(opts).parse(raw);
                });
            dfd.resolve(opts.csv);
            return parsed;
        }
        throw 'you need to provide either an URL or CSV data.';
    }

    return {
        dataset: loadAndParseCsv,
        parse: function() {
            return new DelimitedParser(opts).parse(opts.csv);
        }
    };
};

var DelimitedParser = function(opts) {
    opts = _.extend(
        {
            delimiter: 'auto',
            quoteChar: '"',
            skipRows: 0,
            emptyValue: null,
            transpose: false,
            firstRowIsHeader: true
        },
        opts
    );

    this.__delimiterPatterns = getDelimiterPatterns(opts.delimiter, opts.quoteChar);
    this.opts = opts;
};

function getDelimiterPatterns(delimiter, quoteChar) {
    return new RegExp(
        // Delimiters.
        '(\\' +
            delimiter +
            '|\\r?\\n|\\r|^)' +
            // Quoted fields.
            '(?:' +
            quoteChar +
            '([^' +
            quoteChar +
            ']*(?:' +
            quoteChar +
            '"[^' +
            quoteChar +
            ']*)*)' +
            quoteChar +
            '|' +
            // Standard fields.
            '([^' +
            quoteChar +
            '\\' +
            delimiter +
            '\\r\\n]*))',
        'gi'
    );
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

        data = closure + '\n' + data.replace(/\s+$/g, '') + closure;

        function parseCSV(delimiterPattern, strData, strDelimiter) {
            // implementation and regex borrowed from:
            // http://www.bennadel.com/blog/1504-Ask-Ben-Parsing-CSV-Strings-With-Javascript-Exec-Regular-Expression-Command.htm

            // Check to see if the delimiter is defined. If not,
            // then default to comma.
            strDelimiter = strDelimiter || ',';

            // Create an array to hold our data. Give the array
            // a default empty first row.
            var arrData = [[]];

            // Create an array to hold our individual pattern
            // matching groups.
            var arrMatches = null,
                strMatchedValue;

            // Keep looping over the regular expression matches
            // until we can no longer find a match.
            while ((arrMatches = delimiterPattern.exec(strData))) {
                // Get the delimiter that was found.
                var strMatchedDelimiter = arrMatches[1];

                // Check to see if the given delimiter has a length
                // (is not the start of string) and if it matches
                // field delimiter. If id does not, then we know
                // that this delimiter is a row delimiter.
                if (strMatchedDelimiter.length && strMatchedDelimiter != strDelimiter) {
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
                    strMatchedValue = arrMatches[2].replace(new RegExp('""', 'g'), '"');
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
            return arrData.slice(1);
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
            var i,
                j,
                t = [];
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

            columns = _.map(columns, function(c) {
                return dw.column(c.name, c.data);
            });
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
            if (delimiter == '\t') c *= 1.15;
            if (c > maxMatchCount) {
                maxMatchCount = c;
                k = i;
            }
        });
        return delimiters[k];
    }
}); // end _.extend(DelimitedParser)

/* globals dw,$,_ */

dw.datasource.json = function(opts) {

    function loadAndParseJSON() {
        if (opts.url) {
            // todo fetch
        } else if (opts.csv || opts.json) {
            var dfd = $.Deferred(),
                parsed = dfd.then(function(raw) {
                    return JSON.parse(raw);
                });
            dfd.resolve(opts.csv || opts.json);
            return parsed;
        }
        throw 'you need to provide either an URL or CSV data.';
    }

    return {
        dataset: loadAndParseJSON,
        parse: function() {
            return JSON.parse(opts.csv || opts.json);
        }
    };
};



dw.utils = {
    /* global dw,Globalize,_,$ */

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

    getNonChartHeight: function() {
        var h = 0;

        // IE Fix
        if (!$.support.leadingWhitespace) {
            h += 15;
        }

        $('body > *').each(function(i, el) {
            var t = el.tagName.toLowerCase(),
                cls = $(el).attr('class') || "";

            function hasClass(className) {
                return cls.split(" ").indexOf(className) > -1;
            }

            if (t != 'script' && t != 'style' && el.id != 'chart' &&! $(el).attr('aria-hidden') &&
                !hasClass('tooltip') &&
                !hasClass('vg-tooltip') &&
                !hasClass('hidden') &&
                !hasClass('qtip') &&
                !hasClass('container') &&
                !hasClass('noscript') &&
                !hasClass('hidden') &&
                !hasClass("filter-ui") &&
                !hasClass("dw-chart-body")) {

                h += Number($(el).outerHeight(true));
            }
        });

        function getProp(selector, property) {
            return getComputedStyle($(selector).get(0))[property].replace('px', '')
        }

        var selectors = ["body", "body #chart"],
            properties = ["padding-top", "padding-bottom", "margin-top", "margin-bottom", "border-top-width", "border-bottom-width"];

        selectors.forEach(function(sel) {
            properties.forEach(function(prop) {
                h += Number(getProp(sel, prop));
            });
        });

        return h;
    },

    getMaxChartHeight: function() {
        var maxH = $(window).height() - 8;
        maxH -= dw.utils.getNonChartHeight();
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
            default_allowed = "<a><b><br><br/><i><strong><sup><sub><strike><u><em><tt>";

        function purifyHtml(input, allowed) {
            if (input === null) return null;
            input = String(input);
            // strip tags
            if (input.indexOf('<') < 0 || input.indexOf('>') < 0) {
                return input;
            }
            input = stripTags(input, allowed);
            // remove all event attributes
            if (typeof document == 'undefined') return input;
            var d = document.createElement('div');
            d.innerHTML = input;
            var sel = d.querySelectorAll('*');
            for (var i=0; i<sel.length; i++) {
                if (sel[i].nodeName.toLowerCase() === 'a') {
                    // special treatment for <a> elements
                    if (sel[i].getAttribute('target') !== '_self') sel[i].setAttribute('target', '_blank');
                    sel[i].setAttribute('rel', 'nofollow noopener noreferrer');
                }
                for (var j=0; j<sel[i].attributes.length; j++) {
                    var attrib = sel[i].attributes[j];
                    if (attrib.specified) {
                        if (attrib.name.substr(0,2) == 'on') sel[i].removeAttribute(attrib.name);
                    }
                }
            }
            return d.innerHTML;
        }
        function stripTags(input, allowed) {
            // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
            allowed = (((allowed !== undefined ? allowed || '' : default_allowed) + '').toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('');

            var before = input;
            var after = input;
            // recursively remove tags to ensure that the returned string doesn't contain forbidden tags after previous passes (e.g. '<<bait/>switch/>')
            while (true) {
                before = after;
                after = before.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
                    return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : ''
                })
;                // return once no more tags are removed
                if (before === after) {
                    return after;
                }
            }
        }
        dw.utils.purifyHtml = purifyHtml;
        return purifyHtml(input, allowed);
    },

    /*
     * computes the significant dimensions for a series of number
     * return value can be read as N places after the decimal
     */
    significantDimension: function(values) {
        var result = [], dimension = 0,
            uniqValues = _.uniq(values),
            totalUniq = uniqValues.length,
            check, diff;

        var accepted = Math.floor(totalUniq * 0.8);

        if (uniqValues.length < 3) {
            return Math.round(uniqValues.reduce(function(acc, cur) {
                if (!cur) return acc;
                var exp = Math.log(Math.abs(cur))/Math.LN10;
                if (exp < 8 && exp > -3) {
                    // use tail length for normal numbers
                    return acc + Math.min(3, dw.utils.tailLength(uniqValues[0]));
                } else {
                    return acc + (exp > 0 ? (exp-1)*-1 : (exp)*-1 );
                }
            }, 0) / uniqValues.length);
        }

        if (_.uniq(_.map(uniqValues, round)).length > accepted) {
            // we seem to have enough precision, but maybe it's too much?
            check = function() { return _.uniq(result).length == totalUniq; };
            diff = -1;
        } else {
            // if we end up here it means we're loosing too much information
            // due to rounding, we need to increase precision
            check = function() { return _.uniq(result).length <= accepted; };
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

    /*
     * returns the number of digits after the decimal
     */
    tailLength: function(v) {
        return (String(v - Math.floor(v)).replace(/00000*[0-9]+$/, '').replace(/99999*[0-9]+$/, '')).length - 2;
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
    },

    clone: function(obj) {
        try {
            return JSON.parse(JSON.stringify(obj));
        } catch (e) {}
        return obj;
    },

    equalish: function(a,b) {
        return a-b < 1e-6;
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
                var lbl = column.raw()[i];
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
                var lbl = column.raw()[i];
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

            var fy = $('a:first', div).offset().top + $('a:first', div).height(),   
                ly = $('a:last', div).offset().top + $('a:last', div).height(),
                diff = ly - fy;  

            if (diff > 1) {   
                div.remove();   
                return getFilterUI('select')(vis); // fall back to select
            }

            return div;
        };

        if (type == 'timescale') f = function(vis) {
            var w = Math.min(vis.__w-35);
                timesel = $('<div></div>').css({
                    position:'relative',
                    height: 45,
                    'margin-left': 3
                }).addClass('filter-ui'),
                daysDelta = Math.round((column.val(-1).getTime() - column.val(0).getTime()) / 86400000);

            function getLeft(width, date) {
                var perc = ((column.val(-1).getTime() -
                  date.getTime()) / 86400000) / daysDelta;
  
                return (width * (1-perc));
            }

            var dates = [],
              lastPointLeft = 0,
              lastPoint;

            for (var i=0; i<column.length; i++) {
                var di = $('<div class="point"></div>');
                di.data('row', i);
                di.css('left', getLeft(w, column.val(i)) + "px");
                timesel.append(di);

                var dit = $('<div class="point-label">'
                  + column.raw()[i] + '</div>');
                dit.css('left', getLeft(w, column.val(i)) + "px");
                timesel.append(dit);


                if (i==0) di.addClass('active');

                var left = getLeft(w, column.val(i));
                if (left > lastPointLeft) {
                    lastPoint = di;
                    lastPointLeft = left;
                }
            }

            var offsetRight = lastPointLeft;

            timesel.append('<div class="line"></div>');
            $('.line', timesel).width(offsetRight);

            $('.point', timesel).click(function(e) {
                var a = $(e.target);
                e.preventDefault();
                if (a.hasClass('active')) return;
                $('.point', timesel).removeClass('active');
                a.addClass('active');
                update(a.data('row'));
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
        dataset_change_callbacks = $.Callbacks(),
        locale;

    var _ds;

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
            if (!is_equal(pt[lastKey], value)) {
                pt[lastKey] = value;
                change_callbacks.fire(chart, key, value);
            }
            return this;
        },

        // loads the dataset and returns a deferred
        load: function(csv, externalData) {
            var datasource,
                dsopts = {
                    firstRowIsHeader: chart.get('metadata.data.horizontal-header', true),
                    transpose: chart.get('metadata.data.transpose', false)
                };

            if ((csv || csv === '') && !externalData) dsopts.csv = csv;
            else dsopts.url = externalData || 'data.csv';

            datasource = chart.get('metadata.data.json') ?
                dw.datasource.json(dsopts) :
                dw.datasource.delimited(dsopts);

            return datasource.dataset().pipe(function(ds) {
                chart.dataset(ds);
                dataset_change_callbacks.fire(chart, ds);
                return ds;
            });
        },

        // returns the dataset
        dataset: function(ds) {
            if (arguments.length) {
                if (ds !== true) _ds = ds;
                dataset = chart.get('metadata.data.json') ? _ds :
                    reorderColumns(applyChanges(addComputedColumns(_ds)));
                if (ds === true) return dataset;
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

        locale: function(_locale, callback) {
            if (arguments.length) {
                locale = _locale.replace('_', '-');
                if (window["Globalize"]) {
                    if (Globalize.cultures.hasOwnProperty(locale)) {
                        Globalize.culture(locale);
                        if (typeof callback == "function") callback();
                    } else {
                        $.getScript(
                            "/static/vendor/globalize/cultures/globalize.culture." +
                                locale +
                                ".js",
                            function() {
                                chart.locale(locale);
                                if (typeof callback == "function") callback();
                            }
                        );
                    }
                }
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

        onDatasetChange: dataset_change_callbacks.add,

        columnFormatter: function(column) {
            // pull output config from metadata
            // return column.formatter(config);
            var colFormat = chart.get('metadata.data.column-format', {});
            colFormat = colFormat[column.name()] || { type: 'auto', 'number-format': 'auto'};

            if (column.type() == 'number' && (colFormat == 'auto' || colFormat['number-format'] === undefined || colFormat['number-format'] == 'auto')) {
                var values = column.values();
                var dim = dw.utils.significantDimension(values);
                colFormat['number-divisor'] = 0;
                colFormat['number-format'] = 'n'+Math.max(0, dim);
            }
            return column.type(true).formatter(colFormat);
        },

        dataCellChanged: function(column, row) {
            var changes = chart.get('metadata.data.changes', []),
                transpose = chart.get('metadata.data.transpose', false),
                changed = false;

            _.each(changes, function(change) {
                var r = "row", c = "column";
                if (transpose) {
                    r = "column";
                    c = "row";
                }
                if (column == change[c] && change[r] == row) {
                    changed = true;
                }
            });
            return changed;
        }

    };

    function reorderColumns(dataset) {
        var order = chart.get('metadata.data.column-order', []);
        if (order.length && order.length == dataset.numColumns()) {
            dataset.columnOrder(order);
        }
        return dataset;
    }

    function applyChanges(dataset) {
        var changes = chart.get('metadata.data.changes', []);
        var transpose = chart.get('metadata.data.transpose', false);
        // apply changes
        _.each(changes, function(change) {
            var row = "row", column = "column";
            if (transpose) {
                row = "column";
                column = "row";
            }

            if (dataset.hasColumn(change[column])) {
                if (change[row] === 0) {
                    if (change.previous) {
                        const oldTitle = dataset.column(change[column]).title();
                        if (oldTitle !== change.previous) return;
                    }
                    dataset.column(change[column]).title(change.value);
                } else {
                    if (change.previous) {
                        const curValue = dataset.column(change[column]).raw(change[row] - 1);
                        if (curValue !== change.previous) return;
                    }
                    dataset.column(change[column]).raw(change[row] - 1, change.value);
                }
            }
        });

        // overwrite column types
        var columnFormats = chart.get('metadata.data.column-format', {});
        _.each(columnFormats, function(columnFormat, key) {
            if (columnFormat.type && dataset.hasColumn(key) && columnFormat.type != 'auto') {
                dataset.column(key).type(columnFormat.type);
            }
            if (columnFormat['input-format'] && dataset.hasColumn(key)) {
                dataset.column(key).type(true).format(columnFormat['input-format']);
            }
        });
        return dataset;
    }

    function addComputedColumns(dataset) {
        var v_columns = chart.get('metadata.describe.computed-columns', {}),
            data = dataset.list(),
            columnNameToVar = {},
            col_aggregates = {};

        dataset.eachColumn(function(col) {
            if (col.isComputed) return;
            columnNameToVar[col.name()] = column_name_to_var(col.name());
            if (col.type() == 'number') {
                col_aggregates[col.name()] = {
                    min: d3_min(col.values()),
                    max: d3_max(col.values()),
                    sum: d3_sum(col.values()),
                    mean: d3_mean(col.values()),
                    median: d3_median(col.values())
                };
            }
        });

        _.each(v_columns, add_computed_column);

        return dataset;

        function add_computed_column(formula, name) {
            var datefmt = function(d) { return d.getFullYear()+'-'+left_pad(1+d.getMonth(), 2, 0)+'-'+left_pad(1+d.getDate(), 2, 0); },
                values = data.map(function(row, row_i) {
                    var context = [];
                    context.push('var __row = '+row_i+';');
                    _.each(row, function(val, key) {
                        if (!columnNameToVar[key]) return;
                        context.push('var '+columnNameToVar[key]+' = '+JSON.stringify(val)+';');
                        if (dataset.column(key).type() == 'number') {
                            context.push('var '+columnNameToVar[key]+'__sum = '+col_aggregates[key].sum+';');
                            context.push('var '+columnNameToVar[key]+'__min = '+col_aggregates[key].min+';');
                            context.push('var '+columnNameToVar[key]+'__max = '+col_aggregates[key].max+';');
                            context.push('var '+columnNameToVar[key]+'__mean = '+col_aggregates[key].mean+';');
                            context.push('var '+columnNameToVar[key]+'__median = '+col_aggregates[key].median+';');
                        }
                    });
                    context.push('var max = Math.max, min = Math.min;');
                    // console.log(context.join('\n'));
                    return (function() {
                        try {
                            return eval(this.context.join('\n')+'\n'+formula);
                        } catch (e) {
                            console.warn(e);
                            return 'n/a';
                        }
                    }).call({ context: context });
                }).map(function(v) {
                    if (_.isBoolean(v)) return v ? 'yes' : 'no';
                    if (_.isDate(v)) return datefmt(v);
                    if (_.isNumber(v)) return ''+v;
                    return String(v);
                });
            var v_col = dw.column(name, values);
            v_col.isComputed = true;
            dataset.add(v_col);
        }

        function column_name_to_var(name) {
            // if you change this, change computed-columns.js as well
            return name.toString().toLowerCase()
                .replace(/\s+/g, '_')           // Replace spaces with _
                .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
                .replace(/-/g, '_')             // Replace multiple - with single -
                .replace(/\_\_+/g, '_')         // Replace multiple - with single -
                .replace(/^_+/, '')             // Trim - from start of text
                .replace(/_+$/, '')             // Trim - from end of text
                .replace(/^(\d)/, '_$1')        // If first char is a number, prefix with _
                .replace(/^(abstract|arguments|await|boolean|break|byte|case|catch|char|class|const|continue|debugger|default|delete|do|double|else|enum|eval|export|extends|false|final|finally|float|for|function|goto|if|implements|import|in|instanceof|int|interface|let|long|native|new|null|package|private|protected|public|return|short|static|super|switch|synchronized|this|throw|throws|transient|true|try|typeof|var|void|volatile|while|window|with|yield)$/, '$1_'); // avoid reserved keywords
        }

        function d3_min(array) {
          var i = -1, n = array.length, a, b;
          if (arguments.length === 1) {
            while (++i < n) if ((b = array[i]) != null && b >= b) {
              a = b;
              break;
            }
            while (++i < n) if ((b = array[i]) != null && a > b) a = b;
          }
          return a;
        }
        function d3_max(array) {
          var i = -1, n = array.length, a, b;
          if (arguments.length === 1) {
            while (++i < n) if ((b = array[i]) != null && b >= b) {
              a = b;
              break;
            }
            while (++i < n) if ((b = array[i]) != null && b > a) a = b;
          }
          return a;
        }
        function d3_sum(array) {
            var s = 0, n = array.length, a, i = -1;
            if (arguments.length === 1) {
                while (++i < n) if (d3_numeric(a = +array[i])) s += a;
            }
            return s;
        }
        function d3_mean(array) {
            var s = 0, n = array.length, a, i = -1, j = n;
            while (++i < n) if (d3_numeric(a = d3_number(array[i]))) s += a; else --j;
            if (j) return s / j;
        }
        function d3_median(array) {
            var numbers = [], n = array.length, a, i = -1;
            if (arguments.length === 1) {
                while (++i < n) if (d3_numeric(a = d3_number(array[i]))) numbers.push(a);
            }
            if (numbers.length) return d3_quantile(numbers.sort(d3_ascending), 0.5);
        }
        function d3_quantile(values, p) {
            var H = (values.length - 1) * p + 1, h = Math.floor(H), v = +values[h - 1], e = H - h;
            return e ? v + e * (values[h] - v) : v;
        }
        function d3_number(x) { return x === null ? NaN : +x; }
        function d3_numeric(x) { return !isNaN(x); }
        function d3_ascending(a, b) {
            return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
        }
        function left_pad(s, l, pad) {
            s = String(s);
            while (s.length < l) s = String(pad) + s;
            return s;
        }
    }

    function is_equal(a, b) {
        return JSON.stringify(a) == JSON.stringify(b);
    }

    return chart;
};

dw.visualization = (function() {
    var __vis = {};

    var visualization = function(id) {
        if (!__vis[id]) {
            console.warn('unknown visualization type: ' + id);
            var known = _.keys(__vis);
            if (known.length > 0) console.warn('try one of these instead: ' + known.join(', '));
            return false;
        }
        return new __vis[id]();
    };

    visualization.register = function(id) {
        var parent = arguments.length === 3 ? __vis[arguments[1]].prototype : dw.visualization.base;
        var props = arguments[arguments.length - 1];
        var vis = (__vis[id] = function() {});

        _.extend(vis.prototype, parent, { id: id }, props);
    };

    visualization.has = function(id) {
        return __vis[id] !== undefined;
    };

    return visualization;
})();

// Every visualization must extend this class.
// It provides the basic API between the chart template
// page and the visualization class.

dw.visualization.base = function() {}.prototype;

_.extend(dw.visualization.base, {
    // called before rendering
    __init: function() {
        this.__renderedDfd = $.Deferred();
        this.__rendered = false;
        this.__colors = {};
        this.__callbacks = {};

        if (window.parent && window.parent.postMessage) {
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
        var attrProperties = ['horizontalGrid', 'verticalGrid', 'yAxis', 'xAxis'];
        _.each(attrProperties, function(prop) {
            // convert camel-case to dashes
            if (theme.hasOwnProperty(prop)) {
                for (var key in theme[prop]) {
                    // dasherize
                    var lkey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
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
        return this.chart().get('metadata.visualize' + (str ? '.' + str : ''), _default);
    },

    notify: function(str) {
        if (dw.backend && _.isFunction(dw.backend.notify)) {
            return dw.backend.notify(str);
        } else {
            if (window.parent && window.parent['postMessage']) {
                window.parent.postMessage('notify:' + str, '*');
            } else if (window['console']) {
                // eslint-disable-next-line
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
        var locale = this.meta.locale;
        return locale[str] || str;
    },

    checkBrowserCompatibility: function() {
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
        if (me.dataset.filterColumns) me.dataset.filterColumns(ignore);
        return me;
    },

    axes: function(returnAsColumns, noCache) {
        var me = this;

        if (!noCache && me.__axisCache) {
            return me.__axisCache[returnAsColumns ? 'axesAsColumns' : 'axes'];
        }

        var dataset = me.dataset;
        var usedColumns = {};
        var axes = {};
        var axesDef;
        var axesAsColumns = {};
        var errors = [];

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

        var checked = [];
        // auto-populate remaining axes
        _.each(me.meta.axes, function(axisDef, key) {
            function checkColumn(col) {
                return !usedColumns[col.name()] && _.indexOf(axisDef.accepts, col.type()) >= 0;
            }
            function errMissingColumn() {
                var msg = dw.backend
                    ? dw.backend.messages.insufficientData
                    : 'The visualization needs at least one column of the type %type to populate axis %key';
                errors.push(msg.replace('%type', axisDef.accepts).replace('%key', key));
            }
            function remainingRequiredColumns(accepts) {
                // returns how many required columns there are for the remaining axes
                // either an integer or "multiple" if there's another multi-column axis coming up
                function equalAccepts(a1, a2) {
                    if (typeof a1 === 'undefined' && typeof a2 !== 'undefined') return false;
                    if (typeof a2 === 'undefined' && typeof a1 !== 'undefined') return false;
                    if (a1.length !== a2.length) return false;

                    for (var i = 0; i < a1.length; i++) {
                        if (a2.indexOf(a1[i]) === -1) return false;
                    }
                    return true;
                }

                var res = 0;
                _.each(me.meta.axes, function(axisDef, key) {
                    if (checked.indexOf(key) > -1) return;
                    if (!equalAccepts(axisDef.accepts, accepts)) return;
                    if (typeof res === 'string') return;
                    if (axisDef.optional) return;
                    if (axisDef.multiple) {
                        res = 'multiple';
                        return;
                    }
                    res += 1;
                });
                return res;
            }
            function remainingAvailableColumns(dataset, i) {
                var count = 0;
                dataset.eachColumn(function(c, index) {
                    if (checkColumn(c)) {
                        count++;
                    }
                });
                return count;
            }
            checked.push(key);
            if (axes[key]) return; // user has defined this axis already
            if (!axisDef.optional) {
                // we only populate mandatory axes
                if (!axisDef.multiple) {
                    var accepted = _.filter(dataset.columns(), checkColumn);
                    var firstMatch;
                    if (axisDef.preferred) {
                        // axis defined a regex for testing column names
                        var regex = new RegExp(axisDef.preferred, 'i');
                        firstMatch = _.find(accepted, function(col) {
                            return regex.test(col.name()) || (col.title() !== col.name() && regex.test(col.title()));
                        });
                    }
                    // simply use first colulmn accepted by axis
                    if (!firstMatch) firstMatch = accepted[0];
                    if (firstMatch) {
                        usedColumns[firstMatch.name()] = true; // mark column as used
                        axes[key] = firstMatch.name();
                    } else {
                        // try to auto-populate missing text column
                        if (_.indexOf(axisDef.accepts, 'text') >= 0) {
                            var col = dw.column(
                                key,
                                _.map(_.range(dataset.numRows()), function(i) {
                                    return (i > 25 ? String.fromCharCode(64 + i / 26) : '') + String.fromCharCode(65 + (i % 26));
                                }),
                                'text'
                            );
                            dataset.add(col);
                            me.chart().dataset(dataset);
                            usedColumns[col.name()] = true;
                            axes[key] = col.name();
                        } else {
                            errMissingColumn();
                        }
                    }
                } else {
                    var required = remainingRequiredColumns(axisDef.accepts);
                    var available = remainingAvailableColumns(dataset);

                    // fill axis with all accepted columns
                    axes[key] = [];
                    dataset.eachColumn(function(c) {
                        if (required === 'multiple' && axes[key].length) return;
                        else if (available <= required) return;

                        if (checkColumn(c)) {
                            usedColumns[c.name()] = true;
                            axes[key].push(c.name());
                            available--;
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

        var usedColumnCount = 0;

        for (var columnName in usedColumns) {
            if (usedColumns[columnName]) usedColumnCount++;
        }

        if (usedColumnCount < dataset.numColumns()) {
            var msg =
                'Your dataset contains more columns than the chosen chart type can display. You can switch' +
                ' the column to show in the <b>Refine</b> tab, or choose a different chart type.';
            errors.push(msg);
        }

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

        me.__axisCache = {
            axes: axes,
            axesAsColumns: axesAsColumns
        };

        function columnExists(columns) {
            if (!_.isArray(columns)) columns = [columns];
            for (var i = 0; i < columns.length; i++) {
                if (!dataset.hasColumn(columns[i])) return false;
            }
            return true;
        }

        return me.axes(returnAsColumns);
    },

    keys: function() {
        var me = this;
        var axesDef = me.axes();
        if (axesDef.labels) {
            var lblCol = me.dataset.column(axesDef.labels);
            var fmt = me.chart().columnFormatter(lblCol);
            var keys = [];
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
        $('#chart')
            .html('')
            .off('click')
            .off('mousemove')
            .off('mouseenter')
            .off('mouseover');
        $('.chart .filter-ui').remove();
        $('.chart .legend').remove();
    },

    clear: function() {},

    renderingComplete: function() {
        if (window.parent && window.parent['postMessage']) {
            setTimeout(function() {
                window.parent.postMessage('datawrapper:vis:rendered', '*');
            }, 200);
        }
        this.__renderedDfd.resolve();
        this.__rendered = true;
        this.postRendering();
    },

    postRendering: function() {
        var theme = this.theme();

        function renderWatermark() {
            var text = theme.options.watermark.text || 'CONFIDENTIAL';

            $('.watermark', '#chart').remove();
            $('.dw-chart-body').append('<div class="export-text marker-text watermark noscript"><span>' + text + '</span></div>');
            $('.watermark', '#chart').css('font-size', '6px');

            var $watermark = $('.watermark', '#chart');
            var width = $watermark[0].getBoundingClientRect().width;
            var space = Math.sqrt(Math.pow(window.innerHeight, 2) + Math.pow(window.innerWidth, 2));
            var fontSize = 6 * ((space * 0.7) / width);
            var angle = Math.atan(window.innerHeight / window.innerWidth);
            var transform = 'rotate(' + -angle + 'rad)';

            $watermark.attr('data-rotate', (-1 * angle * 180) / Math.PI).css('font-size', fontSize);

            var height = $watermark[0].getBoundingClientRect().height;
            width = $watermark[0].getBoundingClientRect().width;
            var diffx = (space - width) * Math.cos(angle);
            var diffy = (space - width) * Math.sin(angle);

            $watermark
                .css('transform', transform)
                .css('bottom', -height / 2 + diffy / 2 + 'px')
                .css('left', diffx / 2 + 'px');
        }

        if (this.theme() && this.theme().options && this.theme().options.watermark) {
            renderWatermark();
            $(window)
                .off('resize', renderWatermark)
                .on('resize', renderWatermark);
        }
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
    },

    colorMap: function() {
        var me = this;
        return function(color) {
            me.__colors[color] = 1;
            if (window.__dw && window.__dwColorMap) {
                return window.__dwColorMap(color);
            }
            return color;
        };
    },

    colorsUsed: function() {
        return Object.keys(this.__colors);
    },

    /**
     * register an event listener for custom vis events
     */
    on: function(eventType, callback) {
        if (!this.__callbacks[eventType]) {
            this.__callbacks[eventType] = [];
        }
        this.__callbacks[eventType].push(callback);
    },

    /**
     * fire a custom vis event
     */
    fire: function(eventType, data) {
        if (this.__callbacks[eventType]) {
            this.__callbacks[eventType].forEach(function(cb) {
                if (typeof cb === 'function') cb(data);
            });
        }
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
        palette: ['#6E7DA1', '#64A4C4', '#53CCDD', '#4EF4E8'],

        picker: {
            rowCount: 6,
            controls: {
                hexEditable: true,
                hue: true,
                saturation: true,
                lightness: true
            }
        },

        secondary: [],

        positive: '#85B4D4',
        negative: '#E31A1C',
        neutral: '#CCCCCC',
        // colors background and text needs to be set in CSS as well!
        background: '#ffffff',
        text: '#333333',

        /*
         * gradients that might be used by color gradient selectors
         *
         * Colors from www.ColorBrewer2.org by Cynthia A. Brewer,
         * Geography, Pennsylvania State University.
         */
        gradients: [
            ['#f0f9e8', '#ccebc5', '#a8ddb5', '#7bccc4', '#43a2ca', '#0868ac'], // GnBu
            ['#fefaca', '#008b15'], // simple yellow to green
            ['#feebe2', '#fcc5c0', '#fa9fb5', '#f768a1', '#c51b8a', '#7a0177'], // RdPu
            ['#ffffcc', '#c7e9b4', '#7fcdbb', '#41b6c4', '#2c7fb8', '#253494'], // YlGnbu

            ['#8c510a', '#d8b365', '#f6e8c3', '#f5f7ea', '#c7eae5', '#5ab4ac', '#01665e'], // BrBG
            ['#c51b7d', '#e9a3c9', '#fde0ef', '#faf6ea', '#e6f5d0', '#a1d76a', '#4d9221'], // PiYG
            ['#b2182b', '#ef8a62', '#fddbc7', '#f8f6e9', '#d1e5f0', '#67a9cf', '#2166ac'] // RdBu
            // ['#b35806','#f1a340','#fee0b6','#f7f7f7','#d8daeb','#998ec3','#542788'],  // PuOr
        ],

        /*
         * presets for category colors
         *
         * Colors from www.ColorBrewer2.org by Cynthia A. Brewer,
         * Geography, Pennsylvania State University.
         */
        categories: [
            ['#7fc97f', '#beaed4', '#fdc086', '#ffff99', '#386cb0', '#f0027f', '#bf5b17', '#666666'], // Accent
            ['#fbb4ae', '#b3cde3', '#ccebc5', '#decbe4', '#fed9a6', '#ffffcc', '#e5d8bd', '#fddaec', '#f2f2f2'], // Pastel1
            ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6', '#6a3d9a', '#ffff99', '#b15928'] // Paired
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