// numeral.js locale configuration
// locale : German (de-DE) – useful in Germany

export default {
    delimiters: {
        thousands: '.',
        decimal: ','
    },
    abbreviations: {
        thousand: ' Tsd.',
        million: ' Mio.',
        billion: ' Mrd.',
        trillion: ' Bio.'
    },
    ordinal: function(number) {
        return '.';
    },
    currency: {
        symbol: '€'
    }
};
