import test from 'ava';
import { iterateObjectPaths } from './objectPaths';

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
