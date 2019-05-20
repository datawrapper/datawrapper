/**
 * Associated Press Style Dates
 *
 * - Always use Arabic figures, without st, nd, rd or th
 * - Capitalize months
 * - When a month is used with a specific date, abbreviate only Jan., Feb., Aug.,Sept., Oct., Nov. and Dec. (e.g. Oct. 4 was the day of her birthday.)
 * - use "a.m." and "p.m." instead of AM/PM
 */
export default {
    name: 'en-ap',
    weekdays: 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
    months: 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
    weekdaysShort: 'Sun._Mon._Tue._Wed._Thu._Fri._Sat.'.split('_'),
    monthsShort: 'Jan._Feb._March_April_May_June_July_Aug._Sept._Oct._Nov._Dec.'.split('_'),
    weekdaysMin: 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
    ordinal: function(n) {
        return n;
    },
    meridiem: function(hour) {
        return hour < 12 ? 'a.m.' : 'p.m.';
    },
    relativeTime: {
        future: 'in %s',
        past: '%s ago',
        s: 'a few seconds',
        m: 'a minute',
        mm: '%d minutes',
        h: 'an hour',
        hh: '%d hours',
        d: 'a day',
        dd: '%d days',
        M: 'a month',
        MM: '%d months',
        y: 'a year',
        yy: '%d years'
    },
    formats: {
        LT: 'HH:mm',
        LTS: 'HH:mm:ss',
        L: 'DD/MM/YYYY',
        LL: 'D MMMM YYYY',
        LLL: 'D MMMM YYYY HH:mm',
        LLLL: 'dddd, D MMMM YYYY HH:mm'
    }
};
