// numeral.js locale configuration
// locale : English Australia
// author : Don Vince : https://github.com/donvince/

export default {
    delimiters: {
        thousands: ',',
        decimal: '.'
    },
    abbreviations: {
        thousand: 'k',
        million: 'm',
        billion: 'b',
        trillion: 't'
    },
    ordinal: function(number) {
        var b = number % 10;
        return ~~((number % 100) / 10) === 1 ? 'th' : b === 1 ? 'st' : b === 2 ? 'nd' : b === 3 ? 'rd' : 'th';
    },
    currency: {
        symbol: '$'
    }
};
