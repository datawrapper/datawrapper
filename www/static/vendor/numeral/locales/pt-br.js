// numeral.js locale configuration
// locale : portuguese brazil (pt-br)
// author : Ramiro Varandas Jr : https://github.com/ramirovjr

export default {
    delimiters: {
        thousands: '.',
        decimal: ','
    },
    abbreviations: {
        thousand: 'mil',
        million: 'milhões',
        billion: 'b',
        trillion: 't'
    },
    ordinal: function(number) {
        return 'º';
    },
    currency: {
        symbol: 'R$'
    }
};
