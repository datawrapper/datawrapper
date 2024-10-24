import anyTest, { TestFn } from 'ava';
import { BaseJsonCRDT } from './BaseJsonCRDT.js';
import { Clock } from './Clock.js';
import sinon, { type SinonSandbox } from 'sinon';
import { TIMESTAMP_KEY } from './constants.js';

const test = anyTest as TestFn<{ sandbox: SinonSandbox }>;

test.beforeEach(t => {
    t.context.sandbox = sinon.createSandbox();
});

test.afterEach.always(t => {
    t.context.sandbox.restore();
});

test(`constructor - works with flat object`, t => {
    const crdt = new BaseJsonCRDT({ data: { a: 'some value', b: 2, c: 3 } });
    t.deepEqual(crdt.data(), { a: 'some value', b: 2, c: 3 });
});

test(`constructor - works with nested object`, t => {
    const crdt = new BaseJsonCRDT({ data: { a: { b: { c: { d: { e: { f: 1 } } } } } } });
    t.deepEqual(crdt.data(), { a: { b: { c: { d: { e: { f: 1 } } } } } });
});

test(`constructor - works with arrays`, t => {
    const crdt = new BaseJsonCRDT({ data: { a: [1, 2, 3], b: [4, 5, 6] } });
    t.deepEqual(crdt.data(), { a: [1, 2, 3], b: [4, 5, 6] });
});

test('_initData - filters out null values', t => {
    const crdt = new BaseJsonCRDT({ data: { a: null, b: { c: 'some value', d: null } } });
    t.deepEqual(crdt.data(), { b: { c: 'some value' } });
});

test(`data - returns immutable object`, t => {
    const crdt = new BaseJsonCRDT({ data: { a: 1, b: 2, c: 3 } });

    const data = crdt.data();
    t.not(data, crdt.data());

    data.a = 99;
    t.deepEqual(crdt.data(), { a: 1, b: 2, c: 3 });
});

test('data - returns data without null values', t => {
    const crdt = new BaseJsonCRDT({
        data: {
            key: {
                a: 1,
                b: null,
                c: {
                    d: null,
                    e: 2
                },
                f: false,
                g: 0,
                h: ''
            }
        }
    });

    t.deepEqual(crdt.data(), {
        key: {
            a: 1,
            c: {
                e: 2
            },
            f: false,
            g: 0,
            h: ''
        }
    });
});

test(`timestamps - returns immutable object`, t => {
    const crdt = new BaseJsonCRDT({ data: { a: 1, b: 2, c: 3 } });

    // perform update to be sure there are timestamps
    crdt.update({ a: 2, b: 3, c: 4 }, '1-1');

    const timestamps = crdt.timestamps();
    t.not(timestamps, crdt.timestamps());

    timestamps.a = { [TIMESTAMP_KEY]: '99-99' };
    t.deepEqual(crdt.timestamps(), {
        a: { [TIMESTAMP_KEY]: '1-1' },
        b: { [TIMESTAMP_KEY]: '1-1' },
        c: { [TIMESTAMP_KEY]: '1-1' }
    });
});

test('calculateDiff - calculates the correct patch (simple updates)', t => {
    const oldData = { a: 'some value', b: { key: 'value' } };

    const newData = { a: 'new value', b: { key: 'value' } };

    const diff = BaseJsonCRDT.calculateDiff(oldData, newData);

    t.deepEqual(diff, {
        a: 'new value'
    });

    // make sure that the diff applied again as update to the CRDT yields the same object
    const crdt = new BaseJsonCRDT({ data: oldData });
    crdt.update(diff, '1-1');
    t.deepEqual(crdt.data(), newData);
});

test('calculateDiff - calculates the correct diff (simple arrays)', t => {
    const oldData = { a: 'some value', b: ['A', 'B', 'C'] };

    const newData = { a: 'some value', b: ['D', 'C', 'E'] };

    const diff = BaseJsonCRDT.calculateDiff(oldData, newData);

    t.deepEqual(diff, {
        b: ['D', 'C', 'E']
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
            { id: 'C', value: 3 }
        ]
    };

    const newData = {
        a: 'some value',
        b: [
            { id: 'A', value: 1 },
            { id: 'B', value: 2 },
            { id: 'C', value: 99 }
        ]
    };

    const diff = BaseJsonCRDT.calculateDiff(oldData, newData, { pathsToItemArrays: ['b'] });

    t.deepEqual(diff, {
        b: { C: { value: 99 } }
    });
});

test('calculateDiff - calculates the correct patch (key deletion)', t => {
    const oldData = {
        a: 'some value',
        b: { key: 'value' }
    };

    const newData = {
        b: {}
    };

    const patch = BaseJsonCRDT.calculateDiff(oldData, newData);

    t.deepEqual(patch, { a: null, b: { key: null } });
});

test('calculateDiff - calculates the correct patch (parent deletion)', t => {
    const oldData = {
        a: 'some value',
        b: { key: 'value' }
    };

    const newData = {};

    const patch = BaseJsonCRDT.calculateDiff(oldData, newData);

    t.deepEqual(patch, { a: null, b: null });
});

