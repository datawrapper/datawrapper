import test from 'ava';
import { calculateDiff } from './diff';
import { BaseJsonCRDT } from './BaseJsonCRDT';

test('calculateDiff - calculates the correct patch (simple updates)', t => {
    const oldData = { a: 'some value', b: { key: 'value' } };

    const newData = { a: 'new value', b: { key: 'value' } };

    const diff = calculateDiff(oldData, newData);

    t.deepEqual(diff, {
        a: 'new value',
    });

    // make sure that the diff applied again as update to the CRDT yields the same object
    const crdt = new BaseJsonCRDT({ data: oldData });
    crdt.update(diff, '1-1');
    t.deepEqual(crdt.data(), newData);
});

test('calculateDiff - calculates the correct diff (simple arrays)', t => {
    const oldData = { a: 'some value', b: ['A', 'B', 'C'] };

    const newData = { a: 'some value', b: ['D', 'C', 'E'] };

    const diff = calculateDiff(oldData, newData);

    t.deepEqual(diff, {
        b: ['D', 'C', 'E'],
    });

    // make sure that the diff applied again as update to the CRDT yields the same object
    const crdt = new BaseJsonCRDT({ data: oldData });
    crdt.update(diff, '1-1');
    t.deepEqual(crdt.data(), newData);
});

test('calculateDiff - calculates the correct diff (item array - simple updates)', t => {
    const oldData = {
        a: 'some value',
        b: [
            { id: 'A', value: 1 },
            { id: 'B', value: 2 },
            { id: 'C', value: 3 },
        ],
    };

    const newData = {
        a: 'some value',
        b: [
            { id: 'A', value: 1 },
            { id: 'B', value: 2 },
            { id: 'C', value: 99 },
        ],
    };

    const diff = calculateDiff(oldData, newData, { pathsToItemArrays: ['b'] });

    t.deepEqual(diff, {
        b: { C: { value: 99 } },
    });
});

test('calculateDiff - calculates the correct patch (key deletion)', t => {
    const oldData = {
        a: 'some value',
        b: { key: 'value' },
    };

    const newData = {
        b: {},
    };

    const patch = calculateDiff(oldData, newData);

    t.deepEqual(patch, { a: null, b: { key: null } });
});

test('calculateDiff - calculates the correct patch (parent deletion)', t => {
    const oldData = {
        a: 'some value',
        b: { key: 'value' },
    };

    const newData = {};

    const patch = calculateDiff(oldData, newData);

    t.deepEqual(patch, { a: null, b: null });
});

test('calculateDiff - calculates the correct patch (item array - insertion at end)', t => {
    const oldData = {
        a: 'some value',
        b: [
            { id: 'A', value: 1 },
            { id: 'B', value: 2 },
            { id: 'C', value: 3 },
        ],
    };

    const newData = {
        a: 'some value',
        b: [
            { id: 'A', value: 1 },
            { id: 'B', value: 2 },
            { id: 'C', value: 3 },
            { id: 'D', value: 4 },
        ],
    };

    const diff = calculateDiff(oldData, newData, { pathsToItemArrays: ['b'] });

    t.deepEqual(diff, {
        b: { D: { id: 'D', value: 4, _index: 3 } },
    });
});

test('calculateDiff - calculates the correct diff (item array - insertion at start)', t => {
    const oldData = {
        a: 'some value',
        b: [
            { id: 'A', value: 1 },
            { id: 'B', value: 2 },
            { id: 'C', value: 3 },
        ],
    };

    const newData = {
        a: 'some value',
        b: [
            { id: 'D', value: 4 },
            { id: 'A', value: 1 },
            { id: 'B', value: 2 },
            { id: 'C', value: 3 },
        ],
    };

    const diff = calculateDiff(oldData, newData, { pathsToItemArrays: ['b'] });

    t.deepEqual(diff, {
        b: {
            D: { id: 'D', value: 4, _index: 0 },
            A: { _index: 1 },
            B: { _index: 2 },
            C: { _index: 3 },
        },
    });
});

