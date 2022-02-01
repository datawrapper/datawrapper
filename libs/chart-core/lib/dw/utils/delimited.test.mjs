import numeral from 'numeral';
import test from 'ava';
import { guessDelimiterFromLocale } from './delimited.mjs';

test('guessDelimiterFromLocale', async t => {
    t.is(guessDelimiterFromLocale(numeral), ',');

    const locale1 = String(Math.round(Math.random() * 100000));
    numeral.register('locale', locale1, {
        delimiters: {
            thousands: ' ', // ignored
            decimal: ','
        }
    });
    numeral.locale(locale1);
    t.is(guessDelimiterFromLocale(numeral), ';');

    const locale2 = String(Math.round(Math.random() * 100000));
    numeral.register('locale', locale2, {
        delimiters: {
            thousands: ' ', // ignored
            decimal: '.'
        }
    });
    numeral.locale(locale2);
    t.is(guessDelimiterFromLocale(numeral), ',');

    const locale3 = String(Math.round(Math.random() * 100000));
    numeral.register('locale', locale3, {});
    numeral.locale(locale3);
    t.is(guessDelimiterFromLocale(numeral), ',');
});