test('calculateDiff - calculates the correct patch (item array - insertion at end)', t => {
    const oldData = {
        a: 'some value',
        b: [
            { id: 'A', value: 1 },
            { id: 'B', value: 2 },
            { id: 'C', value: 3 }
        ]
    };

    const newData = {
        a: 'some value',
        b: [
            { id: 'A', value: 1 },
            { id: 'B', value: 2 },
            { id: 'C', value: 3 },
            { id: 'D', value: 4 }
        ]
    };

    const diff = BaseJsonCRDT.calculateDiff(oldData, newData, { pathsToItemArrays: ['b'] });

    t.deepEqual(diff, {
        b: { D: { id: 'D', value: 4, _index: 3 } }
    });
});

test('calculateDiff - calculates the correct diff (item array - insertion at start)', t => {
    const oldData = {
        a: 'some value',
        b: [
            { id: 'A', value: 1 },
            { id: 'B', value: 2 },
            { id: 'C', value: 3 }
        ]
    };

    const newData = {
        a: 'some value',
        b: [
            { id: 'D', value: 4 },
            { id: 'A', value: 1 },
            { id: 'B', value: 2 },
            { id: 'C', value: 3 }
        ]
    };

    const diff = BaseJsonCRDT.calculateDiff(oldData, newData, { pathsToItemArrays: ['b'] });

    t.deepEqual(diff, {
        b: {
            D: { id: 'D', value: 4, _index: 0 },
            A: { _index: 1 },
            B: { _index: 2 },
            C: { _index: 3 }
        }
    });
});

test('calculateDiff - calculates the correct diff (item array - insertion in middle)', t => {
    const oldData = {
        a: 'some value',
        b: [
            { id: 'A', value: 1 },
            { id: 'B', value: 2 },
            { id: 'C', value: 3 }
        ]
    };

    const newData = {
        a: 'some value',
        b: [
            { id: 'A', value: 1 },
            { id: 'B', value: 2 },
            { id: 'D', value: 4 },
            { id: 'C', value: 3 }
        ]
    };

    const diff = BaseJsonCRDT.calculateDiff(oldData, newData, { pathsToItemArrays: ['b'] });

    t.deepEqual(diff, {
        b: {
            D: { id: 'D', value: 4, _index: 2 },
            C: { _index: 3 }
        }
    });
});

test('calculateDiff - calculates the correct diff (item array - deletion at end)', t => {
    const oldData = {
        a: 'some value',
        b: [
            { id: 'A', value: 1 },
            { id: 'B', value: 2 },
            { id: 'C', value: 3 }
        ]
    };

    const newData = {
        a: 'some value',
        b: [
            { id: 'A', value: 1 },
            { id: 'B', value: 2 }
        ]
    };

    const diff = BaseJsonCRDT.calculateDiff(oldData, newData, { pathsToItemArrays: ['b'] });

    t.deepEqual(diff, {
        b: {
            C: { _index: null }
        }
    });
});

test('calculateDiff - calculates the correct diff (item array - deletion at beginning)', t => {
    const oldData = {
        a: 'some value',
        b: [
            { id: 'A', value: 1 },
            { id: 'B', value: 2 },
            { id: 'C', value: 3 }
        ]
    };

    const newData = {
        a: 'some value',
        b: [
            { id: 'B', value: 2 },
            { id: 'C', value: 3 }
        ]
    };

    const diff = BaseJsonCRDT.calculateDiff(oldData, newData, { pathsToItemArrays: ['b'] });

    t.deepEqual(diff, {
        b: {
            A: { _index: null },
            B: { _index: 0 },
            C: { _index: 1 }
        }
    });
});

test('calculateDiff - calculates the correct diff (item array - deletion in the middle)', t => {
    const oldData = {
        a: 'some value',
        b: [
            { id: 'A', value: 1 },
            { id: 'B', value: 2 },
            { id: 'C', value: 3 }
        ]
    };

    const newData = {
        a: 'some value',
        b: [
            { id: 'A', value: 1 },
            { id: 'C', value: 3 }
        ]
    };

    const diff = BaseJsonCRDT.calculateDiff(oldData, newData, { pathsToItemArrays: ['b'] });

    t.deepEqual(diff, {
        b: {
            B: { _index: null },
            C: { _index: 1 }
        }
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
                { id: 'C', value: 3 }
            ],
            e: 'bar',
            h: [1, 2, 3]
        },
        'c.2': {
            f: 'baz',
            g: [1, 2, 3]
        },
        d: [1, 2, 3]
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
        a: 'some value'
    };

    const diff = BaseJsonCRDT.calculateDiff(oldData, newData, { pathsToItemArrays: ['b.d'] });

    t.deepEqual(diff, {
        b: {
            c: null,
            d: {
                A: { _index: null },
                B: { _index: null },
                C: { _index: null }
            },
            e: null,
            h: null
        },
        'c.2': null,
        d: null
    });
});