test('calculateDiff - calculates the correct diff (item array - insertion in middle)', t => {
    const oldData = {
        a: 'some value',
        b: [
            { id: 'A', value: 1 },
            { id: 'B', value: 2 },
            { id: 'C', value: 3 },
        ],
    };

    const newData = {
        a: 'some value',
        b: [
            { id: 'A', value: 1 },
            { id: 'B', value: 2 },
            { id: 'D', value: 4 },
            { id: 'C', value: 3 },
        ],
    };

    const diff = calculateDiff(oldData, newData, { pathsToItemArrays: ['b'] });

    t.deepEqual(diff, {
        b: {
            D: { id: 'D', value: 4, _index: 2 },
            C: { _index: 3 },
        },
    });
});

test('calculateDiff - calculates the correct diff (item array - deletion at end)', t => {
    const oldData = {
        a: 'some value',
        b: [
            { id: 'A', value: 1 },
            { id: 'B', value: 2 },
            { id: 'C', value: 3 },
        ],
    };

    const newData = {
        a: 'some value',
        b: [
            { id: 'A', value: 1 },
            { id: 'B', value: 2 },
        ],
    };

    const diff = calculateDiff(oldData, newData, { pathsToItemArrays: ['b'] });

    t.deepEqual(diff, {
        b: {
            C: { _index: null },
        },
    });
});

test('calculateDiff - calculates the correct diff (item array - deletion at beginning)', t => {
    const oldData = {
        a: 'some value',
        b: [
            { id: 'A', value: 1 },
            { id: 'B', value: 2 },
            { id: 'C', value: 3 },
        ],
    };

    const newData = {
        a: 'some value',
        b: [
            { id: 'B', value: 2 },
            { id: 'C', value: 3 },
        ],
    };

    const diff = calculateDiff(oldData, newData, { pathsToItemArrays: ['b'] });

    t.deepEqual(diff, {
        b: {
            A: { _index: null },
            B: { _index: 0 },
            C: { _index: 1 },
        },
    });
});

test('calculateDiff - calculates the correct diff (item array - deletion in the middle)', t => {
    const oldData = {
        a: 'some value',
        b: [
            { id: 'A', value: 1 },
            { id: 'B', value: 2 },
            { id: 'C', value: 3 },
        ],
    };

    const newData = {
        a: 'some value',
        b: [
            { id: 'A', value: 1 },
            { id: 'C', value: 3 },
        ],
    };

    const diff = calculateDiff(oldData, newData, { pathsToItemArrays: ['b'] });

    t.deepEqual(diff, {
        b: {
            B: { _index: null },
            C: { _index: 1 },
        },
    });
});

test('calculateDiff - calculates the correct diff (item array deletion)', t => {
    const oldData = {
        a: 'some value',
        b: {
            c: 'foo',
            d: [
                { id: 'A', value: 1 },
                { id: 'B', value: 2 },
                { id: 'C', value: 3 },
            ],
            e: 'bar',
            h: [1, 2, 3],
        },
        'c.2': {
            f: 'baz',
            g: [1, 2, 3],
        },
        d: [1, 2, 3],
    };

    // Note that we are deleting the entire 'b' and 'c.2' objects plus the 'd' array here.
    // 'c' is a simple object, so the diff should simply delete the entire object.
    // Likewise 'd' is a simple array, so the diff should simply delete the entire array.
    // However, 'b' contains an item array. So the diff should not simply delete the entire object,
    // but instead explicitly delete the keys of 'b' plus explicitly set all items in the item array
    // for deletion.
    //
    // We don't allow the deletion of item arrays as a whole so that we can keep track of which
    // items have been deleted.
    //
    // Keeping track of which items have been deleted helps us prevent these items from being recreated
    // by subsequent updates.
    // This way we prioritize deletion of items, making sure conflicting updates don't lead to UI quirkiness
    // of deleted items suddenly reappearing.
    const newData = {
        a: 'some value',
    };

    const diff = calculateDiff(oldData, newData, { pathsToItemArrays: ['b.d'] });

    t.deepEqual(diff, {
        b: {
            c: null,
            d: {
                A: { _index: null },
                B: { _index: null },
                C: { _index: null },
            },
            e: null,
            h: null,
        },
        'c.2': null,
        d: null,
    });
});

