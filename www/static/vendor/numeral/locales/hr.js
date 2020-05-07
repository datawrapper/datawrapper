// numeral.js locale configuration
// locale : hrvatski (hr)
// author : Kresimir Bernardic

export default {
    delimiters: {
        thousands: '.',
        decimal: ','
    },
    abbreviations: {
        thousand: 'tis.',
        million: 'mil.',
        billion: 'bil.',
        trillion: 'tril.'
    },
    ordinal: function() {
        return '.';
    },
    currency: {
        symbol: 'kn'
    }
};
