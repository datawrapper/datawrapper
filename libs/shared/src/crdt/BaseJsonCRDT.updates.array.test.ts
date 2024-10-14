import test from 'ava';
import { BaseJsonCRDT } from './BaseJsonCRDT.js';
import cloneDeep from 'lodash/cloneDeep';

test(`value arrays are treated as atomic arrays in basic updates`, t => {
    const crdt = new BaseJsonCRDT({ a: [1, 2, 3] });
    crdt.update({ a: [3, 4] }, '1-1');
    t.deepEqual(crdt.data(), {
        a: [3, 4]
    });
});

test(`value arrays are treated as atomic arrays for nested arrays`, t => {
    const crdt = new BaseJsonCRDT({ a: [1, 2, [4, 6]] });
    crdt.update({ a: [1, [2, 3], 4] }, '1-1');
    t.deepEqual(crdt.data(), {
        a: [1, [2, 3], 4]
    });
});

test(`object arrays without ID are treated as atomic arrays`, t => {
    const crdt = new BaseJsonCRDT({ a: [{ a: 1 }, { b: 2 }] });
    crdt.update({ a: [{ a: 1 }, { b: 2 }, { c: 3 }] }, '1-1');
    t.deepEqual(crdt.data(), {
        a: [{ a: 1 }, { b: 2 }, { c: 3 }]
    });
});

test(`item array initalization`, t => {
    const crdt = new BaseJsonCRDT({
        arr: [
            { id: 'A', val: 1 },
            { id: 'B', val: 2 }
        ]
    });
    t.deepEqual(crdt.data(), {
        arr: [
            { id: 'A', val: 1 },
            { id: 'B', val: 2 }
        ]
    });
});

test(`update existing items of item array`, t => {
    const crdt = new BaseJsonCRDT({
        arr: [
            { id: 'A', val: 1 },
            { id: 'B', val: 2 }
        ]
    });

    crdt.update(
        {
            arr: {
                A: { id: 'A' },
                B: { id: 'B', val: 'NEW VAL' }
            }
        },
        '1-1'
    );
    t.deepEqual(crdt.data(), {
        arr: [
            { id: 'A', val: 1 },
            { id: 'B', val: 'NEW VAL' }
        ]
    });
});

test(`add new items to item array`, t => {
    const crdt = new BaseJsonCRDT({
        arr: [
            { id: 'A', val: 1 },
            { id: 'B', val: 2 }
        ]
    });

    crdt.update(
        {
            arr: {
                A: { id: 'A', _index: 0 },
                B: { id: 'B', _index: 1 },
                C: { id: 'C', val: 3, _index: 2 }
            }
        },
        '1-1'
    );

    t.deepEqual(crdt.data(), {
        arr: [
            { id: 'A', val: 1 },
            { id: 'B', val: 2 },
            { id: 'C', val: 3 }
        ]
    });
});

test(`item array can be created at empty path`, t => {
    const crdt = new BaseJsonCRDT({
        normalField: 'some value'
    });

    // add new array
    crdt.update(
        {
            arr: {
                A: { id: 'A', val: 1, _index: 0 },
                B: { id: 'B', val: 2, _index: 1 },
                C: { id: 'C', val: 3, _index: 2 }
            }
        },
        '1-1'
    );

    // modify the new array to see that it is merged
    crdt.update(
        {
            arr: {
                A: { id: 'A' },
                B: { id: 'B' },
                C: { id: 'C' },
                D: { id: 'D', val: 4, _index: 3 }
            }
        },
        '2-1'
    );

    t.deepEqual(crdt.data(), {
        normalField: 'some value',
        arr: [
            { id: 'A', val: 1 },
            { id: 'B', val: 2 },
            { id: 'C', val: 3 },
            { id: 'D', val: 4 }
        ]
    });
});

test(`inserting item with id converts existing empty array into item array`, t => {
    const crdt = new BaseJsonCRDT({ arr: [] });

    // insert item with id
    crdt.update(
        {
            arr: { A: { id: 'A', val: 1, _index: 0 } }
        },
        '1-1'
    );

    // insert another item to see if it is merged
    crdt.update(
        {
            arr: { A: { id: 'A', _index: 0 }, B: { id: 'B', val: 2, _index: 1 } }
        },
        '1-2'
    );

    t.deepEqual(crdt.data(), {
        arr: [
            { id: 'A', val: 1 },
            { id: 'B', val: 2 }
        ]
    });
});

test(`item array can be cleared of all items`, t => {
    const crdt = new BaseJsonCRDT({ arr: [{ id: 'A', val: 1 }] });

    // clear all elements
    crdt.update(
        {
            arr: { A: { id: 'A', _index: null } }
        },
        '1-2'
    );

    t.deepEqual(crdt.data(), {
        arr: []
    });
});

