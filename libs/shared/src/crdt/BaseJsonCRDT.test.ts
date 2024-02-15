import test from 'ava';
import { Timestamps } from './Clock.js';
import { BaseJsonCRDT } from './BaseJsonCRDT.js';
import { cloneDeep } from 'lodash';

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

    // with timestamps
    type D = { a: string; b: number; c: number };
    const data = { a: 'some value', b: 2, c: 3 };
    const timestamps: Timestamps<D> = {
        a: '1-1',
        b: '1-100',
        c: '1-1000'
    };
    const crdt = new BaseJsonCRDT(cloneDeep(data), cloneDeep(timestamps));
    t.deepEqual(crdt.data(), data);
    t.deepEqual(crdt.timestamps(), timestamps);
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

test('crdt can be initialized with existing timestamp object', t => {
    const crdt = new BaseJsonCRDT(
        {
            a: 'some value',
            b: { key: 'value' }
        },
        {
            a: '1-1',
            b: {
                key: '1-5'
            }
        }
    );

    // update with new data but only some is valid according to timestamps
    crdt.update(
        {
            a: 'new value',
            b: { key: 'outdated update' }
        },
        '1-2'
    );

    t.deepEqual(crdt.data(), {
        a: 'new value',
        b: { key: 'value' }
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

test("non-primitive fields can't be deleted", t => {
    const data = {
        emptyObj: {},
        nested: { key: 'value' },
        arr: [
            { id: '1', val: 'val1' },
            { id: '2', val: 'val2' }
        ]
    };
    const crdt = new BaseJsonCRDT(data);

    // delete item array
    t.throws(() => crdt.update({ arr: null }, '1-2'));
    t.deepEqual(crdt.data(), data);

    // delete object
    t.throws(() => crdt.update({ nested: null }, '1-3'));
    t.deepEqual(crdt.data(), data);

    // delete empty object
    t.throws(() => crdt.update({ emptyObj: null }, '1-4'));
    t.deepEqual(crdt.data(), data);
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

test('inserting empty object is rejected: path is primitive value', t => {
    const crdt = new BaseJsonCRDT({ a: 'some value', b: 8 });

    t.throws(() => crdt.update({ b: {} }, '1-1'));

    t.deepEqual(crdt.data(), { a: 'some value', b: 8 });
});

test('inserting empty object is rejected: path is array', t => {
    const crdt = new BaseJsonCRDT({ a: 'some value', b: 8 });

    t.throws(() => crdt.update({ b: {} }, '1-1'));

    t.deepEqual(crdt.data(), { a: 'some value', b: 8 });
});

test('inserting empty object is rejected: path is item array', t => {
    const crdt = new BaseJsonCRDT({ a: 'some value', b: 8 });

    t.throws(() => crdt.update({ b: {} }, '1-1'));

    t.deepEqual(crdt.data(), { a: 'some value', b: 8 });
});

test('re-initialization with timestamps after item array deletion', t => {
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
    const crdt2 = new BaseJsonCRDT(crdt.data(), crdt.timestamps());
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
    t.deepEqual(crdt.data(), { a: undefined, b: 'stays' });
});
