import { each, flatten, values, isRegExp, isDate, isUndefined, isString } from 'underscore';

const begin = /^ */.source;
const end = /[*']* *$/.source;
const s0 = /[ \-/.]?/.source; // optional separator
const s1 = /[ \-/.]/.source; // mandatory separator
const s2 = /[ \-/.;,]/.source; // mandatory separator
const s3 = /[ \-|T]/.source; // mandatory separator
const sM = /[ \-/.m]/.source; // mandatory separator
const rx = {
    YY: { parse: /['’‘]?(\d{2})/ },
    YYYY: { test: /([12]\d{3})/, parse: /(\d{4})/ },
    YYYY2: { test: /(?:1[7-9]|20)\d{2}/, parse: /(\d{4})/ },
    H: { parse: /h([12])/ },
    Q: { parse: /q([1234])/ },
    W: { parse: /w([0-5]?[0-9])/ },
    MM: { test: /(0?[1-9]|1[0-2])/, parse: /(0?[1-9]|1[0-2])/ },
    DD: { parse: /(0?[1-9]|[1-2][0-9]|3[01])/ },
    DOW: { parse: /([0-7])/ },
    HHMM: { parse: /(0?\d|1\d|2[0-3]):([0-5]\d)(?::([0-5]\d))? *(AM|PM)?/ }
};

const MONTHS = {
    // feel free to add more localized month names
    0: [
        'JAN',
        'JANUARY',
        'JANUAR',
        'JÄNNER',
        'JÄN',
        'JANV',
        'JANVIER',
        'ENE',
        'ENERO',
        'GEN',
        'GENNAIO',
        'JANEIRO'
    ],
    1: [
        'FEB',
        'FEBRUARY',
        'FEBR',
        'FEBRUAR',
        'FÉV',
        'FÉVR',
        'FÉVRIER',
        'FEBRERO',
        'FEBBRAIO',
        'FEV',
        'FEVEREIRO'
    ],
    2: ['MAR', 'MÄR', 'MARCH', 'MRZ', 'MÄRZ', 'MARS', 'MARS', 'MARZO', 'MARZO', 'MARÇO'],
    3: ['APR', 'APRIL', 'APR', 'APRIL', 'AVR', 'AVRIL', 'ABR', 'ABRIL', 'APRILE'],
    4: ['MAY', 'MAI', 'MAYO', 'MAG', 'MAGGIO', 'MAIO', 'MAJ'],
    5: ['JUN', 'JUNE', 'JUNI', 'JUIN', 'JUNIO', 'GIU', 'GIUGNO', 'JUNHO'],
    6: ['JUL', 'JULY', 'JULI', 'JUIL', 'JUILLET', 'JULIO', 'LUG', 'LUGLIO', 'JULHO'],
    7: ['AUG', 'AUGUST', 'AOÛT', 'AGO', 'AGOSTO'],
    8: ['SEP', 'SEPTEMBER', 'SEPT', 'SEPTEMBRE', 'SEPTIEMBRE', 'SET', 'SETTEMBRE', 'SETEMBRO'],
    9: [
        'OCT',
        'OCTOBER',
        'OKT',
        'OKTOBER',
        'OCTOBRE',
        'OCTUBRE',
        'OTT',
        'OTTOBRE',
        'OUT',
        'OUTUBRO'
    ],
    10: ['NOV', 'NOVEMBER', 'NOVEMBER', 'NOVEMBRE', 'NOVIEMBRE', 'NOVEMBRE', 'NOVEMBRO'],
    11: [
        'DEC',
        'DECEMBER',
        'DEZ',
        'DES',
        'DEZEMBER',
        'DÉC',
        'DÉCEMBRE',
        'DIC',
        'DICIEMBRE',
        'DICEMBRE',
        'DESEMBER',
        'DEZEMBRO'
    ]
};
const shortMonthKey = {};

each(MONTHS, function (abbr, m) {
    each(abbr, function (a) {
        shortMonthKey[a] = m;
    });
});

rx.MMM = { parse: new RegExp('(' + flatten(values(MONTHS)).join('|') + ')') };

const ISO8601_REG =
    /^(?:([1-9]\d{3})(-?)(?:(0\d|1[012]))\2(0\d|1\d|2\d|3[01]))T([01]\d|2[0-3])(:?)([0-5]\d)(?:\6([0-5]\d)(?:\.(\d{3}))?)?(Z|[+-][01]\d(?:\6[0-5]\d)?)$/;

each(rx, function (r) {
    r.parse = r.parse.source;
    if (isRegExp(r.test)) r.test = r.test.source;
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
    'MM/DD/YY': {
        test: reg(rx.MM.test, '([\\-\\/])', rx.DD.test, '\\2', rx.YY.test),
        parse: reg(rx.MM.parse, '([\\-\\/])', rx.DD.parse, '\\2', rx.YY.parse),
        precision: 'day'
    },
    'DD/MM/YY': {
        test: reg(rx.DD.test, '([\\-\\.\\/ ?])', rx.MM.test, '\\2', rx.YY.test),
        parse: reg(rx.DD.parse, '([\\-\\.\\/ ?])', rx.MM.parse, '\\2', rx.YY.parse),
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
        test: reg(rx.YYYY.test, '([\\-\\.\\/ ?])', rx.MM.test, '\\2', rx.DD.test, s3, rx.HHMM.test),
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
        test: ISO8601_REG,
        parse: ISO8601_REG,
        precision: 'day-seconds'
    }
};

function reg() {
    return new RegExp(begin + Array.prototype.slice.call(arguments).join(' *') + end, 'i');
}

function test(str, key) {
    var fmt = knownFormats[key];
    if (isRegExp(fmt.test)) {
        return fmt.test.test(str);
    } else {
        return fmt.test(str, key);
    }
}

function parse(str, key) {
    var fmt = knownFormats[key];
    if (isRegExp(fmt.parse)) {
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

function hour(hr, amPm) {
    if (hr !== 12) return hr + (amPm === 'PM' ? 12 : 0);
    return amPm === 'AM' ? 0 : 12;
}

export default function (sample) {
    let format;
    let errors = 0;
    const matches = {};
    const bestMatch = ['', 0];

    sample = sample || [];

    each(knownFormats, function (format, key) {
        each(sample, function (n) {
            if (matches[key] === undefined) matches[key] = 0;
            if (test(String(n).toUpperCase(), key)) {
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
    const type = {
        parse: function (raw) {
            if (isDate(raw) || isUndefined(raw)) return raw;
            if (!format || !isString(raw)) {
                errors++;
                return raw;
            }

            var m = parse(raw.toUpperCase(), format);

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
                    return new Date(+m[1], shortMonthKey[m[2]], 1);
                case 'MMM-YYYY':
                    return new Date(+m[2], shortMonthKey[m[1]], 1);
                case 'MMM-YY':
                    return new Date(guessTwoDigitYear(+m[2]), shortMonthKey[m[1]], 1);
                case 'MMM':
                    return new Date(curYear, shortMonthKey[m[1]], 1);

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
                    return new Date(m[4], shortMonthKey[m[3]], m[1]);
                case 'DD/MMM/YY':
                    return new Date(guessTwoDigitYear(m[4]), shortMonthKey[m[3]], m[1]);
                case 'MM/DD/YYYY':
                    return new Date(m[4], m[1] - 1, m[3]);
                case 'MM/DD/YY':
                    return new Date(guessTwoDigitYear(m[4]), m[1] - 1, m[3]);
                case 'DD/MM/YY':
                    return new Date(guessTwoDigitYear(m[4]), m[3] - 1, m[1]);
                case 'MMM-DD-YYYY':
                    return new Date(m[3], shortMonthKey[m[1]], m[2]);

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
                    return new Date(
                        `${m[1]}-${m[3]}-${m[4]}T${m[5]}:${m[7]}:${m[8] || '00'}.${m[9] || '000'}${
                            m[10] || ''
                        }`
                    );

                default:
                    console.warn('unknown format', format);
            }
            errors++;
            return raw;
        },
        toNum: function (d) {
            return isDate(d) ? d.getTime() : Number.NaN;
        },
        fromNum: function (i) {
            return new Date(i);
        },
        errors: function () {
            return errors;
        },
        name: function () {
            return 'date';
        },

        format: function (fmt) {
            if (arguments.length) {
                format = fmt;
                return type;
            }
            return format;
        },

        precision: function () {
            return knownFormats[format].precision;
        },

        isValid: function (val) {
            return isDate(type.parse(val));
        },

        ambiguousFormats: function () {
            var candidates = [];
            each(matches, function (cnt, fmt) {
                if (cnt === bestMatch[1]) {
                    candidates.push([fmt, fmt]); // key, label
                }
            });
            return candidates;
        }
    };
    return type;
}
