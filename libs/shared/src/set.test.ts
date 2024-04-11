import test from 'ava';
import set from './set';

const thing = {
    answer: 42,
    nested: {
        bar: true,
        nothing: null,
        array: [1, 2, 4, 8],
        nested: {
            foo: 12 as string | number
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
    type Extended = typeof thing & { newkey?: { foo: number } };
    set(thing as Extended, 'newkey.foo', 123);
    t.is((thing as Extended).newkey?.foo, 123);
});

test('set array elements', t => {
    set(thing, 'nested.array.1', 20);
    set(thing, 'nested.array.2', 40);
    t.is(thing.nested.array[0], 1);
    t.is(thing.nested.array[1], 20);
    t.is(thing.nested.array[2], 40);
    t.is(thing.nested.array[3], 8);
});

test('set using a key as array', t => {
    type Extended = typeof thing & { nested: { 'sp.am'?: string } };
    set(thing as Extended, ['nested', 'sp.am'], 'spam');
    t.is((thing as Extended).nested['sp.am'], 'spam');
});

test('set does not create arrays for numeric keys', t => {
    type Extended = typeof thing & { not_array: { 42: number } };
    set(thing, 'not_array.42', 123);
    t.is((thing as Extended).not_array[42], 123);
    t.is(Array.isArray((thing as Extended).not_array), false);
});

test('set does not modify __proto__', t => {
    set(thing, '__proto__.answer', 21);
    t.is(({} as { __proto__: { answer: undefined } }).__proto__.answer, undefined);
});

test('set does not modify constructor.prototype', t => {
    set(thing, 'constructor.prototype.answer', 21);
    t.is({}.constructor.prototype.answer, undefined);
});
