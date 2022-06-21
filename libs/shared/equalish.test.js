import test from 'ava';
import equalish from './equalish.js';
import { testProp, fc } from 'ava-fast-check';

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

testProp('A number is equalish to itself', [fc.float()], (t, a) => {
    t.true(equalish(a, a));
});

testProp(
    'A number is equalish to almost itself',
    [fc.double(), fc.double({ min: 0, max: 1e-6 })],
    (t, a, b) => {
        t.true(equalish(a, a + b));
    }
);

testProp(
    'A number is not equalish to almost itself',
    [fc.double(), fc.double({ min: 1.1e-6, max: 2e-6 })],
    (t, a, b) => {
        t.false(equalish(a, a + b));
    }
);