test('calculateDiff - calculates the correct diff (item array - re-ordering two elements)', t => {
    const oldData = {
        a: 'some value',
        b: [
            { id: 'A', value: 1 },
            { id: 'B', value: 2 },
            { id: 'C', value: 3 },
            { id: 'D', value: 4 },
        ],
    };

    const newData = {
        a: 'some value',
        b: [
            { id: 'B', value: 2 },
            { id: 'A', value: 1 },
            { id: 'C', value: 3 },
            { id: 'D', value: 4 },
        ],
    };

    const diff = calculateDiff(oldData, newData, { pathsToItemArrays: ['b'] });

    t.deepEqual(diff, {
        b: {
            A: { _index: 1 },
            B: { _index: 0 },
        },
    });

    // make sure that the diff applied again as update to the CRDT yields the same object
    // const crdt = new CRDT(oldData);
    // crdt.update(diff, '1-1');
    // t.deepEqual(crdt.data(), newData);
});

test('calculateDiff - calculates the correct diff (item array -  re-ordering multiple elements)', t => {
    const oldData = {
        a: 'some value',
        b: [
            { id: 'A', value: 1 },
            { id: 'B', value: 2 },
            { id: 'C', value: 3 },
            { id: 'D', value: 4 },
        ],
    };

    const newData = {
        a: 'some value',
        b: [
            { id: 'D', value: 4 },
            { id: 'C', value: 3 },
            { id: 'A', value: 1 },
            { id: 'B', value: 2 },
        ],
    };

    const diff = calculateDiff(oldData, newData, { pathsToItemArrays: ['b'] });

    t.deepEqual(diff, {
        b: {
            A: { _index: 2 },
            B: { _index: 3 },
            C: { _index: 1 },
            D: { _index: 0 },
        },
    });
});

test('calculateDiff - calculates the correct diff (for numeric ids in item array)', t => {
    const oldData = {
        a: 'some value',
        b: {
            c: 'foo',
            d: [
                { id: 1, value: 1 },
                { id: 2, value: 2 },
                { id: 'C', value: 3 },
            ],
            e: 'bar',
            h: [1, 2, 3],
        },
        'c.2': {
            f: 'baz',
            g: [1, 2, 3],
        },
        d: [1, 2, 3],
    };

    const newData = {
        a: 'some value',
        b: {
            d: [
                { id: 'C', value: 5 },
                { id: 2, value: 'a new value' },
            ],
        },
    };

    const diff = calculateDiff(oldData, newData, { pathsToItemArrays: ['b.d'] });

    t.deepEqual(diff, {
        b: {
            c: null,
            d: {
                1: { _index: null },
                C: { _index: 0, value: 5 },
                2: { value: 'a new value' },
            },
            e: null,
            h: null,
        },
        'c.2': null,
        d: null,
    });
});

test('calculateDiff - calculates the correct diff (empty array - to filled array)', t => {
    const oldData = {
        a: 'some value',
        b: [],
    };

    const newData = {
        a: 'some value',
        b: [
            { id: 'A', value: 1 },
            { id: 'B', value: 2 },
        ],
    };

    const diff = calculateDiff(oldData, newData, { pathsToItemArrays: ['b'] });

    t.deepEqual(diff, {
        b: {
            A: { id: 'A', value: 1, _index: 0 },
            B: { id: 'B', value: 2, _index: 1 },
        },
    });
});

test('calculateDiff - calculates the correct diff (atomic array remains an atomic array even if some items contain an ID)', t => {
    const oldData = {
        a: 'some value',
        b: [1, 2, 3],
    };

    const newData = {
        a: 'some value',
        b: [1, { id: 'B', value: 2 }],
    };

    const diff = calculateDiff(oldData, newData);

    t.deepEqual(diff, {
        b: [1, { id: 'B', value: 2 }],
    });
});

