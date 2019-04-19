// numeral.js locale configuration
// locale : Hungarian (hu)
// author : Peter Bakondy : https://github.com/pbakondy

export default {
    delimiters: {
        thousands: ' ',
        decimal: ','
    },
    abbreviations: {
        thousand: 'E', // ezer
        million: 'M', // millió
        billion: 'Mrd', // milliárd
        trillion: 'T' // trillió
    },
    ordinal: function(number) {
        return '.';
    },
    currency: {
        symbol: ' Ft'
    }
};