test(`item array can be cleared of all items and filled with new items again`, t => {
    const crdt = new BaseJsonCRDT({ arr: [{ id: 'A', val: 1 }] });

    // clear all elements
    crdt.update(
        {
            arr: { A: { id: 'A', _index: null } }
        },
        '1-2'
    );

    // add new items
    crdt.update(
        {
            arr: { B: { id: 'B', val: 2, _index: 0 } }
        },
        '1-3'
    );
    crdt.update(
        {
            arr: { B: { id: 'B', _index: 0 }, C: { id: 'C', val: 3, _index: 1 } }
        },
        '1-4'
    );

    t.deepEqual(crdt.data(), {
        arr: [
            { id: 'B', val: 2 },
            { id: 'C', val: 3 }
        ]
    });
});

// TODO: make this test pass
test.failing('primitive value can not replace existing item array', t => {
    const crdt = new BaseJsonCRDT({
        arr: [
            { id: 'A', val: 1 },
            { id: 'B', val: 2 }
        ]
    });

    crdt.update(
        {
            arr: 'primitive value'
        },
        '1-1'
    );

    t.deepEqual(crdt.data(), {
        arr: [
            { id: 'A', val: 1 },
            { id: 'B', val: 2 }
        ]
    });
});

test(`delete item from item array`, t => {
    const crdt = new BaseJsonCRDT({
        normalField: 'some value',
        arr: [
            { id: 'A', val: 1 },
            { id: 'B', val: 2 },
            { id: 'C', val: 3 }
        ]
    });

    crdt.update(
        {
            arr: { A: { id: 'A', _index: null }, B: { id: 'B', _index: null }, C: { id: 'C' } }
        },
        '1-100'
    );

    t.deepEqual(crdt.data(), {
        normalField: 'some value',
        arr: [{ id: 'C', val: 3 }]
    });
});

test(`outdated re-create is denied`, t => {
    const crdt = new BaseJsonCRDT({
        normalField: 'some value',
        arr: [
            { id: 'A', val: 1 },
            { id: 'B', val: 2 },
            { id: 'C', val: 3 }
        ]
    });
    crdt.update(
        {
            arr: { A: { id: 'A', _index: null }, B: { id: 'B', _index: null }, C: { id: 'C' } }
        },
        '1-1'
    );
    crdt.update(
        {
            arr: { A: { id: 'A' }, B: { id: 'B' }, C: { id: 'C' } }
        },
        '1-0' // outdated
    );

    t.deepEqual(crdt.data(), {
        normalField: 'some value',
        arr: [{ id: 'C', val: 3 }]
    });
});

test(`newer re-create is denied`, t => {
    const crdt = new BaseJsonCRDT({
        normalField: 'some value',
        arr: [
            { id: 'A', val: 1 },
            { id: 'B', val: 2 },
            { id: 'C', val: 3 }
        ]
    });
    crdt.update(
        {
            arr: { C: { id: 'C', _index: null } }
        },
        '1-1'
    );
    crdt.update(
        {
            arr: { A: { id: 'A', _index: 0 }, B: { id: 'B', _index: 1 }, C: { id: 'C', _index: 2 } }
        },
        '1-2'
    );

    t.deepEqual(crdt.data(), {
        normalField: 'some value',
        arr: [
            { id: 'A', val: 1 },
            { id: 'B', val: 2 }
        ]
    });
});

test(`re-order only`, t => {
    const crdt = new BaseJsonCRDT({
        arr: [
            { id: 'A', val: 1 },
            { id: 'B', val: 2 },
            { id: 'C', val: 3 }
        ]
    });

    crdt.update(
        {
            arr: { B: { id: 'B', _index: 0 }, C: { id: 'C', _index: 1 }, A: { id: 'A', _index: 2 } }
        },
        '1-10'
    );

    t.deepEqual(crdt.data(), {
        arr: [
            { id: 'B', val: 2 },
            { id: 'C', val: 3 },
            { id: 'A', val: 1 }
        ]
    });
});

test(`re-order and add item`, t => {
    const crdt = new BaseJsonCRDT({
        arr: [
            { id: 'A', val: 1 },
            { id: 'B', val: 2 },
            { id: 'C', val: 3 }
        ]
    });

    crdt.update(
        {
            arr: {
                A: { id: 'A', _index: 0 },
                C: { id: 'C', _index: 1 },
                D: { id: 'D', val: 4, _index: 2 },
                B: { id: 'B', _index: 3 }
            }
        },
        '1-100'
    );

    t.deepEqual(crdt.data(), {
        arr: [
            { id: 'A', val: 1 },
            { id: 'C', val: 3 },
            { id: 'D', val: 4 },
            { id: 'B', val: 2 }
        ]
    });
});

