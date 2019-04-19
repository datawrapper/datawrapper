// numeral.js locale configuration
// locale : czech (cs)
// author : Anatoli Papirovski : https://github.com/apapirovski

export default {
    delimiters: {
        thousands: ' ',
        decimal: ','
    },
    abbreviations: {
        thousand: 'tis.',
        million: 'mil.',
        billion: 'b',
        trillion: 't'
    },
    ordinal: function() {
        return '.';
    },
    currency: {
        symbol: 'Kč'
    }
};
