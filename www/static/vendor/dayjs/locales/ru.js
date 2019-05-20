export default {
    name: 'ru',
    weekdays: 'воскресенье_понедельник_вторник_среда_четверг_пятница_суббота'.split('_'),
    weekdaysShort: 'вск_пнд_втр_срд_чтв_птн_сбт'.split('_'),
    weekdaysMin: 'вс_пн_вт_ср_чт_пт_сб'.split('_'),
    months: function(dayjsInstance, format) {
        var MONTHS_IN_FORMAT = /D[oD]?(\[[^[\]]*\]|\s)+MMMM?/;
        var monthFormat = 'января_февраля_марта_апреля_мая_июня_июля_августа_сентября_октября_ноября_декабря'.split('_');
        var monthStandalone = 'январь_февраль_март_апрель_май_июнь_июль_август_сентябрь_октябрь_ноябрь_декабрь'.split('_');
        if (MONTHS_IN_FORMAT.test(format)) {
            return monthFormat[dayjsInstance.month()];
        }
        return monthStandalone[dayjsInstance.month()];
    },
    monthsShort: function(dayjsInstance, format) {
        var MONTHS_IN_FORMAT = /D[oD]?(\[[^[\]]*\]|\s)+MMMM?/;
        var monthShortFormat = 'янв._февр._мар._апр._мая_июня_июля_авг._сент._окт._нояб._дек.'.split('_');
        var monthShortStandalone = 'янв._февр._март_апр._май_июнь_июль_авг._сент._окт._нояб._дек.'.split('_');
        if (MONTHS_IN_FORMAT.test(format)) {
            return monthShortFormat[dayjsInstance.month()];
        }
        return monthShortStandalone[dayjsInstance.month()];
    },
    weekStart: 1,
    formats: {
        LT: 'H:mm',
        LTS: 'H:mm:ss',
        L: 'DD.MM.YYYY',
        LL: 'D MMMM YYYY г.',
        LLL: 'D MMMM YYYY г., H:mm',
        LLLL: 'dddd, D MMMM YYYY г., H:mm'
    },
    relativeTime: {
        future: 'через %s',
        past: '%s назад',
        s: 'несколько секунд',
        m: 'минута',
        mm: '%d минут',
        h: 'час',
        hh: '%d часов',
        d: 'день',
        dd: '%d дней',
        M: 'месяц',
        MM: '%d месяцев',
        y: 'год',
        yy: '%d лет'
    },
    ordinal: function(n) {
        return n;
    }
};
