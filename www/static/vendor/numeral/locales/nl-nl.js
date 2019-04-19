// numeral.js locale configuration
// locale : netherlands-dutch (nl-nl)
// author : Dave Clayton : https://github.com/davedx

export default {
    delimiters: {
        thousands: '.',
        decimal: ','
    },
    abbreviations: {
        thousand: 'k',
        million: 'mln',
        billion: 'mrd',
        trillion: 'bln'
    },
    ordinal: function(number) {
        var remainder = number % 100;
        return (number !== 0 && remainder <= 1) || remainder === 8 || remainder >= 20 ? 'ste' : 'de';
    },
    currency: {
        symbol: '€ '
    }
};
