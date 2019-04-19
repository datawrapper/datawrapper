// numeral.js locale configuration
// locale : polish (pl)
// author : Dominik Bulaj : https://github.com/dominikbulaj

export default {
    delimiters: {
        thousands: ' ',
        decimal: ','
    },
    abbreviations: {
        thousand: 'tys.',
        million: 'mln',
        billion: 'mld',
        trillion: 'bln'
    },
    ordinal: function(number) {
        return '.';
    },
    currency: {
        symbol: 'PLN'
    }
};
