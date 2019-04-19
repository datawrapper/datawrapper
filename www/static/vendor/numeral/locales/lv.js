// numeral.js locale configuration
// locale : Latvian (lv)
// author : Lauris Bukšis-Haberkorns : https://github.com/Lafriks

export default {
    delimiters: {
        thousands: ' ',
        decimal: ','
    },
    abbreviations: {
        thousand: ' tūkst.',
        million: ' milj.',
        billion: ' mljrd.',
        trillion: ' trilj.'
    },
    ordinal: function(number) {
        return '.';
    },
    currency: {
        symbol: '€'
    }
};
