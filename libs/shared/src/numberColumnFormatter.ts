import n from 'numeral';

import formatNumber from './formatNumber';
import equalish from './equalish';
import { NumberColumnFormatterConfig } from './chartTypes';

/**
 * Creates a number formatter based on a number column configuration
 *
 * @exports numberColumnFormatter
 * @kind function
 *
 * @description
 * This function returns a number formatting function based on a
 * column configuration object stored in metadata.data.column-format.
 * The implementation is backwards-compatible with our old
 * Globalize-based number formatting, but uses numeral under the hood.
 *
 * @param {object} numeral - Numeral.js instance
 * @param {object} config - the column configuration from metadata
 * @returns {function}
 */
export = function numberColumnFormatter(numeral: typeof n, config: NumberColumnFormatterConfig) {
    const format = config['number-format'] || '-';
    const div = Number(config['number-divisor'] || 0);
    const append = (config['number-append'] || '').replace(/ /g, '\u00A0');
    const prepend = (config['number-prepend'] || '').replace(/ /g, '\u00A0');

    return function (val: number, full?: boolean, round?: boolean) {
        if (isNaN(val)) return val;
        const _fmt = format;
        let digits = 0;
        if (div !== 0 && _fmt === '-') digits = 1;
        if (_fmt.substr(0, 1) === 's') {
            // significant figures
            digits = Math.max(0, signDigitsDecimalPlaces(val, +_fmt.substr(1)));
        }
        if (round) digits = 0;
        if (_fmt === '-') {
            // guess number format based on single number
            digits = equalish(val, Math.round(val))
                ? 0
                : equalish(val, Math.round(val * 10) * 0.1)
                ? 1
                : equalish(val, Math.round(val * 100) * 0.01)
                ? 2
                : equalish(val, Math.round(val * 1000) * 0.001)
                ? 3
                : equalish(val, Math.round(val * 10000) * 0.0001)
                ? 4
                : equalish(val, Math.round(val * 100000) * 0.00001)
                ? 5
                : 6;
        }

        if (_fmt[0] === 'n') {
            digits = Number(_fmt.substr(1, _fmt.length));
        }

        let numeralFormat = '0,0';
        for (let i = 0; i < digits; i++) {
            if (i === 0) numeralFormat += '.';
            numeralFormat += '0';
        }

        return formatNumber(numeral, val, {
            format: numeralFormat,
            prepend: full ? prepend : '',
            append: full ? append : '',
            multiply: Math.pow(10, div * -1)
        });
    };
};

function signDigitsDecimalPlaces(num: number, sig: number) {
    if (num === 0) return 0;
    return Math.round(sig - Math.ceil(Math.log(Math.abs(num)) / Math.LN10));
}