test('calculateDiff - atomic arrays can be turned into atomic arrays that look like item arrays', t => {
    const oldData = {
        a: 'some value',
        b: [1, 2, 3],
    };

    const newData = {
        a: 'some value',
        b: [{ id: 'B', value: 2 }],
    };

    const diff = calculateDiff(oldData, newData);

    t.deepEqual(diff, {
        b: [{ id: 'B', value: 2 }],
    });
});

test('calculateDiff - properly filters for allowedKeys', t => {
    const oldData = {
        a: 'some value',
        b: [],
    };

    const newData = {
        a: 'some value',
        b: [
            { id: 'A', value: 1 },
            { id: 'B', value: 2 },
        ],
        no: 'some disallowed value',
        invalid: {
            field: 'disallowed nested value',
        },
    };

    const diff = calculateDiff(oldData, newData, {
        allowedKeys: new Set(['a', 'b']),
        pathsToItemArrays: ['b'],
    });

    t.deepEqual(diff, {
        b: {
            A: { id: 'A', value: 1, _index: 0 },
            B: { id: 'B', value: 2, _index: 1 },
        },
    });
});

test('calculateDiff - properly filters for ignorePaths in new data', t => {
    const oldData = {
        a: {
            b: {
                c: 'xyz',
            },
        },
    };

    const newData = {
        a: {
            b: {
                c: 'this update will be ignored',
                d: 'but this will be applied',
            },
        },
        x: 'also ignored',
        y: {
            nested: 'value is not ignored because the path is y.nested',
        },
    };

    const diff = calculateDiff(oldData, newData, {
        ignorePaths: new Set(['a.b.c', 'x', 'y']),
    });

    t.deepEqual(diff, {
        a: {
            b: {
                d: 'but this will be applied',
            },
        },
        y: {
            nested: 'value is not ignored because the path is y.nested',
        },
    });
});

test('calculateDiff - properly filters for ignorePaths in old data', t => {
    const oldData = {
        a: {
            b: {
                c: 'this will be kept',
                d: 'this will be removed',
            },
        },
        x: 'this will be kept',
        y: 'this will be removed',
    };

    const newData = {
        a: {
            b: {
                e: 'this will be added',
            },
        },
        z: 'this will be added',
    };

    const diff = calculateDiff(oldData, newData, {
        ignorePaths: new Set(['a.b.c', 'x']),
    });

    t.deepEqual(diff, {
        a: {
            b: {
                d: null,
                e: 'this will be added',
            },
        },
        y: null,
        z: 'this will be added',
    });
});

test('calculateDiff - calculates patch with empty objects', t => {
    const oldData = { a: 'some value', b: { key: 'value' } };

    const newData = { a: 'new value', b: { key: 'value' }, c: { d: {} } };

    const patch = calculateDiff(oldData, newData);

    t.deepEqual(patch, {
        a: 'new value',
        c: { d: {} },
    });
});

test('calculateDiff - calculates patch with empty arrays', t => {
    const oldData = { a: 'some value', b: { key: 'value' } };

    const newData = { a: 'new value', b: { key: 'value' }, c: { d: [] } };

    const patch = calculateDiff(oldData, newData);

    t.deepEqual(patch, {
        a: 'new value',
        c: { d: [] },
    });
});

test('calculateDiff - calculates patch with new arrays', t => {
    const oldData = { a: 'some value', b: { key: 'value' } };

    const newData = { a: 'new value', b: { key: 'value' }, c: { d: ['', ''] } };

    const patch = calculateDiff(oldData, newData);

    t.deepEqual(patch, {
        a: 'new value',
        c: { d: ['', ''] },
    });
});

test('calculateDiff - calculates patch with unchanged basic arrays', t => {
    const oldData = { a: 'some value', b: { key: 'value' }, c: { d: ['first', 'second'] } };

    const newData = { a: 'new value', b: { key: 'value' }, c: { d: ['first', 'second'] } };

    const patch = calculateDiff(oldData, newData);

    t.deepEqual(patch, {
        a: 'new value',
    });
});