test('calculateDiff - calculates the correct diff (item array - re-ordering two elements)', t => {
    const oldData = {
        a: 'some value',
        b: [
            { id: 'A', value: 1 },
            { id: 'B', value: 2 },
            { id: 'C', value: 3 },
            { id: 'D', value: 4 }
        ]
    };

    const newData = {
        a: 'some value',
        b: [
            { id: 'B', value: 2 },
            { id: 'A', value: 1 },
            { id: 'C', value: 3 },
            { id: 'D', value: 4 }
        ]
    };

    const diff = BaseJsonCRDT.calculateDiff(oldData, newData, { pathsToItemArrays: ['b'] });

    t.deepEqual(diff, {
        b: {
            A: { _index: 1 },
            B: { _index: 0 }
        }
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
            { id: 'D', value: 4 }
        ]
    };

    const newData = {
        a: 'some value',
        b: [
            { id: 'D', value: 4 },
            { id: 'C', value: 3 },
            { id: 'A', value: 1 },
            { id: 'B', value: 2 }
        ]
    };

    const diff = BaseJsonCRDT.calculateDiff(oldData, newData, { pathsToItemArrays: ['b'] });

    t.deepEqual(diff, {
        b: {
            A: { _index: 2 },
            B: { _index: 3 },
            C: { _index: 1 },
            D: { _index: 0 }
        }
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
                { id: 'C', value: 3 }
            ],
            e: 'bar',
            h: [1, 2, 3]
        },
        'c.2': {
            f: 'baz',
            g: [1, 2, 3]
        },
        d: [1, 2, 3]
    };

    const newData = {
        a: 'some value',
        b: {
            d: [
                { id: 'C', value: 5 },
                { id: 2, value: 'a new value' }
            ]
        }
    };

    const diff = BaseJsonCRDT.calculateDiff(oldData, newData, { pathsToItemArrays: ['b.d'] });

    t.deepEqual(diff, {
        b: {
            c: null,
            d: {
                1: { _index: null },
                C: { _index: 0, value: 5 },
                2: { value: 'a new value' }
            },
            e: null,
            h: null
        },
        'c.2': null,
        d: null
    });
});

test('calculateDiff - calculates the correct diff (empty array - to filled array)', t => {
    const oldData = {
        a: 'some value',
        b: []
    };

    const newData = {
        a: 'some value',
        b: [
            { id: 'A', value: 1 },
            { id: 'B', value: 2 }
        ]
    };

    const diff = BaseJsonCRDT.calculateDiff(oldData, newData, { pathsToItemArrays: ['b'] });

    t.deepEqual(diff, {
        b: {
            A: { id: 'A', value: 1, _index: 0 },
            B: { id: 'B', value: 2, _index: 1 }
        }
    });
});

test('calculateDiff - calculates the correct diff (atomic array remains an atomic array even if some items contain an ID)', t => {
    const oldData = {
        a: 'some value',
        b: [1, 2, 3]
    };

    const newData = {
        a: 'some value',
        b: [1, { id: 'B', value: 2 }]
    };

    const diff = BaseJsonCRDT.calculateDiff(oldData, newData);

    t.deepEqual(diff, {
        b: [1, { id: 'B', value: 2 }]
    });
});

test('calculateDiff - atomic arrays can be turned into atomic arrays that look like item arrays', t => {
    const oldData = {
        a: 'some value',
        b: [1, 2, 3]
    };

    const newData = {
        a: 'some value',
        b: [{ id: 'B', value: 2 }]
    };

    const diff = BaseJsonCRDT.calculateDiff(oldData, newData);

    t.deepEqual(diff, {
        b: [{ id: 'B', value: 2 }]
    });
});

test('calculateDiff - properly filters for allowedKeys', t => {
    const oldData = {
        a: 'some value',
        b: []
    };

    const newData = {
        a: 'some value',
        b: [
            { id: 'A', value: 1 },
            { id: 'B', value: 2 }
        ],
        no: 'some disallowed value',
        invalid: {
            field: 'disallowed nested value'
        }
    };

    const diff = BaseJsonCRDT.calculateDiff(oldData, newData, {
        allowedKeys: new Set(['a', 'b']),
        pathsToItemArrays: ['b']
    });

    t.deepEqual(diff, {
        b: {
            A: { id: 'A', value: 1, _index: 0 },
            B: { id: 'B', value: 2, _index: 1 }
        }
    });
});

test('calculateDiff - properly filters for ignorePaths in new data', t => {
    const oldData = {
        a: {
            b: {
                c: 'xyz'
            }
        }
    };

    const newData = {
        a: {
            b: {
                c: 'this update will be ignored',
                d: 'but this will be applied'
            }
        },
        x: 'also ignored',
        y: {
            nested: 'value is not ignored because the path is y.nested'
        }
    };

    const diff = BaseJsonCRDT.calculateDiff(oldData, newData, {
        ignorePaths: new Set(['a.b.c', 'x', 'y'])
    });

    t.deepEqual(diff, {
        a: {
            b: {
                d: 'but this will be applied'
            }
        },
        y: {
            nested: 'value is not ignored because the path is y.nested'
        }
    });
});

