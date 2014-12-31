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