test('calculateDiff - calculates patch with unchanged object arrays', t => {
    const oldData = {
        a: 'some value',
        b: { key: 'value' },
        c: { d: [{ a: 'first' }, { b: 'second', key: 'value' }] },
    };

    const newData = {
        a: 'new value',
        b: { key: 'value' },
        c: { d: [{ a: 'first' }, { b: 'second', key: 'value' }] },
    };

    const patch = calculateDiff(oldData, newData);

    t.deepEqual(patch, {
        a: 'new value',
    });
});

test('calculateDiff - calculates patch does not incldue unnecessary delete', t => {
    const oldData = { a: 'some value', b: { key: 'value' } };

    const newData = { a: 'new value', b: { key: 'value' }, c: { d: null } };

    const patch = calculateDiff(oldData, newData);

    t.deepEqual(patch, {
        a: 'new value',
    });
});

test('calculateDiff - calculates patch for deletion of explicitly undefined value', t => {
    const oldData = { a: 'some value', b: { key: 'value' }, c: { d: undefined } };

    const newData = { a: 'new value', b: { key: 'value' }, c: { d: null } };

    const patch = calculateDiff(oldData, newData);

    t.deepEqual(patch, {
        a: 'new value',
        c: { d: null },
    });
});

test('calculateDiff - calculates the correct diff (new deeply nested object)', t => {
    const oldData = { a: 'some value' };

    const newData = { a: 'some value', b: { c: { d: { e: {} } } } };

    const diff = calculateDiff(oldData, newData);

    t.deepEqual(diff, {
        b: { c: { d: { e: {} } } },
    });

    // make sure that the diff applied again as update to the CRDT yields the same object
    const crdt = new BaseJsonCRDT({ data: oldData });
    crdt.update(diff, '1-1');
    t.deepEqual(crdt.data(), newData);
});

test('calculateDiff - ignores date <-> string conversion if the underlying value is the same', t => {
    // String -> Date
    let diff = calculateDiff(
        { a: '2024-02-07T15:26:37.123Z' },
        { a: new Date('2024-02-07T15:26:37.123Z') }
    );

    t.deepEqual(diff, {});
    t.true(diff.a === undefined);

    // Date -> String
    diff = calculateDiff(
        { a: new Date('2024-02-07T15:26:37.123Z') },
        { a: '2024-02-07T15:26:37.123Z' }
    );

    t.deepEqual(diff, {});
    t.true(diff.a === undefined);
});

test('calculateDiff - includes date <-> string conversion if the underlying value is not the same', t => {
    // String -> Date                                                                                            ⌄ different milliseconds
    let diff = calculateDiff(
        { a: '2024-02-07T15:26:37.123Z' },
        { a: new Date('2024-02-07T15:26:37.456Z') }
    );

    t.deepEqual(diff, { a: new Date('2024-02-07T15:26:37.456Z') });

    // Date -> String
    diff = calculateDiff(
        { a: new Date('2024-02-07T15:26:37.123Z') },
        { a: '2024-02-07T15:26:37.456Z' }
    );

    t.deepEqual(diff, { a: '2024-02-07T15:26:37.456Z' });
});

test('calculateDiff - handles atomic value to nested object conversion', t => {
    const diff = calculateDiff({ a: 'string' }, { a: { b: { c: 1 } } });

    t.deepEqual(diff, { a: { b: { c: 1 } } });
});

test('calculateDiff - handles nested object to atomic value conversion', t => {
    const diff = calculateDiff({ a: { b: { c: 1 } } }, { a: 'string' });

    t.deepEqual(diff, { a: 'string' });
});

test('calculateDiff - handles deletion of nested object', t => {
    const diff = calculateDiff({ a: { b: { c: 1 } } }, {});

    t.deepEqual(diff, { a: null });
});

test('calculateDiff - override existing object with empty object explicitly deletes object content', t => {
    const oldData = { obj: { value: 'something' } };
    const newData = { obj: {} };
    t.deepEqual(calculateDiff(oldData, newData), { obj: { value: null } });
});

