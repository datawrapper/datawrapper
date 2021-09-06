const MINUTE = 6e4;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const MONTH = DAY * 30;
const YEAR = DAY * 365;

/**
 * auto-detects a nice default axis tick format for numeric
 * columns based on the input range
 *
 * @example
 * import {autoTickFormatNumber} from '@datawrapper/shared/autoTickFormat';
 * autoTickFormatNumber([0,100]); // '0,0.[00]'
 * autoTickFormatNumber([0.2,0.7]); // '0,0.00[00]'
 *
 * @param {array} range - [min, max] of the data
 * @returns {string} - numeral.js compatible format string
 */
export function autoTickFormatNumber(range) {
    const span = Math.abs(range[1] - range[0]);
    if (span < 1) return '0,0.00[0]';
    if (span < 3) return '0,0.0[0]';
    if (span < 1e4) return '0,0.[0]';
    if (span > 1e6 || Math.abs(range[0]) > 1e5 || Math.abs(range[1]) > 1e5) return '0,0a';
    return '0,0';
}

/**
 * auto-detects a nice default axis tick format for date
 * columns based on the input range and precision
 *
 * @example
 * import {autoTickFormatDate} from '@datawrapper/shared/autoTickFormat';
 * autoTickFormatDate([new Date(2000,0,1), new Date(2002,0,1)], 'quarter'); // 'YYYY|[Q]Q'
 *
 * @param {array} range - [min, max] of the data
 * @param {string} precision - the input data precision (year|quarter|month|week|day|...)
 * @returns {string} - day.js compatible format string
 */
export function autoTickFormatDate(range, precision = 'day') {
    const span = Math.abs(range[1].getTime() - range[0].getTime());
    if (precision === 'year')
        return span > YEAR * 5 ? "YYYY~~'YY" : span > YEAR * 3 ? 'YYYY' : 'YYYY|MMM';
    if (precision === 'quarter') return span > MONTH * 6 ? 'YYYY|[Q]Q' : 'YYYY [Q]Q|MMM';
    if (precision === 'week') return 'YYYY|[W]wo';
    if (span < MINUTE * 8) return 'LTS';
    if (span < DAY) return 'LT';
    if (span < DAY * 5) return 'dddd|LT';
    if (span < MONTH * 3) return 'MMMM|D';
    if (span < YEAR) return 'MMM|D';
    return 'YYYY|MMM|D';
}

/**
 * Convenient wrapper around autoTickFormatNumber and autoTickFormatDate.
 * Returns either a numeral.js or day.js format, depending on the column type.
 *
 * @exports autoTickFormat
 * @kind function
 *
 * @param {object} column -- dw.column instance that is displayed on the axis
 * @returns {string} -- a numeral|dayjs format string
 */
export function autoTickFormat(column, range) {
    if (range === undefined) range = column.range();
    if (column.type() === 'number') {
        return autoTickFormatNumber(range);
    } else if (column.type() === 'date') {
        return autoTickFormatDate(range, column.type(true).precision());
    }
    return false;
}
