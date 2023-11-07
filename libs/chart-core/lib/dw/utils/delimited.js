export function guessDelimiterFromLocale(numeral) {
    try {
        if (numeral.localeData().delimiters.decimal === ',') {
            return ';';
        }
    } catch (e) {
        // invalid locale data
    }
    return ',';
}

export default { guessDelimiterFromLocale };
