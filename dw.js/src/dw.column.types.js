
dw.column.types = {};


dw.column.types.text = function() {
    return {
        parse: _.identity,
        errors: function() { return 0; },
        name: function() { return 'text'; },
        formatter: function() { return _.identity; },
        isValid: function() { return true; }
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
            if (_.isNumber(raw) || _.isUndefined(raw) || _.isNull(raw)) return raw;
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
                if (div !== 0) val = Number(val) / Math.pow(10, div);
                if (format != '-') {
                    if (round || val == Math.round(val)) format = format.substr(0,1)+'0';
                    val = Globalize.format(val, format);
                } else if (div !== 0) {
                    val = val.toFixed(1);
                }
                return full ? prepend + val + append : val;
            };
        },

        isValid: function(val) {
            return val === "" || naStrings[String(val).toLowerCase()] || _.isNumber(type.parse(val));
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
            'YYYY': {
                regex: /^ *((?:1[7-9]|20)[0-9]{2}) *$/,
                precision: 'year'
            },
            'YYYY-H': {
                regex: /^ *([12][0-9]{3})[ \-\/]?H([12]) *$/,
                precision: 'half'
            },
            'H-YYYY': {
                regex: /^ *H([12])[ \-\/]([12][0-9]{3}) *$/,
                precision: 'half'
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
                regex: /^ *(0?[1-9]|1[0-2])([-\/] ?)(0?[1-9]|[1-2][0-9]|3[01])\2([12][0-9]{3})$/,
                precision: 'day'
            },
            'DD.MM.YYYY': {
                regex: /^ *(0?[1-9]|[1-2][0-9]|3[01])([-\.\/ ?])(0?[1-9]|1[0-2])\2([12][0-9]{3})$/,
                precision: 'day'
            },
            'YYYY-MM-DD': {
                regex: /^ *([12][0-9]{3})([-\/\. ?])(0?[1-9]|1[0-2])\2(0?[1-9]|[1-2][0-9]|3[01])$/,
                precision: 'day'
            },
            // dates with a time
            'MM/DD/YYYY HH:MM': {
                regex: /^ *(0?[1-9]|1[0-2])([-\/] ?)(0?[1-9]|[1-2][0-9]|3[01])\2([12][0-9]{3}) *[ \-\|] *(0?[0-9]|1[0-9]|2[0-3]):([0-5][0-9]) *$/,
                precision: 'day-minutes'
            },
            'DD.MM.YYYY HH:MM': {
                regex: /^ *(0?[1-9]|[1-2][0-9]|3[01])([-\.\/ ?])(0?[1-9]|1[0-2])\2([12][0-9]{3}) *[ \-\|] *(0?[0-9]|1[0-9]|2[0-3]):([0-5][0-9]) *$/,
                precision: 'day-minutes'
            },
            'YYYY-MM-DD HH:MM': {
                regex: /^ *([12][0-9]{3})([-\/\. ?])(0?[1-9]|1[0-2])\2(0?[1-9]|[1-2][0-9]|3[01]) *[ \-\|] *(0?[0-9]|1[0-9]|2[0-3]):([0-5][0-9]) *$/,
                precision: 'day-minutes'
            },
            // dates with a time
            'MM/DD/YYYY HH:MM:SS': {
                regex: /^ *(0?[1-9]|1[0-2])([-\/] ?)(0?[1-9]|[1-2][0-9]|3[01])\2([12][0-9]{3}) *[ \-\|] *(0?[0-9]|1[0-9]|2[0-3]):([0-5][0-9])(?::([0-5][0-9]))? *$/,
                precision: 'day-seconds'
            },
            'DD.MM.YYYY HH:MM:SS': {
                regex: /^ *(0?[1-9]|[1-2][0-9]|3[01])([-\.\/ ?])(0?[1-9]|1[0-2])\2([12][0-9]{3}) *[ \-\|] *(0?[0-9]|1[0-9]|2[0-3]):([0-5][0-9])(?::([0-5][0-9]))? *$/,
                precision: 'day-seconds'
            },
            'YYYY-MM-DD HH:MM:SS': {
                regex: /^ *([12][0-9]{3})([-\/\. ?])(0?[1-9]|1[0-2])\2(0?[1-9]|[1-2][0-9]|3[01]) *[ \-\|] *(0?[0-9]|1[0-9]|2[0-3]):([0-5][0-9])(?::([0-5][0-9]))? *$/,
                precision: 'day-seconds'
            },
            // globalize
            'globalize-MMMM': { test: testGlobalize, precision: 'month' },
            'globalize-MMM': { test: testGlobalize, precision: 'month' },
            'globalize-MMM yyyy': { test: testGlobalize, precision: 'month' },
            'globalize-MMM yy': { test: testGlobalize, precision: 'month' },
            'globalize-MMMM yy': { test: testGlobalize, precision: 'month' },
            'globalize-dddd': { test: testGlobalize, precision: 'day' },
            'globalize-ddd': { test: testGlobalize, precision: 'day' },
            'globalize': {
                test: function(s) { return _.isDate(Globalize.parseDate(s)); },
                precision: 'day'
            }
        };

    function testGlobalize(raw, fmt) {
        return _.isDate(Globalize.parseDate(raw, fmt.substr(10)));
    }


    sample = sample || [];

    _.each(sample, function(n) {
        _.each(knownFormats, function(format, key) {
            if (matches[key] === undefined) matches[key] = 0;
            if ((format.regex && format.regex.test(n)) || (format.test && format.test(n, key))) {
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

            var m;
            if (knownFormats[format].regex) {
                m = raw.match(knownFormats[format].regex);
            } else {
                m = knownFormats[format].test(raw, format);
            }

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
                case 'YYYY-MM-DD': return new Date(m[1], (m[3]-1), m[4]);
                case 'DD.MM.YYYY': return new Date(m[4], (m[3]-1), m[1]);
                case 'MM/DD/YYYY': return new Date(m[4], (m[1]-1), m[3]);
                case 'YYYY-MM-DD HH:MM': return new Date(m[1], (m[3]-1), m[4], m[5] || 0, m[6] || 0, 0);
                case 'DD.MM.YYYY HH:MM': return new Date(m[4], (m[3]-1), m[1], m[5] || 0, m[6] || 0, 0);
                case 'MM/DD/YYYY HH:MM': return new Date(m[4], (m[1]-1), m[3], m[5] || 0, m[6] || 0, 0);
                case 'YYYY-MM-DD HH:MM:SS': return new Date(m[1], (m[3]-1), m[4], m[5] || 0, m[6] || 0, m[7] || 0);
                case 'DD.MM.YYYY HH:MM:SS': return new Date(m[4], (m[3]-1), m[1], m[5] || 0, m[6] || 0, m[7] || 0);
                case 'MM/DD/YYYY HH:MM:SS': return new Date(m[4], (m[1]-1), m[3], m[5] || 0, m[6] || 0, m[7] || 0);
                case 'globalize': return m ? Globalize.parseDate(raw) : raw;
            }
            if (format.substr(0, 10) == 'globalize-') {
                m = Globalize.parseDate(raw, format.substr(10));
                if (_.isDate(m)) return m;
            }
            errors++;
            return raw;
        },
        toNum: function(d) { return d.getTime(); },
        fromNum: function(i) { return new Date(i); },
        errors: function() { return errors; },
        name: function() { return 'date'; },
        format: function() { return format; },
        precision: function() { return knownFormats[format].precision; },

        // returns a function for formatting numbers
        formatter: function(config) {
            if (!format) return _.identity;
            switch (knownFormats[format].precision) {
                case 'year': return function(d) { return !_.isDate(d) ? d : d.getFullYear(); };
                case 'half': return function(d) { return !_.isDate(d) ? d : d.getFullYear() + ' H'+(d.getMonth()/6 + 1); };
                case 'quarter': return function(d) { return !_.isDate(d) ? d : d.getFullYear() + ' Q'+(d.getMonth()/3 + 1); };
                case 'month': return function(d) { return !_.isDate(d) ? d : Globalize.format(d, 'MMM yy'); };
                case 'day': return function(d) { return !_.isDate(d) ? d : Globalize.format(d, 'd'); };
                case 'day-minutes': return function(d) { return !_.isDate(d) ? d : Globalize.format(d, 'M')+' - '+ Globalize.format(d, 't'); };
                case 'day-seconds': return function(d) { return !_.isDate(d) ? d : Globalize.format(d, 'T'); };
            }
        },

        isValid: function(val) {
            return _.isDate(type.parse(val));
        }
    };
    return type;
};
