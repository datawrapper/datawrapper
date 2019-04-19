// numeral.js locale configuration
// locale : french (Canada) (fr-ca)
// author : Léo Renaud-Allaire : https://github.com/renaudleo

export default {
    delimiters: {
        thousands: ' ',
        decimal: ','
    },
    abbreviations: {
        thousand: 'k',
        million: 'M',
        billion: 'G',
        trillion: 'T'
    },
    ordinal: function(number) {
        return number === 1 ? 'er' : 'e';
    },
    currency: {
        symbol: '$'
    }
};
