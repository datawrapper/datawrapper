import { hash } from './hash';
import test from 'ava';

test('hashes a string', async t => {
    const hashed = await hash('foo');

    t.not(hashed, 'foo');
    t.is(typeof hashed, 'string');
    t.is(hashed, await hash('foo'));

    t.not(hashed, await hash('bar'));
});

test('hashes a number', async t => {
    const hashed = await hash(123);

    t.not(hashed, 123);
    t.is(typeof hashed, 'string');
    t.is(hashed, await hash(123));

    t.not(hashed, await hash(456));
});

test('hashes an object', async t => {
    const hashed = await hash({ foo: 'bar' });

    t.notDeepEqual(hashed, { foo: 'bar' });
    t.is(typeof hashed, 'string');
    t.is(hashed, await hash({ foo: 'bar' }));

    t.not(hashed, await hash({ hello: 'world' }));
});

test('hashes an array', async t => {
    const hashed = await hash([1, 2, 3]);

    t.notDeepEqual(hashed, [1, 2, 3]);
    t.is(typeof hashed, 'string');
    t.is(hashed, await hash([1, 2, 3]));

    t.not(hashed, await hash([4, 5, 6]));
});