test('calculateDiff - properly filters for ignorePaths in old data', t => {
    const oldData = {
        a: {
            b: {
                c: 'this will be kept',
                d: 'this will be removed'
            }
        },
        x: 'this will be kept',
        y: 'this will be removed'
    };

    const newData = {
        a: {
            b: {
                e: 'this will be added'
            }
        },
        z: 'this will be added'
    };

    const diff = BaseJsonCRDT.calculateDiff(oldData, newData, {
        ignorePaths: new Set(['a.b.c', 'x'])
    });

    t.deepEqual(diff, {
        a: {
            b: {
                d: null,
                e: 'this will be added'
            }
        },
        y: null,
        z: 'this will be added'
    });
});

test('calculateDiff - calculates patch with empty objects', t => {
    const oldData = { a: 'some value', b: { key: 'value' } };

    const newData = { a: 'new value', b: { key: 'value' }, c: { d: {} } };

    const patch = BaseJsonCRDT.calculateDiff(oldData, newData);

    t.deepEqual(patch, {
        a: 'new value',
        c: { d: {} }
    });
});

test('calculateDiff - calculates patch with empty arrays', t => {
    const oldData = { a: 'some value', b: { key: 'value' } };

    const newData = { a: 'new value', b: { key: 'value' }, c: { d: [] } };

    const patch = BaseJsonCRDT.calculateDiff(oldData, newData);

    t.deepEqual(patch, {
        a: 'new value',
        c: { d: [] }
    });
});

test('calculateDiff - calculates patch with new arrays', t => {
    const oldData = { a: 'some value', b: { key: 'value' } };

    const newData = { a: 'new value', b: { key: 'value' }, c: { d: ['', ''] } };

    const patch = BaseJsonCRDT.calculateDiff(oldData, newData);

    t.deepEqual(patch, {
        a: 'new value',
        c: { d: ['', ''] }
    });
});

test('calculateDiff - calculates patch with unchanged basic arrays', t => {
    const oldData = { a: 'some value', b: { key: 'value' }, c: { d: ['first', 'second'] } };

    const newData = { a: 'new value', b: { key: 'value' }, c: { d: ['first', 'second'] } };

    const patch = BaseJsonCRDT.calculateDiff(oldData, newData);

    t.deepEqual(patch, {
        a: 'new value'
    });
});

test('calculateDiff - calculates patch with unchanged object arrays', t => {
    const oldData = {
        a: 'some value',
        b: { key: 'value' },
        c: { d: [{ a: 'first' }, { b: 'second', key: 'value' }] }
    };

    const newData = {
        a: 'new value',
        b: { key: 'value' },
        c: { d: [{ a: 'first' }, { b: 'second', key: 'value' }] }
    };

    const patch = BaseJsonCRDT.calculateDiff(oldData, newData);

    t.deepEqual(patch, {
        a: 'new value'
    });
});

test('calculateDiff - calculates patch does not incldue unnecessary delete', t => {
    const oldData = { a: 'some value', b: { key: 'value' } };

    const newData = { a: 'new value', b: { key: 'value' }, c: { d: null } };

    const patch = BaseJsonCRDT.calculateDiff(oldData, newData);

    t.deepEqual(patch, {
        a: 'new value'
    });
});

test('calculateDiff - calculates patch for deletion of explicitly undefined value', t => {
    const oldData = { a: 'some value', b: { key: 'value' }, c: { d: undefined } };

    const newData = { a: 'new value', b: { key: 'value' }, c: { d: null } };

    const patch = BaseJsonCRDT.calculateDiff(oldData, newData);

    t.deepEqual(patch, {
        a: 'new value',
        c: { d: null }
    });
});

test('calculateDiff - calculates the correct diff (new deeply nested object)', t => {
    const oldData = { a: 'some value' };

    const newData = { a: 'some value', b: { c: { d: { e: {} } } } };

    const diff = BaseJsonCRDT.calculateDiff(oldData, newData);

    t.deepEqual(diff, {
        b: { c: { d: { e: {} } } }
    });

    // make sure that the diff applied again as update to the CRDT yields the same object
    const crdt = new BaseJsonCRDT({ data: oldData });
    crdt.update(diff, '1-1');
    t.deepEqual(crdt.data(), newData);
});

test('calculateDiff - ignores date <-> string conversion if the underlying value is the same', t => {
    // String -> Date
    let diff = BaseJsonCRDT.calculateDiff(
        { a: '2024-02-07T15:26:37.123Z' },
        { a: new Date('2024-02-07T15:26:37.123Z') }
    );

    t.deepEqual(diff, {});
    t.true(diff.a === undefined);

    // Date -> String
    diff = BaseJsonCRDT.calculateDiff(
        { a: new Date('2024-02-07T15:26:37.123Z') },
        { a: '2024-02-07T15:26:37.123Z' }
    );

    t.deepEqual(diff, {});
    t.true(diff.a === undefined);
});

