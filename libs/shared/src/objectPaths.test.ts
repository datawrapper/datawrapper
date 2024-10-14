import test from 'ava';
import { getObjectPaths, iterateObjectPaths } from './objectPaths';

test(`iterateObjectPaths - basic nested object`, t => {
    // basic nested object
    const obj = {
        a: 1,
        b: 2,
        c: {
            d: 3,
            e: {
                f: 4
            }
        }
    };

    const actual: string[][] = [];
    iterateObjectPaths(obj, path => {
        actual.push(path);
    });
    t.deepEqual(actual, [['a'], ['b'], ['c', 'd'], ['c', 'e', 'f']]);
});
test(`iterateObjectPaths - with simple arrays`, t => {
    // nested object with arrays
    const obj = {
        a: 1,
        b: 2,
        c: {
            d: 3,
            e: {
                f: 4,
                g: [1, 2, 3]
            }
        }
    };

    const actual: string[][] = [];
    iterateObjectPaths(obj, path => {
        actual.push(path);
    });

    t.deepEqual(actual, [['a'], ['b'], ['c', 'd'], ['c', 'e', 'f'], ['c', 'e', 'g']]);
});

test(`iterateObjectPaths - with complex arrays`, t => {
    const obj = { a: [{ b: { c: 3 } }, { d: 42 }] };

    const actual: string[][] = [];
    iterateObjectPaths(obj, path => {
        actual.push(path);
    });

    // Note that items within arrays are not iterated in the same way that paths in lodash.get/set work.
    // If this is needed, the actual result looks like this:
    // [['a', '0', 'b', 'c'], ['a', '1', 'd']]
    t.deepEqual(actual, [['a']]);
});

test(`iterateObjectPaths - with nested empty objects`, t => {
    const obj = { a: { b: {} } };

    const actual: string[][] = [];
    iterateObjectPaths(obj, path => {
        actual.push(path);
    });

    t.deepEqual(actual, [['a', 'b']]);
});

test(`iterateObjectPaths - complex object`, t => {
    const obj = {
        a0: {
            a1: '2024-10-02T09:44:00.495Z',
            c1: {
                f2: [],
                c2: {
                    a3: 2
                }
            },
            d1: {
                a2: {
                    e3: null
                }
            },
            e1: {
                b2: [1, 2, 3],
                f2: {
                    f3: {}
                }
            },
            b1: null
        },
        b0: {
            b1: 2,
            f1: {
                a2: [],
                b2: {
                    a3: 'abc'
                }
            }
        },
        e0: null
    };

    const actual: string[][] = [];
    iterateObjectPaths(obj, path => {
        actual.push(path);
    });

    t.deepEqual(actual, [
        ['a0', 'a1'],
        ['a0', 'c1', 'f2'],
        ['a0', 'c1', 'c2', 'a3'],
        ['a0', 'd1', 'a2', 'e3'],
        ['a0', 'e1', 'b2'],
        ['a0', 'e1', 'f2', 'f3'],
        ['a0', 'b1'],
        ['b0', 'b1'],
        ['b0', 'f1', 'a2'],
        ['b0', 'f1', 'b2', 'a3'],
        ['e0']
    ]);
});

test('getObjectPaths - returns correct keys', t => {
    const keys = getObjectPaths({
        answer: 42,
        metadata: {
            transpose: false,
            'null-key': null,
            describe: {
                intro: 'Intro',
                enabled: false
            }
        },
        today: new Date()
    });
    [
        'answer',
        'today',
        'metadata.transpose',
        'metadata.null-key',
        'metadata.describe.intro',
        'metadata.describe.enabled'
    ].forEach(key => {
        t.is(keys.includes(key), true);
    });
});
