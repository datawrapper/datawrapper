/**
 * Associated Press Style Dates
 *
 * - Always use Arabic figures, without st, nd, rd or th
 * - Capitalize months
 * - When a month is used with a specific date, abbreviate only Jan., Feb., Aug.,Sept., Oct., Nov. and Dec. (e.g. Oct. 4 was the day of her birthday.)
 */
export default {
    name: 'en-ap',
    weekdays: 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
    months: 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
    weekdaysShort: 'Sun._Mon._Tue._Wed._Thu._Fri._Sat.'.split('_'),
    monthsShort: 'Jan._Feb._March_April_May_June_July_Aug._Sept._Oct._Nov._Dec.'.split('_'),
    weekdaysMin: 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
    ordinal: n => n
};