test('calculateDiff - includes date <-> string conversion if the underlying value is not the same', t => {
    // String -> Date                                                                                            ⌄ different milliseconds
    let diff = BaseJsonCRDT.calculateDiff(
        { a: '2024-02-07T15:26:37.123Z' },
        { a: new Date('2024-02-07T15:26:37.456Z') }
    );

    t.deepEqual(diff, { a: new Date('2024-02-07T15:26:37.456Z') });

    // Date -> String
    diff = BaseJsonCRDT.calculateDiff(
        { a: new Date('2024-02-07T15:26:37.123Z') },
        { a: '2024-02-07T15:26:37.456Z' }
    );

    t.deepEqual(diff, { a: '2024-02-07T15:26:37.456Z' });
});

test('calculateDiff - handles atomic value to nested object conversion', t => {
    const diff = BaseJsonCRDT.calculateDiff({ a: 'string' }, { a: { b: { c: 1 } } });

    t.deepEqual(diff, { a: { b: { c: 1 } } });
});

test('calculateDiff - handles nested object to atomic value conversion', t => {
    const diff = BaseJsonCRDT.calculateDiff({ a: { b: { c: 1 } } }, { a: 'string' });

    t.deepEqual(diff, { a: 'string' });
});

test('calculateDiff - handles deletion of nested object', t => {
    const diff = BaseJsonCRDT.calculateDiff({ a: { b: { c: 1 } } }, {});

    t.deepEqual(diff, { a: null });
});

test('calculateDiff: override existing object with empty object explicitly deletes object content', t => {
    const oldData = { obj: { value: 'something' } };
    const newData = { obj: {} };
    t.deepEqual(BaseJsonCRDT.calculateDiff(oldData, newData), { obj: { value: null } });
});

test('calculateDiff: creating empty object creates empty object diff', t => {
    const oldData = {};
    const newData = { obj: {} };
    t.deepEqual(BaseJsonCRDT.calculateDiff(oldData, newData), { obj: {} });
});

test('calculateDiff: deleting an item array deletes all items but keeps the item array', t => {
    const oldData = {
        a: 'test',
        b: [
            { id: '1', value: 1 },
            { id: '2', value: 2 }
        ]
    };
    const newData = { a: '123' };

    const diff = BaseJsonCRDT.calculateDiff(oldData, newData, { pathsToItemArrays: ['b'] });

    t.deepEqual(diff, {
        a: '123',
        b: {
            1: { _index: null },
            2: { _index: null }
        }
    });
});

test('calculateDiff: setting an item array to empty array deletes all items', t => {
    const oldData = {
        a: 'test',
        b: [
            { id: '1', value: 1 },
            { id: '2', value: 2 }
        ]
    };
    const newData = { a: '123', b: [] };

    const diff = BaseJsonCRDT.calculateDiff(oldData, newData, { pathsToItemArrays: ['b'] });

    t.deepEqual(diff, {
        a: '123',
        b: {
            1: { _index: null },
            2: { _index: null }
        }
    });
});

test('calculateDiff: adding a new item without an id property to item array automatically generates a unique id', t => {
    const oldData = {
        a: 'test',
        b: [
            { id: '1', value: 1 },
            { id: '2', value: 2 }
        ]
    };
    const newData = {
        a: 'test',
        b: [{ id: '1', value: 1 }, { id: '2', value: 2 }, { value: 3 }]
    };

    const diff = BaseJsonCRDT.calculateDiff(oldData, newData, { pathsToItemArrays: ['b'] });
    const generatedId = Object.keys(diff.b || {})[0];

    t.deepEqual(diff, {
        b: {
            [generatedId]: { id: generatedId, value: 3, _index: 2 }
        }
    });
});

test('calculateDiff: deleting empty item array does not remove the item array as a whole', t => {
    const oldData = {
        a: 'test',
        b: []
    };
    const newData = {
        a: 'test'
    };

    const diff = BaseJsonCRDT.calculateDiff(oldData, newData, { pathsToItemArrays: ['b'] });

    t.deepEqual(diff, {});
});

test('calculateDiff: deleting nested empty item array and siblings does not remove the item array as a whole', t => {
    const oldData = {
        a: 'test',
        b: {
            c: [],
            d: 'test'
        }
    };
    const newData = {
        a: 'test'
    };

    const diff = BaseJsonCRDT.calculateDiff(oldData, newData, { pathsToItemArrays: ['b.c'] });

    t.deepEqual(diff, {
        b: {
            d: null
        }
    });
});

test('calculateDiff: removing an ancestor object deletes the ancestor and not the nested value (string)', t => {
    const oldData = {
        a: {
            b: {
                c: 'test'
            }
        }
    };
    const newData = {};

    const diff = BaseJsonCRDT.calculateDiff(oldData, newData);

    t.deepEqual(diff, {
        a: null
    });
});

test('calculateDiff: removing an ancestor object deletes the ancestor and not the nested value (array)', t => {
    const oldData = {
        a: {
            b: {
                c: []
            }
        }
    };
    const newData = {};

    const diff = BaseJsonCRDT.calculateDiff(oldData, newData);

    t.deepEqual(diff, {
        a: null
    });
});

