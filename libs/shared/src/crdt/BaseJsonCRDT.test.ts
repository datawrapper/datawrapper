import test from 'ava';
import { BaseJsonCRDT } from './BaseJsonCRDT.js';
import { Clock } from './Clock.js';

test(`getters return immutable objects`, t => {
    const crdt = new BaseJsonCRDT({ a: 1, b: 2, c: 3 });

    const data = crdt.data();
    data.a = 99;
    t.deepEqual(crdt.data(), { a: 1, b: 2, c: 3 });

    // perform update to be sure there are timestamps
    crdt.update({ a: 2, b: 3, c: 4 }, '1-1');

    const timestamps = crdt.timestamps();
    timestamps.a = '99-99';
    t.deepEqual(crdt.timestamps(), { a: '1-1', b: '1-1', c: '1-1' });
});

test(`init`, t => {
    // flat object
    const crdt1 = new BaseJsonCRDT({ a: 'some value', b: 2, c: 3 });
    t.deepEqual(crdt1.data(), { a: 'some value', b: 2, c: 3 });

    // deeply nested object
    const crdt2 = new BaseJsonCRDT({ a: { b: { c: { d: { e: { f: 1 } } } } } });
    t.deepEqual(crdt2.data(), { a: { b: { c: { d: { e: { f: 1 } } } } } });

    // object with arrays
    const crdt3 = new BaseJsonCRDT({ a: [1, 2, 3], b: [4, 5, 6] });
    t.deepEqual(crdt3.data(), { a: [1, 2, 3], b: [4, 5, 6] });
});

test('null values should be filtered out on init', t => {
    const crdt = new BaseJsonCRDT({ a: null, b: { c: 'some value', d: null } });
    t.deepEqual(crdt.data(), { b: { c: 'some value' } });
});

test(`basic updates work`, t => {
    // flat object

    const crdt1 = new BaseJsonCRDT({ a: 'some value', b: 2, c: 3 });
    crdt1.update({ a: 2, b: 3 }, '1-1');
    t.deepEqual(crdt1.data(), { a: 2, b: 3, c: 3 });

    // deeply nested object

    const crdt2 = new BaseJsonCRDT({ a: { b: { c: { d: { e: { f: 1 } } } } } });
    crdt2.update({ a: { b: { c: { d: { e: { f: 2 } } } } } }, '1-1');
    t.deepEqual(crdt2.data(), { a: { b: { c: { d: { e: { f: 2 } } } } } });
});

test(`updates get denied for outdated timestamps`, t => {
    // flat object

    const crdt1 = new BaseJsonCRDT({ a: 'some value', b: 2, c: 3 });
    crdt1.update({ a: 2, b: 3 }, '1-1');
    crdt1.update({ b: 1000 }, '1-0');
    crdt1.update({ b: 1231232 }, '1-0');
    t.deepEqual(crdt1.data(), { a: 2, b: 3, c: 3 });
    crdt1.update({ a: 20 }, '1-2');
    crdt1.update({ a: -1 }, '1-1');
    t.deepEqual(crdt1.data(), { a: 20, b: 3, c: 3 });

    // deeply nested object

    const crdt2 = new BaseJsonCRDT({ a: { b: { c: { d: { e: { f: 1 } } } } } });
    crdt2.update({ a: { b: { c: { d: { e: { f: 2 } } } } } }, '1-1');
    crdt2.update({ a: { b: { c: { d: { e: { f: 1000 } } } } } }, '2-0');
    t.deepEqual(crdt2.data(), { a: { b: { c: { d: { e: { f: 2 } } } } } });
});

test(`updates with same timestamp value only get applied for higher nodeIds `, t => {
    const crdt = new BaseJsonCRDT({ a: 'some value', b: 2, c: { key: 'value' } });
    crdt.update({ a: 2 }, '1-1');
    crdt.update({ a: 'update value that does not get applied' }, '1-1');
    t.deepEqual(crdt.data(), { a: 2, b: 2, c: { key: 'value' } });

    crdt.update({ a: 'my creator had a higher node id so it works' }, '2-1');
    // latest update has been applied
    t.deepEqual(crdt.data(), {
        a: 'my creator had a higher node id so it works',
        b: 2,
        c: { key: 'value' }
    });
});

test(`non-conflicting updates get merged`, t => {
    const crdt = new BaseJsonCRDT({ a: 'some value', b: 2, c: { key: 'value' } });
    crdt.update({ a: 2 }, '1-1');
    crdt.update({ b: 3 }, '2-1');
    crdt.update({ c: { key: 'new value' } }, '3-1');
    t.deepEqual(crdt.data(), {
        a: 2,
        b: 3,
        c: { key: 'new value' }
    });
});

test(`arrays are treated as atomic values`, t => {
    // Note: Right now, arrays behave just as other atomic-objects like strings or numbers, i.e., each update overwrites the array.
    // TODO: Theses tests should be updated to reflect the merging behavior of arrays once this functionality gets implemented.

    // basic update
    const crdt = new BaseJsonCRDT({ a: [1, 2, 3], b: [4, 5, 6] });
    crdt.update({ a: [1, 2, 3, 4] }, '1-1');
    crdt.update({ b: [4, 5, 6, 7] }, '2-1');
    t.deepEqual(crdt.data(), {
        a: [1, 2, 3, 4],
        b: [4, 5, 6, 7]
    });

    // overwriting update
    const crdt2 = new BaseJsonCRDT({ a: [1, 2, 3], b: [4, 5, 6] });
    crdt2.update({ a: [1, 2, 3, 4] }, '1-1');
    crdt2.update({ b: [4, 5, 6, 7] }, '2-1');
    crdt2.update({ a: [1, 2, 3, 4, 5, 6, 7] }, '3-1');
    t.deepEqual(crdt2.data(), {
        a: [1, 2, 3, 4, 5, 6, 7],
        b: [4, 5, 6, 7]
    });

    // nested arrays
    const crdt3 = new BaseJsonCRDT({ a: [1, 2, 3], b: [4, 5, 6] });
    crdt3.update({ a: [1, [2, 3], 4] }, '1-1');
    crdt3.update({ b: [4, 5, [6, 7]] }, '2-1');
    t.deepEqual(crdt3.data(), {
        a: [1, [2, 3], 4],
        b: [4, 5, [6, 7]]
    });

    // arrays with objects
    const crdt4 = new BaseJsonCRDT({ a: [{ a: 1 }, { b: 2 }], b: [{ c: 3 }, { d: 4 }] });
    crdt4.update({ a: [{ a: 1 }, { b: 2 }, { c: 3 }] }, '1-1');
    crdt4.update({ b: [{ c: 3 }, { d: 4 }, { e: 5 }] }, '2-1');
    t.deepEqual(crdt4.data(), {
        a: [{ a: 1 }, { b: 2 }, { c: 3 }],
        b: [{ c: 3 }, { d: 4 }, { e: 5 }]
    });
});

