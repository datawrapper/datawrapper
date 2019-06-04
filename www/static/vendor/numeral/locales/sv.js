// locale : swedish (sv)
// author : Elana Levin Schtulberg

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
    ordinal: function() {
        return '.';
    },
    currency: {
        symbol: 'kr'
    }
};