test('basic serialization and re-initialization', t => {
    const crdt = new BaseJsonCRDT({
        data: {
            a: 'some value',
            b: [
                { id: '1', value: 1 },
                { id: '2', value: 2 }
            ]
        }
    });

    const serialized = crdt.serialize();
    const crdt2 = BaseJsonCRDT.fromSerialized(serialized);

    t.deepEqual(crdt, crdt2);
});

test('fromSerialized - works after item array deletion', t => {
    const crdt = new BaseJsonCRDT({
        data: {
            a: 'some value',
            b: [
                { id: '1', value: 1 },
                { id: '2', value: 2 }
            ]
        },
        pathsToItemArrays: ['b']
    });

    // delete one item
    crdt.update({ b: { '1': { id: '1', _index: null } } }, '1-1');

    // re-initialize with timestamps
    const crdt2 = BaseJsonCRDT.fromSerialized(crdt.serialize());
    t.deepEqual(crdt2.data(), { a: 'some value', b: [{ id: '2', value: 2 }] });

    // re inserted item is ignored
    crdt2.update({ b: { '1': { value: 9, _index: 0 } } }, '1-2');
    t.deepEqual(crdt2.data(), { a: 'some value', b: [{ id: '2', value: 2 }] });
});

test('pathsToItemArrays does not change, even if array that could be item array is added to the crdt,', t => {
    const crdt = new BaseJsonCRDT({
        data: {
            a: 'some value',
            arr: [
                { id: '1', value: 1 },
                { id: '2', value: 2 }
            ]
        }
    });

    t.deepEqual(crdt.serialize().pathsToItemArrays, []);
});

test('_getTimestamp returns timestamp at exact path', t => {
    const crdt = new BaseJsonCRDT<object>({
        data: {
            a: {
                b: {
                    c: 1
                }
            },
            x: 3
        },
        timestamps: {
            a: {
                [TIMESTAMP_KEY]: '1-1',
                b: {
                    c: {
                        [TIMESTAMP_KEY]: '1-2'
                    }
                }
            },
            x: {
                [TIMESTAMP_KEY]: '1-3'
            }
        },
        pathsToItemArrays: []
    });

    t.deepEqual(crdt._getTimestamp(['a', 'b', 'c']), '1-2');
    t.deepEqual(crdt._getTimestamp(['a', 'b']), undefined);
    t.deepEqual(crdt._getTimestamp(['a']), '1-1');
    t.deepEqual(crdt._getTimestamp(['a', 'b', 'c', 'd']), undefined);
    t.deepEqual(crdt._getTimestamp(['x']), '1-3');
    t.deepEqual(crdt._getTimestamp(['y']), undefined);
    t.deepEqual(crdt._getTimestamp(['x', 'y']), undefined);
    t.deepEqual(crdt._getTimestamp([]), undefined);
});

test('_getTimestamps returns timestamps object at path (including children)', t => {
    const crdt = new BaseJsonCRDT<object>({
        data: {
            a: {
                b: {
                    c: 1
                }
            },
            x: 3
        },
        timestamps: {
            a: {
                [TIMESTAMP_KEY]: '1-1',
                b: {
                    c: {
                        [TIMESTAMP_KEY]: '1-2'
                    }
                }
            },
            x: {
                [TIMESTAMP_KEY]: '1-3'
            }
        },
        pathsToItemArrays: []
    });

    t.deepEqual(crdt._getTimestamps(['a', 'b', 'c']), {
        [TIMESTAMP_KEY]: '1-2'
    });
    t.deepEqual(crdt._getTimestamps(['a', 'b']), {
        c: {
            [TIMESTAMP_KEY]: '1-2'
        }
    });
    t.deepEqual(crdt._getTimestamps(['a']), {
        [TIMESTAMP_KEY]: '1-1',
        b: {
            c: {
                [TIMESTAMP_KEY]: '1-2'
            }
        }
    });
    t.deepEqual(crdt._getTimestamps(['a', 'b', 'c', 'd']), undefined);
    t.deepEqual(crdt._getTimestamps(['x']), {
        [TIMESTAMP_KEY]: '1-3'
    });
    t.deepEqual(crdt._getTimestamps(['y']), undefined);
    t.deepEqual(crdt._getTimestamps(['x', 'y']), undefined);
    t.deepEqual(crdt._getTimestamps([]), undefined);
});

test('_getClock always returns clock instance at exact path or minimum clock', t => {
    const crdt = new BaseJsonCRDT<object>({
        data: {
            a: {
                b: {
                    c: 1
                }
            },
            x: 3
        },
        timestamps: {
            a: {
                [TIMESTAMP_KEY]: '1-1',
                b: {
                    c: {
                        [TIMESTAMP_KEY]: '1-2'
                    }
                }
            },
            x: {
                [TIMESTAMP_KEY]: '1-3'
            }
        },
        pathsToItemArrays: []
    });

    t.deepEqual(crdt._getClock(['a', 'b', 'c']), new Clock('1-2'));
    t.deepEqual(crdt._getClock(['a', 'b']), new Clock());
    t.deepEqual(crdt._getClock(['a']), new Clock('1-1'));
    t.deepEqual(crdt._getClock(['a', 'b', 'c', 'd']), new Clock());
    t.deepEqual(crdt._getClock(['x']), new Clock('1-3'));
    t.deepEqual(crdt._getClock(['y']), new Clock());
    t.deepEqual(crdt._getClock(['x', 'y']), new Clock());
    t.deepEqual(crdt._getClock([]), new Clock());
});

