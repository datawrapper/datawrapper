import test from 'ava';
import transformObjectValues from './transformObjectValues';

for (const [from, to] of [
    [null, undefined],
    [undefined, null],
    [9, 1],
    ['a', undefined],
    ['a', 'a'],
]) {
    test(`transformObjectValues sets ${JSON.stringify(from)} values to ${JSON.stringify(
        to
    )}`, t => {
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

        const out = transformObjectValues(input, from, to);

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
