// numeral.js locale configuration
// locale : norwegian (bokmål)
// author : Ove Andersen : https://github.com/azzlack

export default {
    delimiters: {
        thousands: ' ',
        decimal: ','
    },
    abbreviations: {
        thousand: 'k',
        million: 'm',
        billion: 'b',
        trillion: 't'
    },
    ordinal: function(number) {
        return '.';
    },
    currency: {
        symbol: 'kr'
    }
};