test('_updateValue - updates existing atomic value', t => {
    const { sandbox } = t.context;

    const crdt = new BaseJsonCRDT({
        data: {
            a: 1,
            b: {
                c: {
                    d: [],
                    e: 'test'
                },
                f: false
            }
        }
    });

    const stub = sandbox.spy(crdt);

    crdt._updateValue(['a'], 2, '1-1');
    t.is(stub._updateExistingAtomicValue.callCount, 1);
    t.deepEqual(crdt.data(), { a: 2, b: { c: { d: [], e: 'test' }, f: false } });

    crdt._updateValue(['b', 'c', 'd'], [1, 2, 3], '1-2');
    t.is(stub._updateExistingAtomicValue.callCount, 2);
    t.deepEqual(crdt.data(), { a: 2, b: { c: { d: [1, 2, 3], e: 'test' }, f: false } });

    crdt._updateValue(['b', 'c', 'e'], 'new', '1-3');
    t.is(stub._updateExistingAtomicValue.callCount, 3);
    t.deepEqual(crdt.data(), { a: 2, b: { c: { d: [1, 2, 3], e: 'new' }, f: false } });

    crdt._updateValue(['b', 'f'], true, '1-4');
    t.is(stub._updateExistingAtomicValue.callCount, 4);
    t.deepEqual(crdt.data(), { a: 2, b: { c: { d: [1, 2, 3], e: 'new' }, f: true } });
});

test('_updateValue - updates item array index', t => {
    const { sandbox } = t.context;

    const crdt = new BaseJsonCRDT({
        data: {
            a: 1,
            b: [
                {
                    id: 'c',
                    d: [],
                    e: 'test'
                },
                {
                    id: 'd',
                    d: [],
                    e: 'test123'
                }
            ]
        },
        pathsToItemArrays: ['b']
    });

    const stub = sandbox.spy(crdt);

    crdt._updateValue(['b', 'c', '_index'], 2, '1-1');
    t.is(stub._updateItemArrayIndex.callCount, 1);

    crdt._updateValue(['b', 'd', '_index'], 0, '1-2');
    t.is(stub._updateItemArrayIndex.callCount, 2);

    t.deepEqual(crdt.data(), {
        a: 1,
        b: [
            {
                id: 'd',
                d: [],
                e: 'test123'
            },
            {
                id: 'c',
                d: [],
                e: 'test'
            }
        ]
    });
});

test('_updateValue - updates an object', t => {
    const { sandbox } = t.context;

    const crdt = new BaseJsonCRDT({
        data: {
            a: 1,
            b: {
                c: {
                    d: 1
                }
            }
        }
    });

    const stub = sandbox.spy(crdt);

    crdt._updateValue(['b', 'c'], 'test', '1-1');
    t.is(stub._updateObject.callCount, 1);
    t.deepEqual(crdt.data(), { a: 1, b: { c: 'test' } });

    crdt._updateValue(['b'], [], '1-2');
    t.is(stub._updateObject.callCount, 2);
    t.deepEqual(crdt.data(), { a: 1, b: [] });
});

test('_updateValue - inserts a new value into existing object', t => {
    const { sandbox } = t.context;

    const crdt = new BaseJsonCRDT({
        data: {
            a: 1,
            b: {
                b1: {
                    b2: 1
                }
            }
        }
    });

    const stub = sandbox.spy(crdt);

    // Root insert
    crdt._updateValue(['c'], 'test', '1-1');
    t.is(stub._insertNewValue.callCount, 1);
    t.deepEqual(crdt.data(), { a: 1, b: { b1: { b2: 1 } }, c: 'test' });

    // Insert into existing object
    crdt._updateValue(['b', 'b1', 'b1a'], 123, '1-2');
    t.is(stub._insertNewValue.callCount, 2);
    t.deepEqual(crdt.data(), { a: 1, b: { b1: { b2: 1, b1a: 123 } }, c: 'test' });

    // Deeply nested insert
    crdt._updateValue(['b', 'b1', 'c1', 'c2', 'c3'], [1, 2, 3], '1-3');
    t.is(stub._insertNewValue.callCount, 3);
    t.deepEqual(crdt.data(), {
        a: 1,
        b: { b1: { b2: 1, b1a: 123, c1: { c2: { c3: [1, 2, 3] } } } },
        c: 'test'
    });
});

test('_updateValue - inserts new value replacing atomic ancestor', t => {
    const { sandbox } = t.context;

    const crdt = new BaseJsonCRDT({
        data: {
            a: 1,
            b: {
                b1: {
                    b2: 1
                }
            }
        }
    });

    const stub = sandbox.spy(crdt);

    crdt._updateValue(['b', 'b1', 'b2', 'b3'], 'test', '1-1');
    t.is(stub._insertNewValue.callCount, 1);
    t.deepEqual(crdt.data(), { a: 1, b: { b1: { b2: { b3: 'test' } } } });

    crdt._updateValue(['a', 'a1', 'a2'], 123, '1-2');
    t.is(stub._insertNewValue.callCount, 2);
    t.deepEqual(crdt.data(), { a: { a1: { a2: 123 } }, b: { b1: { b2: { b3: 'test' } } } });
});

