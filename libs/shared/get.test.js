import test from 'ava';
import get from './get.js';

const thing = {
    answer: 42,
    nested: {
        bar: true,
        nothing: null,
        array: [1, 2, 4, 8],
        nested: {
            foo: 12
        },
        'sp.am': 'spam'
    }
};

test('get simple', t => {
    t.is(get(thing, 'answer'), 42);
});

test('get second level', t => {
    t.is(get(thing, 'nested.bar'), true);
});

test('get third level', t => {
    t.is(get(thing, 'nested.nested.foo'), 12);
});

test('get simple fallback', t => {
    t.is(get(thing, 'unknown', 123), 123);
});

test('get nested fallback', t => {
    t.is(get(thing, 'nested.unknown', 'x'), 'x');
});

test('get array elements', t => {
    t.is(get(thing, 'nested.array.0'), 1);
    t.is(get(thing, 'nested.array.1'), 2);
    t.is(get(thing, 'nested.array.2'), 4);
    t.is(get(thing, 'nested.array.3'), 8);
});

test('get array elements fallback', t => {
    t.is(get(thing, 'nested.array.4', 'unknown'), 'unknown');
});

test('get using a key as array', t => {
    t.is(get(thing, ['nested', 'sp.am']), 'spam');
});
