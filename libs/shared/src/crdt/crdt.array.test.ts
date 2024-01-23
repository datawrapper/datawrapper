import test from 'ava';
import { CRDT } from './crdt.js';

test(`value arrays are treated as atomic arrays in basic updates`, t => {
    const crdt = new CRDT({ a: [1, 2, 3] });
    crdt.update({ a: [3, 4] }, '1-1');
    t.deepEqual(crdt.data(), {
        a: [3, 4]
    });
});

test(`value arrays are treated as atomic arrays for nested arrays`, t => {
    const crdt = new CRDT({ a: [1, 2, [4, 6]] });
    crdt.update({ a: [1, [2, 3], 4] }, '1-1');
    t.deepEqual(crdt.data(), {
        a: [1, [2, 3], 4]
    });
});

test(`object arrays without ID are treated as atomic arrays`, t => {
    const crdt = new CRDT({ a: [{ a: 1 }, { b: 2 }] });
    crdt.update({ a: [{ a: 1 }, { b: 2 }, { c: 3 }] }, '1-1');
    t.deepEqual(crdt.data(), {
        a: [{ a: 1 }, { b: 2 }, { c: 3 }]
    });
});

test(`item array initalization`, t => {
    const crdt = new CRDT({
        arr: [
            { id: 'id1', val: 1 },
            { id: 'id2', val: 2 }
        ]
    });
    t.deepEqual(crdt.data(), {
        arr: [
            { id: 'id1', val: 1 },
            { id: 'id2', val: 2 }
        ]
    });
});

test(`update existing items of item array`, t => {
    const crdt = new CRDT({
        arr: [
            { id: 'id1', val: 1 },
            { id: 'id2', val: 2 }
        ]
    });

    crdt.update(
        {
            arr: [{ id: 'id1' }, { id: 'id2', val: 'NEW VAL' }]
        },
        '1-1'
    );

    t.deepEqual(crdt.data(), {
        arr: [
            { id: 'id1', val: 1 },
            { id: 'id2', val: 'NEW VAL' }
        ]
    });
});

test(`add new items to item array`, t => {
    const crdt = new CRDT({
        arr: [
            { id: 'id1', val: 1 },
            { id: 'id2', val: 2 }
        ]
    });

    crdt.update(
        {
            arr: [{ id: 'id1' }, { id: 'id2' }, { id: 'id3', val: 3 }]
        },
        '1-1'
    );

    t.deepEqual(crdt.data(), {
        arr: [
            { id: 'id1', val: 1 },
            { id: 'id2', val: 2 },
            { id: 'id3', val: 3 }
        ]
    });
});

test(`adding a new item array`, t => {
    const crdt = new CRDT({
        normalField: 'some value'
    });

    // add new array
    crdt.update(
        {
            arr: [
                { id: 'id1', val: 1 },
                { id: 'id2', val: 2 },
                { id: 'id3', val: 3 }
            ]
        },
        '1-1'
    );

    // modify the new array to see that it is merged
    crdt.update(
        {
            arr: [{ id: 'id1' }, { id: 'id2' }, { id: 'id3' }, { id: 'id4', val: 4 }]
        },
        '2-1'
    );

    t.deepEqual(crdt.data(), {
        normalField: 'some value',
        arr: [
            { id: 'id1', val: 1 },
            { id: 'id2', val: 2 },
            { id: 'id3', val: 3 },
            { id: 'id4', val: 4 }
        ]
    });
});

test(`inserting item with id converts existing empty array into item array`, t => {
    const crdt = new CRDT({ arr: [] });

    // insert item with id
    crdt.update(
        {
            arr: [{ id: 'id1', val: 1 }]
        },
        '1-1'
    );

    // insert another item to see if it is merged
    crdt.update(
        {
            arr: [{ id: 'id1' }, { id: 'id2', val: 2 }]
        },
        '1-2'
    );

    t.deepEqual(crdt.data(), {
        arr: [
            { id: 'id1', val: 1 },
            { id: 'id2', val: 2 }
        ]
    });
});

