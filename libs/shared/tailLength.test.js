import test from 'ava';
import tailLength from './tailLength.js';

test('tailLength on decimal numbers with tail length equal to number of decimal places', t => {
    t.is(tailLength(3.123), 3);
    t.is(tailLength(3000.123), 3);
    t.is(tailLength(3.123456789), 9);
    t.is(tailLength(3.129999), 6);
    t.is(tailLength(3.1299001), 7);
});

test('tailLength on decimal numbers with smaller tail length than number of decimal places', t => {
    t.is(tailLength(3.1299999), 2);
    t.is(tailLength(3000.1299999), 2);
    t.is(tailLength(3.1290001), 3);
});

test('tailLength on whole numbers', t => {
    t.is(tailLength(3), 0);
    t.is(tailLength(3000), 0);
});
