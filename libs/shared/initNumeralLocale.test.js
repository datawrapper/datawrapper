import test from 'ava';
import formatNumber from './formatNumber.js';
import initNumeralLocale from './initNumeralLocale.js';

test('simple number', t => {
    t.is(formatNumber(1234.5678, { format: '0,.00' }), '1,234.57');
});

test('German number format', t => {
    initNumeralLocale({
        delimiters: {
            thousands: '.',
            decimal: ','
        },
        abbreviations: {
            thousand: ' Tsd.',
            million: ' Mio.',
            billion: ' Mrd.',
            trillion: ' Bio.'
        },
        ordinal: function () {
            return '.';
        },
        currency: {
            symbol: '€'
        }
    });
    t.is(formatNumber(1234.5678, { format: '0,.00' }), '1.234,57');
});