test(`item array can be cleared of all items`, t => {
    const crdt = new CRDT({ arr: [{ id: 'id1', val: 1 }] });

    // clear all elements
    crdt.update(
        {
            arr: []
        },
        '1-2'
    );

    t.deepEqual(crdt.data(), {
        arr: []
    });
});

test(`item array can be cleared of all items and filled with new items again`, t => {
    const crdt = new CRDT({ arr: [{ id: 'id1', val: 1 }] });

    // clear all elements
    crdt.update(
        {
            arr: []
        },
        '1-2'
    );

    // add new items
    crdt.update(
        {
            arr: [{ id: 'id2', val: 2 }]
        },
        '1-3'
    );
    crdt.update(
        {
            arr: [{ id: 'id2' }, { id: 'id3', val: 3 }]
        },
        '1-4'
    );

    t.deepEqual(crdt.data(), {
        arr: [
            { id: 'id2', val: 2 },
            { id: 'id3', val: 3 }
        ]
    });
});

test('normal value can be replaced with item array', t => {
    const crdt = new CRDT({
        arr: 'not an array yet'
    });

    // convert to item array
    crdt.update(
        {
            arr: [{ id: 'id1', val: 1 }]
        },
        '1-1'
    );

    // item array can be updated normally
    crdt.update(
        {
            arr: [{ id: 'id1' }, { id: 'id2', val: 2 }]
        },
        '1-2'
    );

    t.deepEqual(crdt.data(), {
        arr: [
            { id: 'id1', val: 1 },
            { id: 'id2', val: 2 }
        ]
    });
});

test('nested value in converted item array can not be updated with outdated timestamp', t => {
    const crdt = new CRDT({
        arr: 'not an array yet'
    });

    // convert to item array
    crdt.update({ arr: [{ id: 'id1', nested: { val: 1, otherVal: 'one' } }] }, '1-1');

    // update nested value
    crdt.update({ arr: [{ id: 'id1', nested: { val: 2 } }] }, '1-2');

    // update nested value with outdated timestamp
    crdt.update({ arr: [{ id: 'id1', nested: { val: 3, otherVal: 'invalid value' } }] }, '1-1');

    t.deepEqual(crdt.data(), {
        arr: [{ id: 'id1', nested: { val: 2, otherVal: 'one' } }]
    });
});

test(`delete item from item array`, t => {
    const crdt = new CRDT({
        normalField: 'some value',
        arr: [
            { id: 'id1', val: 1 },
            { id: 'id2', val: 2 },
            { id: 'id3', val: 3 }
        ]
    });

    crdt.update(
        {
            arr: [{ id: 'id3' }]
        },
        '1-100'
    );

    t.deepEqual(crdt.data(), {
        normalField: 'some value',
        arr: [{ id: 'id3', val: 3 }]
    });
});

test(`outdated re-create is denied`, t => {
    const crdt = new CRDT({
        normalField: 'some value',
        arr: [
            { id: 'id1', val: 1 },
            { id: 'id2', val: 2 },
            { id: 'id3', val: 3 }
        ]
    });
    crdt.update(
        {
            arr: [{ id: 'id3' }]
        },
        '1-1'
    );
    crdt.update(
        {
            arr: [{ id: 'id1' }, { id: 'id2' }, { id: 'id3' }]
        },
        '1-0' // outdated
    );

    t.deepEqual(crdt.data(), {
        normalField: 'some value',
        arr: [{ id: 'id3', val: 3 }]
    });
});

test(`newer re-create is accepted`, t => {
    // This behaviour is probably not desired, but it is the current implementation.
    // TODO: When we update the implementation this test needs to get adapted.
    const crdt = new CRDT({
        normalField: 'some value',
        arr: [
            { id: 'id1', val: 1 },
            { id: 'id2', val: 2 },
            { id: 'id3', val: 3 }
        ]
    });
    crdt.update(
        {
            arr: [{ id: 'id3' }]
        },
        '1-1'
    );
    crdt.update(
        {
            arr: [{ id: 'id1' }, { id: 'id2' }, { id: 'id3' }]
        },
        '1-1000'
    );

    t.deepEqual(crdt.data(), {
        normalField: 'some value',
        arr: [
            { id: 'id1', val: 1 },
            { id: 'id2', val: 2 },
            { id: 'id3', val: 3 }
        ]
    });
});

