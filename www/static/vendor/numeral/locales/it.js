// numeral.js locale configuration
// locale : italian Italy (it)
// author : Giacomo Trombi : http://cinquepunti.it

export default {
    delimiters: {
        thousands: '.',
        decimal: ','
    },
    abbreviations: {
        thousand: 'mila',
        million: 'mil',
        billion: 'b',
        trillion: 't'
    },
    ordinal: function(number) {
        return 'º';
    },
    currency: {
        symbol: '€'
    }
};
