export default {
    name: 'sr',
    weekdays: 'Nedelja_Ponedeljak_Utorak_Sreda_Četvrtak_Petak_Subota'.split('_'),
    months: 'Januar_Februar_Mart_April_Maj_Jun_Jul_Avgust_Septembar_Oktobar_Novembar_Decembar'.split('_'),
    weekStart: 1,
    relativeTime: {
        future: 'za %s',
        past: 'pre %s',
        s: 'sekunda',
        m: 'minut',
        mm: '%d minuta',
        h: 'sat',
        hh: '%d sati',
        d: 'dan',
        dd: '%d dana',
        M: 'mesec',
        MM: '%d meseci',
        y: 'godina',
        yy: '%d godine'
    },
    ordinal: function(n) {
        return n + '.';
    },
    formats: {
        LT: 'H:mm',
        LTS: 'H:mm:ss',
        L: 'DD.MM.YYYY',
        LL: 'D. MMMM YYYY',
        LLL: 'D. MMMM YYYY H:mm',
        LLLL: 'dddd, D. MMMM YYYY H:mm'
    }
};