test(`updates with empty data`, t => {
    const crdt = new BaseJsonCRDT({ a: 'some value', b: 2, c: { key: 'value' } });
    crdt.update({}, '1-1');
    t.deepEqual(crdt.data(), { a: 'some value', b: 2, c: { key: 'value' } });
});

test(`adding new keys`, t => {
    const crdt = new BaseJsonCRDT({ a: 'some value', b: { key: 'value' } });

    crdt.update({ c: 'new key' }, '1-1');

    t.deepEqual(crdt.data(), {
        a: 'some value',
        b: { key: 'value' },
        c: 'new key'
    });
});

test('deleting basic non-nested key', t => {
    const crdt = new BaseJsonCRDT({ a: 'some value', b: 'value' });

    crdt.update({ a: null }, '1-1');
    t.deepEqual(crdt.data(), { b: 'value' });

    crdt.update({ b: null }, '1-2');
    t.deepEqual(crdt.data(), {});
});

test('inserting a new array', t => {
    const crdt = new BaseJsonCRDT({ a: 'some value' });

    crdt.update({ b: [] }, '1-1');
    t.deepEqual(crdt.data(), { a: 'some value', b: [] });
});

test('deleted keys can be added back in', t => {
    const crdt = new BaseJsonCRDT({ a: 'some value', b: 'value' });

    crdt.update({ a: null }, '1-1');
    t.deepEqual(crdt.data(), { b: 'value' });

    crdt.update({ a: 'new value' }, '1-2');
    t.deepEqual(crdt.data(), { a: 'new value', b: 'value' });
});

test('deleting a nested value keeps the parent object', t => {
    const crdt = new BaseJsonCRDT({
        a: 'some value',
        b: { c: { d: { e: { f: { g: 'soon gone' } } } } }
    });

    crdt.update({ b: { c: { d: { e: { f: { g: null } } } } } }, '1-1');

    t.deepEqual(crdt.data(), {
        a: 'some value',
        b: { c: { d: { e: { f: {} } } } }
    });
});

test('reinsertions with outdated timestamps get denied', t => {
    const crdt = new BaseJsonCRDT({ a: 'some value', b: 'value' });

    crdt.update({ a: null }, '1-2');
    t.deepEqual(crdt.data(), { b: 'value' });

    crdt.update({ a: 'outdated value' }, '1-1');
    t.deepEqual(crdt.data(), { b: 'value' });
});

test.failing("non-atomic fields can't be deleted", t => {
    const data = {
        emptyObj: {},
        nested: { key: 'value' },
        arr: [
            { id: '1', val: 'val1' },
            { id: '2', val: 'val2' }
        ]
    };
    const crdt = new BaseJsonCRDT(data);

    // delete object
    t.throws(() => crdt.update({ nested: null }, '1-3'));
    t.deepEqual(crdt.data(), data);

    // delete empty object
    t.throws(() => crdt.update({ emptyObj: null }, '1-4'));
    t.deepEqual(crdt.data(), data);
});

test.failing('deleting an item array deletes all items instead', t => {
    // this is not a safe operation, the conversion of the deletion should be handled in the calculateDiff
    const data = {
        arr: [
            { id: '1', val: 'val1' },
            { id: '2', val: 'val2' }
        ]
    };
    const crdt = new BaseJsonCRDT(data);

    // delete item array
    crdt.update({ arr: null }, '1-2');

    // re-inserting deleted item should not work
    crdt.update({ arr: { 1: { _index: 1 } } }, '1-10');

    t.deepEqual(crdt.data(), { arr: [] });
});

test('BaseJsonCRDT.calculateDiff calculates the correct patch (simple updates)', t => {
    const oldData = { a: 'some value', b: { key: 'value' } };

    const newData = { a: 'new value', b: { key: 'value' } };

    const diff = BaseJsonCRDT.calculateDiff(oldData, newData);

    t.deepEqual(diff, {
        a: 'new value'
    });

    // make sure that the diff applied again as update to the CRDT yields the same object
    const crdt = new BaseJsonCRDT(oldData);
    crdt.update(diff, '1-1');
    t.deepEqual(crdt.data(), newData);
});

test('BaseJsonCRDT.calculateDiff calculates the correct diff (simple arrays)', t => {
    const oldData = { a: 'some value', b: ['A', 'B', 'C'] };

    const newData = { a: 'some value', b: ['D', 'C', 'E'] };

    const diff = BaseJsonCRDT.calculateDiff(oldData, newData);

    t.deepEqual(diff, {
        b: ['D', 'C', 'E']
    });

    // make sure that the diff applied again as update to the CRDT yields the same object
    const crdt = new BaseJsonCRDT(oldData);
    crdt.update(diff, '1-1');
    t.deepEqual(crdt.data(), newData);
});

