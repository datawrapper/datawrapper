import test from 'ava';
import set from './set.js';

const thing = {
    answer: 42,
    nested: {
        bar: true,
        nothing: null,
        array: [1, 2, 4, 8],
        nested: {
            foo: 12
        }
    }
};

test('set simple', t => {
    set(thing, 'answer', 21);
    t.is(thing.answer, 21);
});

test('set second level', t => {
    set(thing, 'nested.bar', false);
    t.is(thing.nested.bar, false);
});

test('set third level', t => {
    set(thing, 'nested.nested.foo', 'bar');
    t.is(thing.nested.nested.foo, 'bar');
});

test('set creating missing objects', t => {
    set(thing, 'newkey.foo', 123);
    t.is(thing.newkey.foo, 123);
});

test('set array elements', t => {
    set(thing, 'nested.array.1', 20);
    set(thing, 'nested.array.2', 40);
    t.is(thing.nested.array[0], 1);
    t.is(thing.nested.array[1], 20);
    t.is(thing.nested.array[2], 40);
    t.is(thing.nested.array[3], 8);
});

test('set returns true if something changed', t => {
    const thing = {
        answer: 42,
        nested: {
            bar: true
        }
    };
    t.false(set(thing, 'answer', 42));
    t.true(set(thing, 'answer', 43));
    t.true(set(thing, 'nested.foo', 'bar'));
    t.true(set(thing, 'nested.bar', false));
    t.false(set(thing, 'nested.bar', false));
});

test('set using a key as array', t => {
    set(thing, ['nested', 'sp.am'], 'spam');
    t.is(thing.nested['sp.am'], 'spam');
});