test(`sorting works without updates`, t => {
    const crdt = new BaseJsonCRDT({
        arr: [
            { id: 'A', val: 1 },
            { id: 'B', val: 2 },
            { id: 'C', val: 3 }
        ]
    });

    // add new items and re-order
    crdt.update(
        {
            arr: {
                A: { id: 'A', _index: 0 },
                B: { id: 'B', _index: 1 },
                C: { id: 'C', _index: 2 },
                D: { id: 'D', val: 4, _index: 3 }
            }
        },
        '1-1'
    );

    t.deepEqual(crdt.data(), {
        arr: [
            { id: 'A', val: 1 },
            { id: 'B', val: 2 },
            { id: 'C', val: 3 },
            { id: 'D', val: 4 }
        ]
    });
});

test(`empty array is treated as atomic array when inserted item is not item array item`, t => {
    const crdt = new BaseJsonCRDT({
        arr: []
    });

    crdt.update(
        {
            arr: [{ val: 1 }]
        },
        '1-1'
    );

    crdt.update(
        {
            arr: [{ val: 2 }]
        },
        '2-1'
    );

    // only the last update is kept
    t.deepEqual(crdt.data(), {
        arr: [{ val: 2 }]
    });
});

test(`data of the same item is merged`, t => {
    const crdt = new BaseJsonCRDT({
        arr: [{ id: 'A', val: 1, other: 'value' }]
    });

    crdt.update(
        {
            arr: { A: { id: 'A', val: 10 } }
        },
        '1-1'
    );

    crdt.update(
        {
            arr: {
                A: {
                    id: 'A',
                    other: 'new value',
                    new: 'data'
                }
            }
        },
        '1-2'
    );

    t.deepEqual(crdt.data(), {
        arr: [{ id: 'A', val: 10, other: 'new value', new: 'data' }]
    });
});

test(`data in item array with nested objects is merged`, t => {
    const crdt = new BaseJsonCRDT({
        arr: [{ id: 'A', val: 1, other: 'value' }]
    });

    crdt.update(
        {
            arr: { A: { id: 'A', val: 10 } }
        },
        '1-1'
    );

    crdt.update(
        {
            arr: { A: { id: 'A', nested: { data: 'value', untouched: 1 } } }
        },
        '1-2'
    );

    crdt.update(
        {
            arr: { A: { id: 'A', nested: { data: 'updated' } } }
        },
        '1-3'
    );

    t.deepEqual(crdt.data(), {
        arr: [{ id: 'A', val: 10, other: 'value', nested: { data: 'updated', untouched: 1 } }]
    });
});

test(`support concurrent inserts in item arrays at end`, t => {
    const crdt = new BaseJsonCRDT({
        arr: [
            { id: 'A', val: 1 },
            { id: 'B', val: 2 }
        ]
    });

    crdt.update(
        {
            arr: {
                A: { id: 'A', _index: 0 },
                B: { id: 'B', _index: 1 },
                C: { id: 'C', val: 3, _index: 2 }
            }
        },
        '1-1'
    );

    crdt.update(
        {
            arr: {
                A: { id: 'A', _index: 0 },
                B: { id: 'B', _index: 1 },
                D: { id: 'D', val: 4, _index: 2 }
            }
        },
        '2-1'
    );

    t.deepEqual(crdt.data(), {
        arr: [
            { id: 'A', val: 1 },
            { id: 'B', val: 2 },
            { id: 'D', val: 4 },
            { id: 'C', val: 3 }
        ]
    });
});

test(`support concurrent inserts in item arrays in the middle of the array`, t => {
    const crdt = new BaseJsonCRDT({
        arr: [
            { id: 'A', val: 1 },
            { id: 'B', val: 2 }
        ]
    });

    crdt.update(
        {
            arr: {
                A: { id: 'A', _index: 0 },
                C: { id: 'C', val: 3, _index: 1 },
                B: { id: 'B', _index: 2 }
            }
        },
        '1-1'
    );

    crdt.update(
        {
            arr: {
                A: { id: 'A', _index: 0 },
                D: { id: 'D', val: 4, _index: 1 },
                B: { id: 'B', _index: 2 }
            }
        },
        '2-1'
    );

    t.deepEqual(crdt.data(), {
        arr: [
            { id: 'A', val: 1 },
            { id: 'D', val: 4 },
            { id: 'C', val: 3 },
            { id: 'B', val: 2 }
        ]
    });
});