test('_updateValue - multiple calls replacing atomic ancestor only modifies it once', t => {
    const { sandbox } = t.context;

    const crdt = new BaseJsonCRDT({
        data: {
            a: 1
        }
    });

    const stub = sandbox.spy(crdt);

    crdt._updateValue(['a', 'b', 'c'], 'test', '1-1');
    crdt._updateValue(['a', 'b', 'e'], 'test', '1-1');

    t.is(stub._insertNewValue.callCount, 2);
});

test('_partialDelete - deletes outdated child values and keeps newer ones', t => {
    const crdt = new BaseJsonCRDT<object>({
        data: {
            a: {
                b: {
                    c: {
                        d: 1
                    },
                    e: 2
                },
                f: 3
            }
        },
        timestamps: {
            a: {
                b: {
                    c: {
                        [TIMESTAMP_KEY]: '1-1',
                        d: {
                            [TIMESTAMP_KEY]: '1-2'
                        }
                    },
                    e: {
                        [TIMESTAMP_KEY]: '1-5'
                    }
                },
                f: {
                    [TIMESTAMP_KEY]: '1-3'
                }
            }
        },
        pathsToItemArrays: []
    });

    crdt._partialDelete({ path: ['a', 'b'], newTimestamp: '1-4' });

    t.deepEqual(crdt.data(), {
        a: {
            b: {
                e: 2
            },
            f: 3
        }
    });
});

test('_partialDelete - updates timestamps of deleted values', t => {
    const crdt = new BaseJsonCRDT<object>({
        data: {
            a: {
                b: {
                    c: {
                        d: 1
                    },
                    e: 2
                },
                f: 3
            }
        },
        timestamps: {
            a: {
                b: {
                    c: {
                        [TIMESTAMP_KEY]: '1-1',
                        d: {
                            [TIMESTAMP_KEY]: '1-2'
                        }
                    },
                    e: {
                        [TIMESTAMP_KEY]: '1-5'
                    }
                },
                f: {
                    [TIMESTAMP_KEY]: '1-3'
                }
            }
        },
        pathsToItemArrays: []
    });

    crdt._partialDelete({ path: ['a', 'b'], newTimestamp: '1-4' });

    t.deepEqual(crdt.timestamps(), {
        a: {
            b: {
                c: {
                    [TIMESTAMP_KEY]: '1-4',
                    d: {
                        [TIMESTAMP_KEY]: '1-4'
                    }
                },
                e: {
                    [TIMESTAMP_KEY]: '1-5'
                }
            },
            f: {
                [TIMESTAMP_KEY]: '1-3'
            }
        }
    });
});

test('_partialDelete - removes empty parent objects of deleted children', t => {
    const crdt = new BaseJsonCRDT<object>({
        data: {
            a: {
                b: {
                    c: {
                        d: 1
                    },
                    e: 2,
                    f: {
                        g: {
                            h: 3
                        },
                        i: 4
                    },
                    j: 5
                }
            }
        },
        timestamps: {
            a: {
                b: {
                    c: {
                        [TIMESTAMP_KEY]: '1-1',
                        d: {
                            [TIMESTAMP_KEY]: '1-2'
                        }
                    },
                    e: {
                        [TIMESTAMP_KEY]: '1-5'
                    },
                    f: {
                        g: {
                            [TIMESTAMP_KEY]: '1-2',
                            h: {
                                [TIMESTAMP_KEY]: '1-3'
                            }
                        },
                        i: {
                            [TIMESTAMP_KEY]: '1-4'
                        }
                    },
                    j: {
                        [TIMESTAMP_KEY]: '1-12'
                    }
                }
            }
        },
        pathsToItemArrays: []
    });

    crdt._partialDelete({ path: ['a', 'b'], newTimestamp: '1-9' });

    t.deepEqual(crdt.data(), {
        a: {
            b: {
                j: 5
            }
        }
    });
});

test('_partialDelete - removes empty parent objects of deleted children only up to the path it was called on', t => {
    const crdt = new BaseJsonCRDT<object>({
        data: {
            a: {
                b: {
                    c: {
                        d: 1
                    }
                }
            }
        },
        timestamps: {
            a: {
                b: {
                    c: {
                        [TIMESTAMP_KEY]: '1-1',
                        d: {
                            [TIMESTAMP_KEY]: '1-2'
                        }
                    }
                }
            }
        },
        pathsToItemArrays: []
    });

    crdt._partialDelete({ path: ['a', 'b'], newTimestamp: '1-9' });

    t.deepEqual(crdt.data(), {
        a: {
            // Even though `b` is empty, it is not removed,
            //  because the partial deletion was called on `b`
            b: {}
        }
    });
});
