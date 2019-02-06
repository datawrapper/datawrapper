/* global Globalize */
/* eslint no-irregular-whitespace: "off", no-console: "off" */
import _each from 'underscore-es/each';
import _isNumber from 'underscore-es/isNumber';
import _isString from 'underscore-es/isString';
import _isUndefined from 'underscore-es/isUndefined';
import _isDate from 'underscore-es/isDate';
import _isNull from 'underscore-es/isNull';
import _flatten from 'underscore-es/flatten';
import _values from 'underscore-es/values';
import _isRegExp from 'underscore-es/isRegExp';
import equalish from '../../shared/equalish';

const columnTypes = {};

const _identity = d => d;

columnTypes.text = function() {
    return {
        parse: _identity,
        errors: function() {
            return 0;
        },
        name: function() {
            return 'text';
        },
        formatter: function() {
            return _identity;
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
columnTypes.number = function(sample) {
    function signDigitsDecimalPlaces(num, sig) {
        if (num === 0) return 0;
        return Math.round(sig - Math.ceil(Math.log(Math.abs(num)) / Math.LN10));
    }

    var format;
    var errors = 0;

    var knownFormats = {
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
    };
    var formatLabels = {
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
    };

    // a list of strings that are recognized as 'not available'

    var naStrings = {
        na: 1,
        'n/a': 1,
        '-': 1,
        ':': 1
    };

    var matches = {};
    var bestMatch = ['-.', 0];

    sample = sample || [];

    _each(sample, function(n) {
        _each(knownFormats, function(regex, fmt) {
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
            if (_isNumber(raw) || _isUndefined(raw) || _isNull(raw)) return raw;
            // replace percent sign, n-dash & m-dash
            var number = raw
                .replace('%', '')
                .replace('−', '-')
                .replace('–', '-')
                .replace('—', '-');
            // normalize number
            if (format[0] !== '-') {
                // remove kilo seperator
                number = number.replace(new RegExp(format[0] === '.' ? '\\.' : format[0], 'g'), '');
            }
            if (format[1] !== '.') {
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
            var format = config['number-format'] || '-';
            var div = Number(config['number-divisor'] || 0);
            var append = (config['number-append'] || '').replace(/ /g, '\u00A0');
            var prepend = (config['number-prepend'] || '').replace(/ /g, '\u00A0');
            return function(val, full, round) {
                if (isNaN(val)) return val;
                var _fmt = format;
                if (div !== 0 && _fmt === '-') _fmt = 'n1';
                if (div !== 0) val = Number(val) / Math.pow(10, div);
                if (_fmt.substr(0, 1) === 's') {
                    // significant figures
                    var sig = +_fmt.substr(1);
                    _fmt = 'n' + Math.max(0, signDigitsDecimalPlaces(val, sig));
                }
                if (round) _fmt = 'n0';
                if (_fmt === '-') {
                    // guess number format based on single number
                    _fmt = equalish(val, Math.round(val))
                        ? 'n0'
                        : equalish(val, Math.round(val * 10) * 0.1)
                        ? 'n1'
                        : equalish(val, Math.round(val * 100) * 0.01)
                        ? 'n2'
                        : equalish(val, Math.round(val * 1000) * 0.001)
                        ? 'n3'
                        : equalish(val, Math.round(val * 10000) * 0.0001)
                        ? 'n4'
                        : equalish(val, Math.round(val * 100000) * 0.00001)
                        ? 'n5'
                        : 'n6';
                }
                val = Globalize.format(val, _fmt !== '-' ? _fmt : null);
                return full ? prepend + val + append : val;
            };
        },

        isValid: function(val) {
            return val === '' || naStrings[String(val).toLowerCase()] || _isNumber(type.parse(val));
        },

        ambiguousFormats: function() {
            var candidates = [];
            _each(matches, function(cnt, fmt) {
                if (cnt === bestMatch[1]) {
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
columnTypes.date = (function() {
    var begin = /^ */.source;

    var end = /[*']* *$/.source;

    var s0 = /[ \-/.]?/.source;
    // optional separator

    var s1 = /[ \-/.]/.source;
    // mandatory separator

    var s2 = /[ \-/.,]/.source;
    // mandatory separator

    var s3 = /[ \-|T]/.source;
    // mandatory separator

    var rx = {
        YY: { parse: /['’‘]?(\d{2})/ },
        YYYY: { test: /([12]\d{3})/, parse: /(\d{4})/ },
        YYYY2: { test: /(?:1[7-9]|20)\d{2}/, parse: /(\d{4})/ },
        H: { parse: /h([12])/ },
        Q: { parse: /q([1234])/ },
        W: { parse: /w([0-5]?[0-9])/ },
        Mm: { test: /m?(0?[1-9]|1[0-2])/, parse: /m?(0?[1-9]|1[0-2])/ },
        MM: { test: /(0?[1-9]|1[0-2])/, parse: /(0?[1-9]|1[0-2])/ },
        DD: { parse: /(0?[1-9]|[1-2][0-9]|3[01])/ },
        DOW: { parse: /([0-7])/ },
        HHMM: { parse: /(0?\d|1\d|2[0-3]):([0-5]\d)(?::([0-5]\d))? *(am|pm)?/ }
    };

    var MONTHS = {
        // feel free to add more localized month names
        0: [
            'jan',
            'january',
            'januar',
            'jänner',
            'jän',
            'janv',
            'janvier',
            'ene',
            'enero',
            'gen',
            'gennaio',
            'janeiro'
        ],
        1: [
            'feb',
            'february',
            'febr',
            'februar',
            'fév',
            'févr',
            'février',
            'febrero',
            'febbraio',
            'fev',
            'fevereiro'
        ],
        2: ['mar', 'mär', 'march', 'mrz', 'märz', 'mars', 'mars', 'marzo', 'marzo', 'março'],
        3: ['apr', 'april', 'apr', 'april', 'avr', 'avril', 'abr', 'abril', 'aprile'],
        4: ['may', 'mai', 'mayo', 'mag', 'maggio', 'maio', 'maj'],
        5: ['jun', 'june', 'juni', 'juin', 'junio', 'giu', 'giugno', 'junho'],
        6: ['jul', 'july', 'juli', 'juil', 'juillet', 'julio', 'lug', 'luglio', 'julho'],
        7: ['aug', 'august', 'août', 'ago', 'agosto'],
        8: ['sep', 'september', 'sept', 'septembre', 'septiembre', 'set', 'settembre', 'setembro'],
        9: [
            'oct',
            'october',
            'okt',
            'oktober',
            'octobre',
            'octubre',
            'ott',
            'ottobre',
            'out',
            'outubro'
        ],
        10: ['nov', 'november', 'november', 'novembre', 'noviembre', 'novembre', 'novembro'],
        11: [
            'dec',
            'december',
            'dez',
            'des',
            'dezember',
            'déc',
            'décembre',
            'dic',
            'diciembre',
            'dicembre',
            'desember',
            'dezembro'
        ]
    };
    var MMM_key = {};

    _each(MONTHS, function(abbr, m) {
        _each(abbr, function(a) {
            MMM_key[a] = m;
        });
    });

    rx.MMM = { parse: new RegExp('(' + _flatten(_values(MONTHS)).join('|') + ')') };

    _each(rx, function(r) {
        r.parse = r.parse.source;
        if (_isRegExp(r.test)) r.test = r.test.source;
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
            test: reg(rx.YYYY.test, s0, rx.Mm.test),
            parse: reg(rx.YYYY.parse, s0, rx.Mm.parse),
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
            parse: reg(
                rx.MM.parse,
                '([\\-\\/])',
                rx.DD.parse,
                '\\2',
                rx.YYYY.parse,
                s3,
                rx.HHMM.parse
            ),
            precision: 'day-minutes'
        },
        'DD.MM.YYYY HH:MM': {
            test: reg(
                rx.DD.test,
                '([\\-\\.\\/ ?])',
                rx.MM.test,
                '\\2',
                rx.YYYY.test,
                s3,
                rx.HHMM.test
            ),
            parse: reg(
                rx.DD.parse,
                '([\\-\\.\\/ ?])',
                rx.MM.parse,
                '\\2',
                rx.YYYY.parse,
                s3,
                rx.HHMM.parse
            ),
            precision: 'day-minutes'
        },
        'YYYY-MM-DD HH:MM': {
            test: reg(
                rx.YYYY.test,
                '([\\-\\.\\/ ?])',
                rx.MM.test,
                '\\2',
                rx.DD.test,
                s3,
                rx.HHMM.test
            ),
            parse: reg(
                rx.YYYY.parse,
                '([\\-\\.\\/ ?])',
                rx.MM.parse,
                '\\2',
                rx.DD.parse,
                s3,
                rx.HHMM.parse
            ),
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
        if (_isRegExp(fmt.test)) {
            return fmt.test.test(str);
        } else {
            return fmt.test(str, key);
        }
    }

    function parse(str, key) {
        var fmt = knownFormats[key];
        if (_isRegExp(fmt.parse)) {
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
        var d = date.getUTCDay();
        var t = new Date(date.valueOf());
        t.setDate(t.getDate() - ((d + 6) % 7) + 3);
        var iso_year = t.getUTCFullYear();
        var w = Math.floor((t.getTime() - new Date(iso_year, 0, 1, -6)) / 864e5);
        return [iso_year, 1 + Math.floor(w / 7), d > 0 ? d : 7];
    }

    function hour(hr, amPm) {
        if (hr !== 12) return hr + (amPm === 'pm' ? 12 : 0);
        return amPm === 'am' ? 0 : 12;
    }

    return function(sample) {
        var format;
        var errors = 0;

        var matches = {};
        var bestMatch = ['', 0];

        sample = sample || [];

        _each(knownFormats, function(format, key) {
            _each(sample, function(n) {
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
                if (_isDate(raw) || _isUndefined(raw)) return raw;
                if (!format || !_isString(raw)) {
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
                    if (yr < 20) return 2000 + yr;
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
                        return new Date(
                            +m[1],
                            m[3] - 1,
                            +m[4],
                            hour(+m[5], m[8]),
                            +m[6] || 0,
                            +m[7] || 0
                        );
                    case 'DD.MM.YYYY HH:MM':
                        return new Date(
                            +m[4],
                            m[3] - 1,
                            +m[1],
                            hour(+m[5], m[8]),
                            +m[6] || 0,
                            +m[7] || 0
                        );
                    case 'MM/DD/YYYY HH:MM':
                        return new Date(
                            +m[4],
                            m[1] - 1,
                            +m[3],
                            hour(+m[5], m[8]),
                            +m[6] || 0,
                            +m[7] || 0
                        );

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
            formatter: function() {
                if (!format) return _identity;
                var M_pattern = Globalize.culture().calendar.patterns.M.replace('MMMM', 'MMM');
                switch (knownFormats[format].precision) {
                    case 'year':
                        return function(d) {
                            return !_isDate(d) ? d : d.getFullYear();
                        };
                    case 'half':
                        return function(d) {
                            return !_isDate(d)
                                ? d
                                : d.getFullYear() + ' H' + (d.getMonth() / 6 + 1);
                        };
                    case 'quarter':
                        return function(d) {
                            return !_isDate(d)
                                ? d
                                : d.getFullYear() + ' Q' + (d.getMonth() / 3 + 1);
                        };
                    case 'month':
                        return function(d) {
                            return !_isDate(d) ? d : Globalize.format(d, 'MMM yy');
                        };
                    case 'week':
                        return function(d) {
                            return !_isDate(d)
                                ? d
                                : dateToIsoWeek(d)
                                      .slice(0, 2)
                                      .join(' W');
                        };
                    case 'day':
                        return function(d, verbose) {
                            return !_isDate(d) ? d : Globalize.format(d, verbose ? 'D' : 'd');
                        };
                    case 'day-minutes':
                        return function(d) {
                            return !_isDate(d)
                                ? d
                                : Globalize.format(d, M_pattern).replace(' ', '&nbsp;') +
                                      ' - ' +
                                      Globalize.format(d, 't').replace(' ', '&nbsp;');
                        };
                    case 'day-seconds':
                        return function(d) {
                            return !_isDate(d)
                                ? d
                                : Globalize.format(d, 'T').replace(' ', '&nbsp;');
                        };
                }
            },

            isValid: function(val) {
                return _isDate(type.parse(val));
            },

            ambiguousFormats: function() {
                var candidates = [];
                _each(matches, function(cnt, fmt) {
                    if (cnt === bestMatch[1]) {
                        candidates.push([fmt, fmt]); // key, label
                    }
                });
                return candidates;
            }
        };
        return type;
    };
})();

export default columnTypes;