test(`support concurrent inserts in nested item arrays in the middle of the array`, t => {
    const crdt = new BaseJsonCRDT({
        foo: {
            arr: [
                { id: 'A', val: 1 },
                { id: 'B', val: 2 }
            ]
        }
    });

    crdt.update(
        {
            foo: {
                arr: {
                    A: { id: 'A', _index: 0 },
                    C: { id: 'C', val: 3, _index: 1 },
                    B: { id: 'B', _index: 2 }
                }
            }
        },
        '1-1'
    );

    crdt.update(
        {
            foo: {
                arr: {
                    A: { id: 'A', _index: 0 },
                    D: { id: 'D', val: 4, _index: 1 },
                    B: { id: 'B', _index: 2 }
                }
            }
        },
        '2-1'
    );

    t.deepEqual(crdt.data(), {
        foo: {
            arr: [
                { id: 'A', val: 1 },
                { id: 'D', val: 4 },
                { id: 'C', val: 3 },
                { id: 'B', val: 2 }
            ]
        }
    });
});

test(`support concurrent inserts and deletes in item arrays in the middle of the array`, t => {
    const crdt = new BaseJsonCRDT({
        arr: [
            { id: 'A', val: 1 },
            { id: 'B', val: 2 }
        ]
    });

    crdt.update(
        {
            arr: {
                A: { id: 'A', _index: 0 },
                C: { id: 'C', val: 3, _index: 1 },
                B: { id: 'B', _index: 2 }
            }
        },
        '1-1'
    );

    crdt.update(
        {
            arr: { A: { id: 'A', _index: null }, B: { id: 'B', _index: 0 } }
        },
        '2-1'
    );

    t.deepEqual(crdt.data(), {
        arr: [
            { id: 'B', val: 2 },
            { id: 'C', val: 3 }
        ]
    });
});

test(`support concurrent sorting in item arrays`, t => {
    const crdt = new BaseJsonCRDT({
        arr: [
            { id: 'A', val: 'A' },
            { id: 'B', val: 'B' },
            { id: 'C', val: 'C' },
            { id: 'D', val: 'D' }
        ]
    });

    crdt.update(
        {
            arr: {
                B: { id: 'B', _index: 0 },
                A: { id: 'A', _index: 1 }
            }
        },
        '1-1'
    );

    crdt.update(
        {
            arr: {
                D: { id: 'D', _index: 2 },
                C: { id: 'C', _index: 3 }
            }
        },
        '1-2'
    );

    t.deepEqual(crdt.data(), {
        arr: [
            { id: 'B', val: 'B' },
            { id: 'A', val: 'A' },
            { id: 'D', val: 'D' },
            { id: 'C', val: 'C' }
        ]
    });
});

test(`won't re-insert deleted item with late insert`, t => {
    const crdt = new BaseJsonCRDT({
        normalField: 'some value',
        arr: [
            { id: 'B', val: 2 },
            { id: 'C', val: 3 }
        ]
    });

    crdt.update(
        {
            arr: { A: { id: 'A', _index: null }, B: { id: 'B' }, C: { id: 'C' } }
        },
        '2-2'
    );

    crdt.update(
        {
            arr: { A: { id: 'A', val: 1 }, B: { id: 'B' }, C: { id: 'C' } }
        },
        '1-1'
    );

    t.deepEqual(crdt.data(), {
        normalField: 'some value',
        arr: [
            { id: 'B', val: 2 },
            { id: 'C', val: 3 }
        ]
    });
});

test(`diffs with array inserts and deletions applied in different order result in same state`, t => {
    const initData = {
        arr: [
            { id: 'A', val: 1 },
            { id: 'B', val: 2 }
        ]
    };

    const diffX = [
        {
            arr: [
                { id: 'A', _index: null },
                { id: 'B', _index: null }
            ]
        },
        '1-1'
    ] as const;
    const diffY = [
        {
            arr: [{ id: 'A' }, { id: 'B' }, { id: 'C', val: 3 }]
        },
        '2-3'
    ] as const;
    const diffZ = [
        {
            arr: [{ id: 'A', _index: null }, { id: 'D', val: 4 }, { id: 'B' }]
        },
        '1-2'
    ] as const;

    const crdtA = new BaseJsonCRDT(cloneDeep(initData));
    const crdtB = new BaseJsonCRDT(cloneDeep(initData));

    crdtA.update(...diffX);
    crdtA.update(...diffY);
    crdtA.update(...diffZ);

    crdtB.update(...diffZ);
    crdtB.update(...diffX);
    crdtB.update(...diffY);

    t.deepEqual(crdtA.data(), crdtB.data());
});

test(`update and delete operations on numeric ids`, t => {
    const crdt = new BaseJsonCRDT({
        normalField: 'some value',
        arr: [
            { id: 1, val: 1 },
            { id: 2, val: 2 },
            { id: 'C', val: 3 }
        ]
    });

    crdt.update(
        {
            arr: { 1: { id: 1, _index: null }, 2: { id: 2, val: 'B' }, C: { id: 'C' } }
        },
        '1-100'
    );

    t.deepEqual(crdt.data(), {
        normalField: 'some value',
        arr: [
            { id: 2, val: 'B' },
            { id: 'C', val: 3 }
        ]
    });
});
