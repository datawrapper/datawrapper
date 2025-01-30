import test from 'ava';
import mapObjectValues, { mapNullToUndefined, mapUndefinedToNull } from './mapObjectValues';
import cloneDeep from 'lodash/cloneDeep.js';

for (const [from, to] of [
    [null, undefined],
    [undefined, null],
    [9, 1],
    ['a', undefined],
    ['a', 'a'],
]) {
    test(`mapObjectValues sets ${JSON.stringify(from)} values to ${JSON.stringify(to)}`, t => {
        const input = {
            a: from,
            b: 1,
            c: from,
            d: {
                e: { e2: from },
                f: 2,
                g: from,
            },
        };

        const out = mapObjectValues(input, from, to);

        t.deepEqual(out, {
            a: to,
            b: 1,
            c: to,
            d: {
                e: { e2: to },
                f: 2,
                g: to,
            },
        });
    });
}

test('mapObjectValues does not mutate the original object', t => {
    const input = {
        a: 'CONVERT ME',
        b: 123,
        c: {
            d: {
                e: 'CONVERT ME',
                f: 'hello',
            },
        },
    };

    const inputCloned = cloneDeep(input);

    const out = mapObjectValues(input, 'CONVERT ME', 'I WAS CONVERTED');

    t.deepEqual(out, {
        a: 'I WAS CONVERTED',
        b: 123,
        c: {
            d: {
                e: 'I WAS CONVERTED',
                f: 'hello',
            },
        },
    });

    // Original object was not changed
    t.deepEqual(input, inputCloned);
    t.is(input.a, 'CONVERT ME');
});

test('mapNullToUndefined converts null values to undefined', t => {
    const input = {
        a: null,
        b: 123,
        c: {
            d: {
                e: null,
                f: 'hello',
            },
        },
    };

    const out = mapNullToUndefined(input);

    t.deepEqual(out, {
        a: undefined,
        b: 123,
        c: {
            d: {
                e: undefined,
                f: 'hello',
            },
        },
    });
});

test('mapNullToUndefined does not mutate the original object', t => {
    const input = {
        a: null,
        b: 123,
        c: {
            d: {
                e: null,
                f: 'hello',
            },
        },
    };

    const inputCloned = cloneDeep(input);

    mapNullToUndefined(input);

    // Original object was not changed
    t.deepEqual(input, inputCloned);
    t.is(input.a, null);
});

test('mapUndefinedToNull converts undefined values to null', t => {
    const input = {
        a: undefined,
        b: 123,
        c: {
            d: {
                e: undefined,
                f: 'hello',
            },
        },
    };

    const out = mapUndefinedToNull(input);

    t.deepEqual(out, {
        a: null,
        b: 123,
        c: {
            d: {
                e: null,
                f: 'hello',
            },
        },
    });
});

test('mapUndefinedToNull does not mutate the original object', t => {
    const input = {
        a: undefined,
        b: 123,
        c: {
            d: {
                e: undefined,
                f: 'hello',
            },
        },
    };

    const inputCloned = cloneDeep(input);

    mapUndefinedToNull(input);

    // Original object was not changed
    t.deepEqual(input, inputCloned);
    t.is(input.a, undefined);
});