test('calculateDiff - creating empty object creates empty object diff', t => {
    const oldData = {};
    const newData = { obj: {} };
    t.deepEqual(calculateDiff(oldData, newData), { obj: {} });
});

test('calculateDiff - deleting an item array deletes all items but keeps the item array', t => {
    const oldData = {
        a: 'test',
        b: [
            { id: '1', value: 1 },
            { id: '2', value: 2 },
        ],
    };
    const newData = { a: '123' };

    const diff = calculateDiff(oldData, newData, { pathsToItemArrays: ['b'] });

    t.deepEqual(diff, {
        a: '123',
        b: {
            1: { _index: null },
            2: { _index: null },
        },
    });
});

test('calculateDiff - setting an item array to empty array deletes all items', t => {
    const oldData = {
        a: 'test',
        b: [
            { id: '1', value: 1 },
            { id: '2', value: 2 },
        ],
    };
    const newData = { a: '123', b: [] };

    const diff = calculateDiff(oldData, newData, { pathsToItemArrays: ['b'] });

    t.deepEqual(diff, {
        a: '123',
        b: {
            1: { _index: null },
            2: { _index: null },
        },
    });
});

test('calculateDiff - adding a new item without an id property to item array automatically generates a unique id', t => {
    const oldData = {
        a: 'test',
        b: [
            { id: '1', value: 1 },
            { id: '2', value: 2 },
        ],
    };
    const newData = {
        a: 'test',
        b: [{ id: '1', value: 1 }, { id: '2', value: 2 }, { value: 3 }],
    };

    const diff = calculateDiff(oldData, newData, { pathsToItemArrays: ['b'] });
    const generatedId = Object.keys(diff.b || {})[0];

    t.deepEqual(diff, {
        b: {
            [generatedId]: { id: generatedId, value: 3, _index: 2 },
        },
    });
});

test('calculateDiff - adding a new item with a duplicate id property to item array automatically generates a new unique id', t => {
    const oldData = {
        a: 'test',
        b: [
            { id: '1', value: 1 },
            { id: '2', value: 2 },
        ],
    };
    const newData = {
        a: 'test',
        b: [
            { id: '1', value: 1 },
            { id: '2', value: 2 },
            { value: 3, id: '1' }, // duplicate id
        ],
    };

    const diff = calculateDiff(oldData, newData, { pathsToItemArrays: ['b'] });
    const generatedId = Object.keys(diff.b || {})[0];
    t.not(generatedId, '1');

    t.deepEqual(diff, {
        b: {
            [generatedId]: { id: generatedId, value: 3, _index: 2 },
        },
    });
});

test('calculateDiff - deleting empty item array does not remove the item array as a whole', t => {
    const oldData = {
        a: 'test',
        b: [],
    };
    const newData = {
        a: 'test',
    };

    const diff = calculateDiff(oldData, newData, { pathsToItemArrays: ['b'] });

    t.deepEqual(diff, {});
});

test('calculateDiff - deleting nested empty item array and siblings does not remove the item array as a whole', t => {
    const oldData = {
        a: 'test',
        b: {
            c: [],
            d: 'test',
        },
    };
    const newData = {
        a: 'test',
    };

    const diff = calculateDiff(oldData, newData, { pathsToItemArrays: ['b.c'] });

    t.deepEqual(diff, {
        b: {
            d: null,
        },
    });
});

test('calculateDiff - removing an ancestor object deletes the ancestor and not the nested value (string)', t => {
    const oldData = {
        a: {
            b: {
                c: 'test',
            },
        },
    };
    const newData = {};

    const diff = calculateDiff(oldData, newData);

    t.deepEqual(diff, {
        a: null,
    });
});

test('calculateDiff - removing an ancestor object deletes the ancestor and not the nested value (array)', t => {
    const oldData = {
        a: {
            b: {
                c: [],
            },
        },
    };
    const newData = {};

    const diff = calculateDiff(oldData, newData);

    t.deepEqual(diff, {
        a: null,
    });
});
