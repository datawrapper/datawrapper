import numeral from 'numeral';
import { FormatNumberOptions } from './types.js';

/**
 * special number formatting that can deal with microtypography
 * and "prepend currencies" (e.g., −$1234.57)
 *
 * @exports formatNumber
 * @kind function
 *
 * @param {object} numeral - Numeral.js instance
 * @param {number} value - the number to format
 * @param {object} options - options, see below
 * @param {string} options.format - numeral.js compatible number format
 * @param {string} options.prepend - string to prepend to number
 * @param {string} options.append - string to append to number
 * @param {string} options.minusChar - custom character to use for minus
 * @param {number} options.multiply - multiply number before applying format
 *
 * @example
 * // returns '1234.57'
 * formatNumber(numeral, 1234.567)
 *
 * @example
 * // returns '−$1234.57'
 * formatNumber(numeral, -1234.567, { prepend: '$' })
 *
 * @export
 * @returns {string} - the formatted number
 */
export default function formatNumber(
    num: typeof numeral,
    value: number,
    options: FormatNumberOptions = {}
): string {
    if (value === undefined || isNaN(value) || value === null) {
        return '';
    }
    let format = options.format || '0.[00]';
    const multiply = options.multiply || 1;
    const prepend = options.prepend || '';
    const append = options.append || '';
    const minusChar = options.minusChar || '−';
    const plusMinusChar = options.plusMinusChar || '±';
    if (format.includes('%') && Number.isFinite(value)) {
        // numeraljs will multiply percentages with 100
        // which we don't want to happen
        value *= 0.01;
    }
    value *= multiply;
    const parenthesesFormat = format.indexOf('(') > -1;
    const specialThousandsFormat = format.indexOf(';') > -1;

    format = format.replace(/;/g, ',');
    let fmt = num(parenthesesFormat ? value : Math.abs(value)).format(format);

    if (specialThousandsFormat) {
        const locale = num.options.currentLocale;
        const separator = num.locales[locale].delimiters.thousands;
        const val = format.includes('%') ? value / 0.01 : value;
        fmt = Math.abs(val) < 10000 ? fmt.replace(separator, '') : fmt;
    }

    if (
        prepend &&
        !parenthesesFormat &&
        value < 0 &&
        currencies.has(prepend.trim().toLowerCase())
    ) {
        // pull minus sign to front
        return `${minusChar}${prepend}${fmt.replace('+', '')}${append}`;
    } else if (
        prepend &&
        value >= 0 &&
        currencies.has(prepend.trim().toLowerCase()) &&
        format.includes('+')
    ) {
        // pull plus sign to front
        return `${value === 0 ? plusMinusChar : '+'}${prepend}${fmt.replace('+', '')}${append}`;
    } else if (value === 0 && format.includes('+')) {
        return `${prepend}${fmt.replace('+', plusMinusChar)}${append}`;
    }
    if (value < 0 && !parenthesesFormat) {
        return `${prepend}${minusChar}${fmt.replace('+', '')}${append}`;
    }
    return `${prepend}${fmt}${append}`;
}

/*
 * list of currency signs that sometimes preceed the value
 * @todo: extend this list if users requesting it :)
 */
const currencies = new Set([
    '฿',
    '₿',
    '¢',
    '$',
    '€',
    'eur',
    '£',
    'gbp',
    '¥',
    'yen',
    'usd',
    'cad',
    'us$',
    'ca$',
    'can$'
]);
