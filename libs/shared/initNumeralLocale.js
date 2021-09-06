import numeral from 'numeral';

/**
 * in order to use {@link formatValue} with custom locales
 * and to avoid version conflicts with `numeral`, this method
 * allows setting a locale.
 *
 * @exports initNumeralLocale
 * @kind function
 *
 * @param {object} locale
 *
 * @export
 */
export default function initNumeralLocale(locale) {
    if (isInitialized) return;
    numeral.register('locale', 'dw', locale);
    numeral.locale('dw');
    isInitialized = true;
}

let isInitialized = false;
