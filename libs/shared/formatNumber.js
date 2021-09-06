import numeral from 'numeral';

/**
 * special number formatting that can deal with microtypography
 * and "prepend currencies" (e.g., −$1234.57)
 *
 * Use {@link initNumeralLocale} to set a custom locale.
 *
 * @exports formatNumber
 * @kind function
 *
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
 * formatNumber(1234.567)
 *
 * @example
 * // returns '−$1234.57'
 * formatNumber(-1234.567, { prepend: '$' })
 *
 * @export
 * @returns {string} - the formatted number
 */
export default function formatNumber(value, options) {
    options = {
        format: '0.[00]',
        prepend: '',
        append: '',
        minusChar: '−',
        plusMinusChar: '±',
        multiply: 1,
        ...options
    };
    if (value === undefined || isNaN(value) || value === '' || value === null) {
        return '';
    }
    const { format, append, prepend, minusChar, plusMinusChar, multiply } = options;
    if (format.includes('%') && Number.isFinite(value)) {
        // numeraljs will multiply percentages with 100
        // which we don't want to happen
        value *= 0.01;
    }
    value *= multiply;
    const parenthesesFormat = format.indexOf('(') > -1;
    const fmt = numeral(parenthesesFormat ? value : Math.abs(value)).format(format);
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
