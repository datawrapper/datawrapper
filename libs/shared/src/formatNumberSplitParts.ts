import numeral from 'numeral';
import type formatNumber from './formatNumber.js';

export function formatNumberSplitParts(
    num: typeof numeral,
    value: number,
    options: formatNumber.FormatNumberOptions = {}
): { prefix: string; number: string } {
    if (value === undefined || isNaN(value) || value === null) {
        return { prefix: '', number: '' };
    }
    let format = options.format || '0.[00]';
    const multiply = options.multiply || 1;
    const prepend = options.prepend || '';
    const append = options.append || '';
    const minusChar = options.minusChar ?? '−';
    const plusMinusChar = options.plusMinusChar ?? '±';
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
        return { prefix: minusChar, number: `${prepend}${fmt.replace('+', '')}${append}` };
    } else if (
        prepend &&
        value >= 0 &&
        currencies.has(prepend.trim().toLowerCase()) &&
        format.includes('+')
    ) {
        // pull plus sign to front
        return {
            prefix: value === 0 ? plusMinusChar : '+',
            number: `${prepend}${fmt.replace('+', '')}${append}`
        };
    } else if (value === 0 && format.includes('+')) {
        if (fmt.includes('+')) {
            return {
                prefix: `${prepend}${plusMinusChar}`,
                number: `${fmt.replace('+', '')}${append}`
            };
        }
        return { prefix: `${prepend}${plusMinusChar}`, number: `${fmt.replace('+', '')}${append}` };
    }
    if (value < 0 && !parenthesesFormat) {
        return { prefix: `${prepend}${minusChar}`, number: `${fmt.replace('+', '')}${append}` };
    }
    if (format.includes('+')) {
        return { prefix: `${prepend}+`, number: `${fmt.replace('+', '')}${append}` };
    }
    return { prefix: '', number: `${prepend}${fmt}${append}` };
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