test(`re-order only`, t => {
    const crdt = new CRDT({
        arr: [
            { id: 'id1', val: 1 },
            { id: 'id2', val: 2 },
            { id: 'id3', val: 3 }
        ]
    });

    crdt.update(
        {
            arr: [{ id: 'id2' }, { id: 'id3' }, { id: 'id1' }]
        },
        '1-10'
    );

    t.deepEqual(crdt.data(), {
        arr: [
            { id: 'id2', val: 2 },
            { id: 'id3', val: 3 },
            { id: 'id1', val: 1 }
        ]
    });
});

test(`re-order and add item`, t => {
    const crdt = new CRDT({
        arr: [
            { id: 'id1', val: 1 },
            { id: 'id2', val: 2 },
            { id: 'id3', val: 3 }
        ]
    });

    crdt.update(
        {
            arr: [{ id: 'id1' }, { id: 'id3' }, { id: 'id4', val: 4 }, { id: 'id2' }]
        },
        '1-100'
    );

    t.deepEqual(crdt.data(), {
        arr: [
            { id: 'id1', val: 1 },
            { id: 'id3', val: 3 },
            { id: 'id4', val: 4 },
            { id: 'id2', val: 2 }
        ]
    });
});

test(`sorting works without updates`, t => {
    const crdt = new CRDT({
        arr: [
            { id: 'id1', val: 1 },
            { id: 'id2', val: 2 },
            { id: 'id3', val: 3 }
        ]
    });

    // add new items and re-order
    crdt.update(
        {
            arr: [{ id: 'id1' }, { id: 'id2' }, { id: 'id3' }, { id: 'id4', val: 4 }]
        },
        '1-1'
    );

    t.deepEqual(crdt.data(), {
        arr: [
            { id: 'id1', val: 1 },
            { id: 'id2', val: 2 },
            { id: 'id3', val: 3 },
            { id: 'id4', val: 4 }
        ]
    });
});

test(`empty array is treated as atomic array when inserted item is not item array item`, t => {
    const crdt = new CRDT({
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
    const crdt = new CRDT({
        arr: [{ id: 'id1', val: 1, other: 'value' }]
    });

    crdt.update(
        {
            arr: [{ id: 'id1', val: 10 }]
        },
        '1-1'
    );

    crdt.update(
        {
            arr: [
                {
                    id: 'id1',
                    other: 'new value',
                    new: 'data'
                }
            ]
        },
        '1-2'
    );

    t.deepEqual(crdt.data(), {
        arr: [{ id: 'id1', val: 10, other: 'new value', new: 'data' }]
    });
});

test(`data in item array with nested objects is merged`, t => {
    const crdt = new CRDT({
        arr: [{ id: 'id1', val: 1, other: 'value' }]
    });

    crdt.update(
        {
            arr: [{ id: 'id1', val: 10 }]
        },
        '1-1'
    );

    crdt.update(
        {
            arr: [{ id: 'id1', nested: { data: 'value', untouched: 1 } }]
        },
        '1-2'
    );

    crdt.update(
        {
            arr: [{ id: 'id1', nested: { data: 'updated' } }]
        },
        '1-3'
    );

    t.deepEqual(crdt.data(), {
        arr: [{ id: 'id1', val: 10, other: 'value', nested: { data: 'updated', untouched: 1 } }]
    });
});

test('crdt with array can be initialized with existing timestamp object', t => {
    const crdt = new CRDT(
        {
            arr: [
                { id: 'id1', val: 1 },
                { id: 'id2', val: 2 }
            ]
        },
        {
            arr: {
                _order: '1-1',
                id1: { val: '5-5' },
                id2: { val: '5-5' }
            }
        }
    );

    // update with new data and order but timestamp is only high enough for order
    crdt.update(
        {
            arr: [
                { id: 'id2', val: 'outdate' },
                { id: 'id1', val: 'outdate' }
            ]
        },
        '1-2'
    );

    t.deepEqual(crdt.data(), {
        arr: [
            { id: 'id2', val: 2 },
            { id: 'id1', val: 1 }
        ]
    });
});
