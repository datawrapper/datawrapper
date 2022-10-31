import test from 'ava';
import toFixed from './toFixed';

test('toFixed on whole numbers', t => {
    t.is(toFixed(42), '42');
    t.is(toFixed(4), '4');
    t.is(toFixed(12345), '12345');
});

test('toFixed on numbers with single digit', t => {
    t.is(toFixed(42.1), '42.1');
    t.is(toFixed(123.4), '123.4');
    t.is(toFixed(55.5), '55.5');
    t.is(toFixed(99.9), '99.9');
});

test('toFixed on numbers with almost zero tail', t => {
    t.is(toFixed(10.1), '10.1');
    t.is(toFixed(10.01), '10.01');
    t.is(toFixed(10.001), '10.001');
    t.is(toFixed(10.0001), '10');
    t.is(toFixed(10.00001), '10');
});

test('toFixed on numbers with almost 1 tail', t => {
    t.is(toFixed(9.9), '9.9');
    t.is(toFixed(9.99), '9.99');
    t.is(toFixed(9.999), '9.999');
    t.is(toFixed(9.9999), '9.9999');
    t.is(toFixed(9.99999), '10');
    t.is(toFixed(9.5559999), '9.5559999');
    t.is(toFixed(9.55599999), '9.556');
    t.is(toFixed(9.999999), '10');
});
