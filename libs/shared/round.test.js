import test from 'ava';
import round from './round.js';

test('round to zero decimals', t => {
    t.is(round(1.2345), 1);
    t.is(round(1.2345, 0), 1);
});

test('round to positive decimals', t => {
    t.is(round(1.2345, 1), 1.2);
    t.is(round(1.2345, 2), 1.23);
    t.is(round(1.2345, 3), 1.235);
    t.is(round(1.2345, 4), 1.2345);
});

test('round to negative decimals', t => {
    t.is(round(12345, 0), 12345);
    t.is(round(12345, -1), 12350);
    t.is(round(12345, -2), 12300);
    t.is(round(12345, -3), 12000);
    t.is(round(12345, -4), 10000);
});
