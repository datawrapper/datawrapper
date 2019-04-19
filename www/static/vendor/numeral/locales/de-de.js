// numeral.js locale configuration
// locale : German (de-DE) – useful in Germany

export default {
    delimiters: {
        thousands: '.',
        decimal: ','
    },
    abbreviations: {
        thousand: 'tsd',
        million: 'mio',
        billion: 'mrd',
        trillion: 'bil'
    },
    ordinal: function(number) {
        return '.';
    },
    currency: {
        symbol: '€'
    }
};