test('BaseJsonCRDT.calculateDiff calculates the correct diff (item array - simple updates)', t => {
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

    const diff = BaseJsonCRDT.calculateDiff(oldData, newData);

    t.deepEqual(diff, {
        b: { C: { value: 99 } }
    });

    // make sure that the diff applied again as update to the CRDT yields the same object
    // const crdt = new CRDT(oldData);
    // crdt.update(diff, '1-1');
    // t.deepEqual(crdt.data(), newData);
});

test('BaseJsonCRDT.calculateDiff calculates the correct patch (key deletion)', t => {
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

test('BaseJsonCRDT.calculateDiff calculates the correct patch (parent deletion)', t => {
    const oldData = {
        a: 'some value',
        b: { key: 'value' }
    };

    const newData = {};

    const patch = BaseJsonCRDT.calculateDiff(oldData, newData);

    t.deepEqual(patch, { a: null, b: null });
});

test('BaseJsonCRDT.calculateDiff calculates the correct patch (item array - insertion at end)', t => {
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

    const diff = BaseJsonCRDT.calculateDiff(oldData, newData);

    t.deepEqual(diff, {
        b: { D: { id: 'D', value: 4, _index: 3 } }
    });

    // make sure that the diff applied again as update to the CRDT yields the same object
    // const crdt = new CRDT(oldData);
    // crdt.update(diff, '1-1');
    // t.deepEqual(crdt.data(), newData);
});

test('BaseJsonCRDT.calculateDiff calculates the correct diff (item array - insertion at start)', t => {
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

    const diff = BaseJsonCRDT.calculateDiff(oldData, newData);

    t.deepEqual(diff, {
        b: {
            D: { id: 'D', value: 4, _index: 0 },
            A: { _index: 1 },
            B: { _index: 2 },
            C: { _index: 3 }
        }
    });

    // make sure that the diff applied again as update to the CRDT yields the same object
    // const crdt = new CRDT(oldData);
    // crdt.update(diff, '1-1');
    // t.deepEqual(crdt.data(), newData);
});

test('BaseJsonCRDT.calculateDiff calculates the correct diff (item array - insertion in middle)', t => {
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

    const diff = BaseJsonCRDT.calculateDiff(oldData, newData);

    t.deepEqual(diff, {
        b: {
            D: { id: 'D', value: 4, _index: 2 },
            C: { _index: 3 }
        }
    });

    // make sure that the diff applied again as update to the CRDT yields the same object
    // const crdt = new CRDT(oldData);
    // crdt.update(diff, '1-1');
    // t.deepEqual(crdt.data(), newData);
});

test('BaseJsonCRDT.calculateDiff calculates the correct diff (item array - deletion at end)', t => {
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

    const diff = BaseJsonCRDT.calculateDiff(oldData, newData);

    t.deepEqual(diff, {
        b: {
            C: { _index: null }
        }
    });

    // make sure that the diff applied again as update to the CRDT yields the same object
    // const crdt = new CRDT(oldData);
    // crdt.update(diff, '1-1');
    // t.deepEqual(crdt.data(), newData);
});

test('BaseJsonCRDT.calculateDiff calculates the correct diff (item array - deletion at beginning)', t => {
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

    const diff = BaseJsonCRDT.calculateDiff(oldData, newData);

    t.deepEqual(diff, {
        b: {
            A: { _index: null },
            B: { _index: 0 },
            C: { _index: 1 }
        }
    });

    // make sure that the diff applied again as update to the CRDT yields the same object
    // const crdt = new CRDT(oldData);
    // crdt.update(diff, '1-1');
    // t.deepEqual(crdt.data(), newData);
});

test('BaseJsonCRDT.calculateDiff calculates the correct diff (item array - deletion in the middle)', t => {
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

    const diff = BaseJsonCRDT.calculateDiff(oldData, newData);

    t.deepEqual(diff, {
        b: {
            B: { _index: null },
            C: { _index: 1 }
        }
    });

    // make sure that the diff applied again as update to the CRDT yields the same object
    // const crdt = new CRDT(oldData);
    // crdt.update(diff, '1-1');
    // t.deepEqual(crdt.data(), newData);
});

test('BaseJsonCRDT.calculateDiff calculates the correct diff (item array deletion)', t => {
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

    const diff = BaseJsonCRDT.calculateDiff(oldData, newData);

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

test('BaseJsonCRDT.calculateDiff calculates the correct diff (item array - re-ordering two elements)', t => {
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

    const diff = BaseJsonCRDT.calculateDiff(oldData, newData);

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

test('BaseJsonCRDT.calculateDiff calculates the correct diff (item array -  re-ordering multiple elements)', t => {
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

    const diff = BaseJsonCRDT.calculateDiff(oldData, newData);

    t.deepEqual(diff, {
        b: {
            A: { _index: 2 },
            B: { _index: 3 },
            C: { _index: 1 },
            D: { _index: 0 }
        }
    });

    // make sure that the diff applied again as update to the CRDT yields the same object
    // const crdt = new CRDT(oldData);
    // crdt.update(diff, '1-1');
    // t.deepEqual(crdt.data(), newData);
});

test('BaseJsonCRDT.calculateDiff calculates the correct diff (empty array - converted to item array)', t => {
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

    const diff = BaseJsonCRDT.calculateDiff(oldData, newData);

    t.deepEqual(diff, {
        b: {
            A: { id: 'A', value: 1, _index: 0 },
            B: { id: 'B', value: 2, _index: 1 }
        }
    });
});

test('BaseJsonCRDT.calculateDiff calculates the correct diff (empty array - treated as atomic array if not all items have an id)', t => {
    const oldData = {
        a: 'some value',
        b: []
    };

    const newData = {
        a: 'some value',
        b: [
            { value: 1 }, //missing id
            { id: 'B', value: 2 }
        ]
    };

    const diff = BaseJsonCRDT.calculateDiff(oldData, newData);

    t.deepEqual(diff, {
        b: [
            { value: 1 }, //missing id
            { id: 'B', value: 2 }
        ]
    });
});

test('BaseJsonCRDT.calculateDiff calculates the correct diff (atomic array remains an atomic array even if some items contain an ID)', t => {
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

test('BaseJsonCRDT.calculateDiff throws an error if an atomic array is turned into an item array (all elements containing an ID)', t => {
    const oldData = {
        a: 'some value',
        b: [1, 2, 3]
    };

    const newData = {
        a: 'some value',
        b: [{ id: 'B', value: 2 }]
    };

    t.throws(() => BaseJsonCRDT.calculateDiff(oldData, newData));
});

test('BaseJsonCRDT.calculateDiff properly filters for allowedKeys', t => {
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
        allowedKeys: new Set(['a', 'b'])
    });

    t.deepEqual(diff, {
        b: {
            A: { id: 'A', value: 1, _index: 0 },
            B: { id: 'B', value: 2, _index: 1 }
        }
    });
});

test('BaseJsonCRDT.calculateDiff properly filters for ignorePaths', t => {
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

test('BaseJsonCRDT.calculateDiff calculates patch with empty objects', t => {
    const oldData = { a: 'some value', b: { key: 'value' } };

    const newData = { a: 'new value', b: { key: 'value' }, c: { d: {} } };

    const patch = BaseJsonCRDT.calculateDiff(oldData, newData);

    t.deepEqual(patch, {
        a: 'new value',
        c: { d: {} }
    });
});

test('BaseJsonCRDT.calculateDiff calculates patch with empty arrays', t => {
    const oldData = { a: 'some value', b: { key: 'value' } };

    const newData = { a: 'new value', b: { key: 'value' }, c: { d: [] } };

    const patch = BaseJsonCRDT.calculateDiff(oldData, newData);

    t.deepEqual(patch, {
        a: 'new value',
        c: { d: [] }
    });
});

test('BaseJsonCRDT.calculateDiff calculates patch with new arrays', t => {
    const oldData = { a: 'some value', b: { key: 'value' } };

    const newData = { a: 'new value', b: { key: 'value' }, c: { d: ['', ''] } };

    const patch = BaseJsonCRDT.calculateDiff(oldData, newData);

    t.deepEqual(patch, {
        a: 'new value',
        c: { d: ['', ''] }
    });
});

test('BaseJsonCRDT.calculateDiff calculates patch with unchanged basic arrays', t => {
    const oldData = { a: 'some value', b: { key: 'value' }, c: { d: ['first', 'second'] } };

    const newData = { a: 'new value', b: { key: 'value' }, c: { d: ['first', 'second'] } };

    const patch = BaseJsonCRDT.calculateDiff(oldData, newData);

    t.deepEqual(patch, {
        a: 'new value'
    });
});

test('BaseJsonCRDT.calculateDiff calculates patch with unchanged object arrays', t => {
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

test('BaseJsonCRDT.calculateDiff calculates patch without unnecessary delete', t => {
    const oldData = { a: 'some value', b: { key: 'value' } };

    const newData = { a: 'new value', b: { key: 'value' }, c: { d: null } };

    const patch = BaseJsonCRDT.calculateDiff(oldData, newData);

    t.deepEqual(patch, {
        a: 'new value'
    });
});

test('BaseJsonCRDT.calculateDiff calculates patch for deletion of explicitly undefined value', t => {
    const oldData = { a: 'some value', b: { key: 'value' }, c: { d: undefined } };

    const newData = { a: 'new value', b: { key: 'value' }, c: { d: null } };

    const patch = BaseJsonCRDT.calculateDiff(oldData, newData);

    t.deepEqual(patch, {
        a: 'new value',
        c: { d: null }
    });
});

test('BaseJsonCRDT.calculateDiff calculates the correct diff (new deeply nested object)', t => {
    const oldData = { a: 'some value' };

    const newData = { a: 'some value', b: { c: { d: { e: {} } } } };

    const diff = BaseJsonCRDT.calculateDiff(oldData, newData);

    t.deepEqual(diff, {
        b: { c: { d: { e: {} } } }
    });

    // make sure that the diff applied again as update to the CRDT yields the same object
    const crdt = new BaseJsonCRDT(oldData);
    crdt.update(diff, '1-1');
    t.deepEqual(crdt.data(), newData);
});

test('BaseJsonCRDT.calculateDiff ignores date <-> string conversion if the underlying value is the same', t => {
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

test('BaseJsonCRDT.calculateDiff includes date <-> string conversion if the underlying value is not the same', t => {
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

test('BaseJsonCRDT.calculateDiff handles atomic value to nested object conversion', t => {
    const diff = BaseJsonCRDT.calculateDiff({ a: 'string' }, { a: { b: { c: 1 } } });

    t.deepEqual(diff, { a: { b: { c: 1 } } });
});

test('BaseJsonCRDT.calculateDiff handles nested object to atomic value conversion', t => {
    const diff = BaseJsonCRDT.calculateDiff({ a: { b: { c: 1 } } }, { a: 'string' });

    t.deepEqual(diff, { a: 'string' });
});

test('BaseJsonCRDT.calculateDiff handles deletion of nested object', t => {
    const diff = BaseJsonCRDT.calculateDiff({ a: { b: { c: 1 } } }, {});

    t.deepEqual(diff, { a: null });
});

test('inserting empty object: new path', t => {
    const crdt = new BaseJsonCRDT({ a: 'some value' });

    crdt.update({ b: {} }, '1-1');

    t.deepEqual(crdt.data(), { a: 'some value', b: {} });
});

test('inserting empty object: nested new path', t => {
    const crdt = new BaseJsonCRDT({ a: 'some value' });

    crdt.update({ b: { c: { d: { e: {} } } } }, '1-1');

    t.deepEqual(crdt.data(), { a: 'some value', b: { c: { d: { e: {} } } } });
});

test('inserting empty object: already empty object', t => {
    const crdt = new BaseJsonCRDT({ a: 'some value', b: {} });

    crdt.update({ b: {} }, '1-1');

    t.deepEqual(crdt.data(), { a: 'some value', b: {} });
});

test('inserting value into empty object', t => {
    const crdt = new BaseJsonCRDT({ a: 'some value', b: {} });

    crdt.update({ b: {} }, '1-1');

    t.deepEqual(crdt.data(), { a: 'some value', b: {} });
});

test('inserting empty object is ignored: path is existing object', t => {
    const crdt = new BaseJsonCRDT({ a: 'some value', b: { x: 0 } });

    crdt.update({ b: {} }, '1-1');

    t.deepEqual(crdt.data(), { a: 'some value', b: { x: 0 } });
});

test.failing('inserting empty object is rejected: path is atomic value', t => {
    const crdt = new BaseJsonCRDT({ a: 'some value', b: 8 });

    t.throws(() => crdt.update({ b: {} }, '1-1'));

    t.deepEqual(crdt.data(), { a: 'some value', b: 8 });
});

test.failing('inserting empty object is rejected: path is array', t => {
    const crdt = new BaseJsonCRDT({ a: 'some value', b: 8 });

    t.throws(() => crdt.update({ b: {} }, '1-1'));

    t.deepEqual(crdt.data(), { a: 'some value', b: 8 });
});

test.failing('inserting empty object is rejected: path is item array', t => {
    const crdt = new BaseJsonCRDT({ a: 'some value', b: 8 });

    t.throws(() => crdt.update({ b: {} }, '1-1'));

    t.deepEqual(crdt.data(), { a: 'some value', b: 8 });
});

test('re-initialization after item array deletion', t => {
    const crdt = new BaseJsonCRDT({
        a: 'some value',
        b: [
            { id: '1', value: 1 },
            { id: '2', value: 2 }
        ]
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

test('a Date inserted at initialization or with update is a Date in the data', t => {
    const crdt = new BaseJsonCRDT<any>({ a: new Date('2024-02-14T09:10:23.956Z') });

    crdt.update({ b: new Date('2024-02-13T09:10:23.956Z') }, '1-1');
    t.deepEqual(crdt.data(), {
        a: new Date('2024-02-14T09:10:23.956Z'),
        b: new Date('2024-02-13T09:10:23.956Z')
    });
});

test('a Date can be deleted with null', t => {
    const crdt = new BaseJsonCRDT<any>({ a: new Date('2024-02-14T09:10:23.956Z'), b: 'stays' });

    crdt.update({ a: null }, '1-1');
    t.deepEqual(crdt.data(), { b: 'stays' });
});

test('null can be replaced with a Date', t => {
    const crdt = new BaseJsonCRDT<any>({ a: null });

    crdt.update({ a: new Date('2024-02-14T09:10:23.956Z') }, '1-1');
    t.deepEqual(crdt.data(), { a: new Date('2024-02-14T09:10:23.956Z') });
});

test('a Date can be explicitly set to undefined', t => {
    const crdt = new BaseJsonCRDT<any>({ a: new Date('2024-02-14T09:10:23.956Z'), b: 'stays' });

    crdt.update({ a: undefined }, '1-1');
    t.deepEqual(crdt.data(), { b: 'stays' });
});

test('re-initialization after item array insert', t => {
    const crdt = new BaseJsonCRDT({
        a: 'some value',
        b: [
            { id: '1', value: 1 },
            { id: '2', value: 2 }
        ]
    });

    // add one item
    crdt.update({ b: { '3': { id: '3', _index: 2 } } }, '1-1');

    const crdt2 = BaseJsonCRDT.fromSerialized(crdt.serialize());
    t.deepEqual(crdt2.data(), {
        a: 'some value',
        b: [{ id: '1', value: 1 }, { id: '2', value: 2 }, { id: '3' }]
    });
});

test('basic serialization and re-initialization', t => {
    const crdt = new BaseJsonCRDT({
        a: 'some value',
        b: [
            { id: '1', value: 1 },
            { id: '2', value: 2 }
        ]
    });

    const serialized = crdt.serialize();
    const crdt2 = BaseJsonCRDT.fromSerialized(serialized);

    t.deepEqual(crdt, crdt2);
});

// object <-> atomic value conversion

test(`deny converting atomic value to object if atomic value timestamp higher`, t => {
    const crdt = new BaseJsonCRDT({ a: 'some value' });

    crdt.update({ a: 'another value' }, '2-2');

    crdt.update({ a: { b: { c: 'nested' } } }, '1-1');

    t.deepEqual(crdt.data(), {
        a: 'another value'
    });
});

test(`convert atomic value (string) to object`, t => {
    const crdt = new BaseJsonCRDT({ a: 'some value' });

    crdt.update({ a: { b: { c: 'nested' } } }, '1-1');

    t.deepEqual(crdt.data(), {
        a: { b: { c: 'nested' } }
    });
});

test(`outdated conversion of atomic value (string) to object is rejected`, t => {
    const crdt = new BaseJsonCRDT({ a: 'some value' });

    crdt.update({ a: { b: { c: 'nested' } } }, '0-0');

    t.deepEqual(crdt.data(), {
        a: 'some value'
    });
});

test(`convert atomic value (int) to object`, t => {
    const crdt = new BaseJsonCRDT({ a: 9 });

    crdt.update({ a: { b: { c: 'nested' } } }, '1-1');

    t.deepEqual(crdt.data(), {
        a: { b: { c: 'nested' } }
    });
});

test(`convert atomic value (array) to object`, t => {
    const crdt = new BaseJsonCRDT({ a: [] });

    crdt.update({ a: { b: { c: 'nested' } } }, '1-1');

    t.deepEqual(crdt.data(), {
        a: { b: { c: 'nested' } }
    });
});

test(`convert atomic value (string) to empty object`, t => {
    const crdt = new BaseJsonCRDT({ a: 'some value' });

    crdt.update({ a: {} }, '1-1');

    t.deepEqual(crdt.data(), {
        a: {}
    });
});

test(`outdated conversion of atomic value (string) to empty object is rejected`, t => {
    const crdt = new BaseJsonCRDT({ a: 'some value' });

    crdt.update({ a: {} }, '0-0');

    t.deepEqual(crdt.data(), {
        a: 'some value'
    });
});

test(`convert atomic value (array) to empty object`, t => {
    const crdt = new BaseJsonCRDT({ a: [] });

    crdt.update({ a: {} }, '1-1');

    t.deepEqual(crdt.data(), {
        a: {}
    });
});

test(`outdated conversion of atomic value (array) to empty object is rejected`, t => {
    const crdt = new BaseJsonCRDT({ a: [] });

    crdt.update({ a: {} }, '0-0');

    t.deepEqual(crdt.data(), {
        a: []
    });
});

test(`convert empty object to atomic value`, t => {
    const crdt = new BaseJsonCRDT({ a: {} });

    crdt.update({ a: 'string' }, '1-1');

    t.deepEqual(crdt.data(), {
        a: 'string'
    });
});

test(`outdated conversion of empty object to atomic value is rejected`, t => {
    const crdt = new BaseJsonCRDT({ a: {} });

    crdt.update({ a: 'string' }, '0-0');

    t.deepEqual(crdt.data(), { a: {} });
});

test(`convert nested object to atomic value`, t => {
    const crdt = new BaseJsonCRDT({ a: { b: { c: 1 } } });

    crdt.update({ a: 'string' }, '1-1');

    t.deepEqual(crdt.data(), {
        a: 'string'
    });
});

test(`outdated conversion of atomic value to object is rejected`, t => {
    const crdt = new BaseJsonCRDT({ a: 'string' }, { a: '1-2' }, []);

    crdt.update({ a: { b: 1 } }, '1-1');

    t.deepEqual(crdt.data(), { a: 'string' });
});

test(`outdated conversion of nested object to atomic value is rejected`, t => {
    const crdt = new BaseJsonCRDT({ a: { b: { c: 1 } } }, { a: { b: { c: '1-2' } } }, []);

    crdt.update({ a: 'string' }, '1-1');

    t.deepEqual(crdt.data(), { a: { b: { c: 1 } } });
});

test(`delete nested object`, t => {
    const crdt = new BaseJsonCRDT({ a: { b: { c: 1 } } });

    crdt.update({ a: null }, '1-1');

    t.deepEqual(crdt.data(), {});
});

test(`oudated delete nested object is rejected`, t => {
    const crdt = new BaseJsonCRDT({ a: { b: { c: 1 } } });

    crdt.update({ a: null }, '0-0');

    t.deepEqual(crdt.data(), { a: { b: { c: 1 } } });
});

test(`delete empty object`, t => {
    const crdt = new BaseJsonCRDT({ a: {} });

    crdt.update({ a: null }, '1-1');

    t.deepEqual(crdt.data(), {});
});

test(`outdated delete empty object is rejected without initialized timestamp`, t => {
    const crdt = new BaseJsonCRDT({ a: {} });

    crdt.update({ a: null }, '0-0');

    t.deepEqual(crdt.data(), { a: {} });
});

test(`outdated delete empty object is rejected`, t => {
    const crdt = new BaseJsonCRDT({ a: {} }, { a: '1-1' }, []);

    crdt.update({ a: null }, '1-1');

    t.deepEqual(crdt.data(), { a: {} });
});

// test(`less nested updates with same clock count have priority`, t => {
//     const crdt = new BaseJsonCRDT({ a: { b: { c: 1 } } }, { a: { b: { c: '1-1' } } }, []);

//     crdt.update({ a: null }, '1-1');

//     t.deepEqual(crdt.data(), {});
// });

// test(`more nested updates with same clock count are rejected`, t => {
//     const crdt = new BaseJsonCRDT({ a: 1 }, { a: '1-1' }, []);

//     crdt.update({ a: { b: 1 } }, '3-1');

//     t.deepEqual(crdt.data(), {
//         a: 1
//     });
// });

test(`inserting new nested value in previous but now deleted atomic value is rejected when outdated`, t => {
    // Start with atomic value.
    const crdt = new BaseJsonCRDT({ a: 1 }, { a: '1-1' }, []);

    // Delete atomic value.
    crdt.update({ a: null }, '1-2');

    t.deepEqual(crdt.data(), {});

    // Insert nested value in previous atomic value.
    // Rejected because count is same/lower.
    crdt.update({ a: { b: 2 } }, '1-1');
    t.deepEqual(crdt.data(), {});

    crdt.update({ a: { b: 2 } }, '2-2');
    t.deepEqual(crdt.data(), { a: { b: 2 } });

    // Allowed because count is higher.
    crdt.update({ a: { b: 3 } }, '2-3');
    t.deepEqual(crdt.data(), { a: { b: 3 } });
});

test(`insert nested new value into existing object`, t => {
    const crdt = new BaseJsonCRDT({ a: { b: { id: 1 } } }, { a: { b: { id: '1-1' } } }, []);

    crdt.update({ a: { c: { id: 3 } } }, '2-1');
    t.deepEqual(crdt.data(), { a: { b: { id: 1 }, c: { id: 3 } } });
});

test(`insert new value should resolve same level via node ID`, t => {
    const crdt = new BaseJsonCRDT({ a: 1 }, { a: '1-1' }, []);

    crdt.update({ a: 2 }, '2-1');
    t.deepEqual(crdt.data(), { a: 2 });

    crdt.update({ a: { b: 3 } }, '3-1');
    t.deepEqual(crdt.data(), { a: { b: 3 } });

    crdt.update({ a: { b: 3 } }, '3-2');
    t.deepEqual(crdt.data(), { a: { b: 3 } });
});

test(`nested insertion does respect timestamp of ancestor change`, t => {
    const crdt = new BaseJsonCRDT({ a: 1 }, { a: '1-1' }, []);

    crdt.update({ a: null }, '1-2');
    t.deepEqual(crdt.data(), {});

    crdt.update({ a: { b: 2 } }, '1-3');
    t.deepEqual(crdt.data(), { a: { b: 2 } });

    crdt.update({ a: { c: 3 } }, '1-1');
    t.deepEqual(crdt.data(), { a: { b: 2 } });
});

test(`deleting nested object results in partial deletes`, t => {
    const crdt1 = new BaseJsonCRDT({});

    crdt1.update({ a0: { a1: 'd' } }, '1-5');
    t.deepEqual(crdt1.data(), {
        a0: { a1: 'd' }
    });

    crdt1.update({ a0: { d1: 'b' } }, '2-1');
    t.deepEqual(crdt1.data(), {
        a0: { a1: 'd', d1: 'b' }
    });

    crdt1.update({ a0: null }, '2-2');
    t.deepEqual(crdt1.data(), { a0: { a1: 'd' } });

    // --------------------------------------------

    const crdt2 = new BaseJsonCRDT({});

    crdt2.update({ a0: { d1: 'b' } }, '2-1');
    t.deepEqual(crdt2.data(), {
        a0: { d1: 'b' }
    });

    crdt2.update({ a0: null }, '2-2');
    t.deepEqual(crdt2.data(), {});

    crdt2.update({ a0: { a1: 'd' } }, '1-5');
    t.deepEqual(crdt2.data(), { a0: { a1: 'd' } });
});

test(`overwriting nested object with atomic value results in partial deletes`, t => {
    const crdt1 = new BaseJsonCRDT({});

    crdt1.update({ a0: { a1: 'd' } }, '1-5');
    t.deepEqual(crdt1.data(), {
        a0: { a1: 'd' }
    });

    crdt1.update({ a0: { d1: 'b' } }, '2-1');
    t.deepEqual(crdt1.data(), {
        a0: { a1: 'd', d1: 'b' }
    });

    crdt1.update({ a0: 'string' }, '2-2');
    t.deepEqual(crdt1.data(), { a0: { a1: 'd' } });

    // --------------------------------------------

    const crdt2 = new BaseJsonCRDT({});

    crdt2.update({ a0: { d1: 'b' } }, '2-1');
    t.deepEqual(crdt2.data(), {
        a0: { d1: 'b' }
    });

    crdt2.update({ a0: 'string' }, '2-2');
    t.deepEqual(crdt2.data(), { a0: 'string' });

    crdt2.update({ a0: { a1: 'd' } }, '1-5');
    t.deepEqual(crdt2.data(), { a0: { a1: 'd' } });
});

test(`Nested inserts only take ancestor timestamp into account`, t => {
    const crdt1 = new BaseJsonCRDT({});

    crdt1.update({ c0: 'f' }, '1-1');
    t.deepEqual(crdt1.data(), {
        c0: 'f'
    });

    crdt1.update({ c0: null }, '1-2');
    t.deepEqual(crdt1.data(), {});

    crdt1.update({ c0: { c1: 'f' } }, '2-2');
    t.deepEqual(crdt1.data(), { c0: { c1: 'f' } });

    // --------------------------------------------

    const crdt2 = new BaseJsonCRDT({});

    crdt2.update({ c0: { c1: 'f' } }, '2-5');
    t.deepEqual(crdt2.data(), {
        c0: { c1: 'f' }
    });

    crdt2.update({ c0: null }, '1-5');
    t.deepEqual(crdt2.data(), { c0: { c1: 'f' } });
});

test('deleting deleting non-existing nested values create nested objects', t => {
    const crdt1 = new BaseJsonCRDT({});

    crdt1.update({ a: { b: { c: 1, d: { e: 2 } } } }, '1-1');
    t.deepEqual(crdt1.data(), { a: { b: { c: 1, d: { e: 2 } } } });

    crdt1.update({ a: null }, '1-2');
    t.deepEqual(crdt1.data(), {});

    crdt1.update({ a: { b: { c: null } } }, '1-3');
    t.deepEqual(crdt1.data(), { a: { b: {} } });
});

test('nested empty objects get deleted on partial deletes', t => {
    const crdt1 = new BaseJsonCRDT(
        { a: { b: { c: 1 }, d: 3 } },
        {
            a: { b: { c: '1-1' }, d: '1-4' }
        },
        []
    );

    crdt1.update({ a: { b: { c: null } } }, '1-2');
    t.deepEqual(crdt1.data(), {
        a: { b: {}, d: 3 }
    });

    crdt1.update({ a: null }, '1-3');
    t.deepEqual(crdt1.data(), {
        a: { d: 3 }
    });
});

test('inserting nested numeric keys does not create arrays but regular objects', t => {
    const crdt = new BaseJsonCRDT(
        { a: { b: 1 } },
        {
            a: { b: '1-4' }
        },
        []
    );

    crdt.update({ a: { 0: 2 } }, '1-1');
    t.deepEqual(crdt.data(), {
        a: { b: 1, 0: 2 }
    });

    crdt.update({ a: { c: { 0: 'foo' } } }, '1-2');
    t.deepEqual(crdt.data(), {
        a: { b: 1, 0: 2, c: { 0: 'foo' } }
    });
});

test('setting nested keys containing dots does not result in more nested objects', t => {
    const crdt = new BaseJsonCRDT(
        { a: {} },
        {
            a: '0-0'
        },
        []
    );

    crdt.update({ a: { 'this.has.dots': 3 } }, '1-1');
    t.deepEqual(crdt.data(), {
        a: { 'this.has.dots': 3 }
    });

    crdt.update({ x: { a: { 'this.has.dots': { b: { c: 'test.123' } } } } }, '1-1');
    t.deepEqual(crdt.data(), {
        a: { 'this.has.dots': 3 },
        x: { a: { 'this.has.dots': { b: { c: 'test.123' } } } }
    });
});

// ---------------------------------------------------------------------
// _getClosestAncestorWithTimestamp
// ---------------------------------------------------------------------

test('_getClosestAncestorWithTimestamp returns closest ancestor with timestamp', t => {
    const crdt1 = new BaseJsonCRDT({ a: { b: { c: 1 } } }, { a: { b: { c: '1-1' } } }, []);

    t.deepEqual(crdt1._getClosestAncestorWithTimestamp(['a', 'b', 'c']), {
        path: ['a', 'b', 'c'],
        timestamp: new Clock('1-1'),
        value: 1
    });
    t.deepEqual(crdt1._getClosestAncestorWithTimestamp(['a', 'b', 'c', 'd']), {
        path: ['a', 'b', 'c'],
        timestamp: new Clock('1-1'),
        value: 1
    });
    t.deepEqual(crdt1._getClosestAncestorWithTimestamp(['a', 'b', 'c', 'd', 'e']), {
        path: ['a', 'b', 'c'],
        timestamp: new Clock('1-1'),
        value: 1
    });

    const crdt2 = new BaseJsonCRDT({ a: 1, b: 2 }, { a: '1-1', b: '1-2' }, []);

    t.deepEqual(crdt2._getClosestAncestorWithTimestamp(['a']), {
        path: ['a'],
        timestamp: new Clock('1-1'),
        value: 1
    });

    t.deepEqual(crdt2._getClosestAncestorWithTimestamp(['b']), {
        path: ['b'],
        timestamp: new Clock('1-2'),
        value: 2
    });
});

test('_getClosestAncestorWithTimestamp returns minimum timestamp when no timestamp is found', t => {
    const crdt1 = new BaseJsonCRDT({ a: { b: { c: 1 } } }, { a: { b: { c: '1-1' } } }, []);

    t.deepEqual(crdt1._getClosestAncestorWithTimestamp(['x']), {
        path: ['x'],
        timestamp: new Clock('0-0'),
        value: undefined
    });
    t.deepEqual(crdt1._getClosestAncestorWithTimestamp(['x', 'y']), {
        path: ['x'],
        timestamp: new Clock('0-0'),
        value: undefined
    });
});

test('_getClosestAncestorWithTimestamp returns minimum clock when ignoring children and object has no _self timestamp', t => {
    const crdt = new BaseJsonCRDT({ a: { b: { c: 1 } } }, { a: { b: { c: '1-1' } } }, []);

    t.deepEqual(crdt._getClosestAncestorWithTimestamp(['a'], true), {
        path: ['a'],
        timestamp: new Clock('0-0'),
        value: {
            b: { c: 1 }
        }
    });
});

test('_hasObjectAncestor', t => {
    const crdt = new BaseJsonCRDT({ a: { b: { c: 1 }, arr: ['1'] }, x: 9 });

    // True for existing properties.
    t.true(crdt._hasObjectAncestor(['a']));
    t.true(crdt._hasObjectAncestor(['x']));

    // True for non-existing properties, because the root is an object.
    t.true(crdt._hasObjectAncestor(['y']));
    t.true(crdt._hasObjectAncestor(['y', 'z']));

    // True for nested existing and non-existing properties.
    t.true(crdt._hasObjectAncestor(['a', 'd']));
    t.true(crdt._hasObjectAncestor(['a', 'b']));
    t.true(crdt._hasObjectAncestor(['a', 'b', 'c']));

    // False for properties nested in an atomic value.
    t.false(crdt._hasObjectAncestor(['a', 'b', 'c', 'd']));
    t.false(crdt._hasObjectAncestor(['a', 'b', 'c', 'd', 'e']));

    // False for properties nested in an array.
    t.false(crdt._hasObjectAncestor(['a', 'arr', '0']));
});

test('_initData filters out null values', t => {
    const crdt = new BaseJsonCRDT({ a: null, b: { c: null, d: 1 }, x: 'string', y: 'null' });

    t.deepEqual(crdt.data(), {
        b: { d: 1 },
        x: 'string',
        y: 'null'
    });
});

test('_getTimestamp', t => {
    const crdt = new BaseJsonCRDT(
        { a: { b: { c: 1 } }, 0: { 1: '1-1' } },
        { a: { b: { c: '1-1' } }, 0: { 1: '1-3' } },
        []
    );

    t.deepEqual(crdt._getTimestamp(['a', 'b', 'c']), '1-1');
    t.deepEqual(crdt._getTimestamp(['a', 'b', 'c', 'd']), undefined);
    t.deepEqual(crdt._getTimestamp(['a', 'b', 'd']), undefined);
    t.deepEqual(crdt._getTimestamp(['a', 'b']), {
        c: '1-1'
    });
    t.deepEqual(crdt._getTimestamp(['a']), {
        b: { c: '1-1' }
    });

    t.deepEqual(crdt._getTimestamp(['0', '1']), '1-3');
    t.deepEqual(crdt._getTimestamp(['0', '1', '1']), undefined);
    t.deepEqual(crdt._getTimestamp(['0']), {
        1: '1-3'
    });

    t.deepEqual(crdt._getTimestamp(['x']), undefined);
});
