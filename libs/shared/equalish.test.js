import test from 'ava';
import equalish from './equalish.js';

test('obviously equal', t => {
    t.true(equalish(1, 1));
    t.true(equalish(1e6, 1e6));
    t.true(equalish(1e-6, 1e-6));
});

test('close enough', t => {
    t.true(equalish(0.333333, 1 / 3));
    t.true(equalish(42 + 1e-6, 42));
    t.true(equalish(42 - 1e-6, 42));
});

test('not close enough', t => {
    t.false(equalish(0.333, 1 / 3));
    t.false(equalish(42 + 1e-3, 42));
    t.false(equalish(42 - 1e-3, 42));
});
