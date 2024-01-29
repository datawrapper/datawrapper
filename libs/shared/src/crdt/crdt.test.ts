import test from 'ava';
import { Timestamps } from './clock.js';
import { CRDT } from './crdt.js';
import { cloneDeep } from 'lodash';

test(`getters return immutable objects`, t => {
    const crdt = new CRDT({ a: 1, b: 2, c: 3 });

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
    const crdt1 = new CRDT({ a: 'some value', b: 2, c: 3 });
    t.deepEqual(crdt1.data(), { a: 'some value', b: 2, c: 3 });

    // deeply nested object
    const crdt2 = new CRDT({ a: { b: { c: { d: { e: { f: 1 } } } } } });
    t.deepEqual(crdt2.data(), { a: { b: { c: { d: { e: { f: 1 } } } } } });

    // object with arrays
    const crdt3 = new CRDT({ a: [1, 2, 3], b: [4, 5, 6] });
    t.deepEqual(crdt3.data(), { a: [1, 2, 3], b: [4, 5, 6] });

    // with timestamps
    type D = { a: string; b: number; c: number };
    const data = { a: 'some value', b: 2, c: 3 };
    const timestamps: Timestamps<D> = {
        a: '1-1',
        b: '1-100',
        c: '1-1000'
    };
    const crdt = new CRDT(cloneDeep(data), cloneDeep(timestamps));
    t.deepEqual(crdt.data(), data);
    t.deepEqual(crdt.timestamps(), timestamps);
});

test(`basic updates work`, t => {
    // flat object

    const crdt1 = new CRDT({ a: 'some value', b: 2, c: 3 });
    crdt1.update({ a: 2, b: 3 }, '1-1');
    t.deepEqual(crdt1.data(), { a: 2, b: 3, c: 3 });

    // deeply nested object

    const crdt2 = new CRDT({ a: { b: { c: { d: { e: { f: 1 } } } } } });
    crdt2.update({ a: { b: { c: { d: { e: { f: 2 } } } } } }, '1-1');
    t.deepEqual(crdt2.data(), { a: { b: { c: { d: { e: { f: 2 } } } } } });
});

test(`updates get denied for outdated timestamps`, t => {
    // flat object

    const crdt1 = new CRDT({ a: 'some value', b: 2, c: 3 });
    crdt1.update({ a: 2, b: 3 }, '1-1');
    crdt1.update({ b: 1000 }, '1-0');
    crdt1.update({ b: 1231232 }, '1-0');
    t.deepEqual(crdt1.data(), { a: 2, b: 3, c: 3 });
    crdt1.update({ a: 20 }, '1-2');
    crdt1.update({ a: -1 }, '1-1');
    t.deepEqual(crdt1.data(), { a: 20, b: 3, c: 3 });

    // deeply nested object

    const crdt2 = new CRDT({ a: { b: { c: { d: { e: { f: 1 } } } } } });
    crdt2.update({ a: { b: { c: { d: { e: { f: 2 } } } } } }, '1-1');
    crdt2.update({ a: { b: { c: { d: { e: { f: 1000 } } } } } }, '2-0');
    t.deepEqual(crdt2.data(), { a: { b: { c: { d: { e: { f: 2 } } } } } });
});

test(`updates with same clock value only get applied for higher nodeIds `, t => {
    const crdt = new CRDT({ a: 'some value', b: 2, c: { key: 'value' } });
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
    const crdt = new CRDT({ a: 'some value', b: 2, c: { key: 'value' } });
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
    const crdt = new CRDT({ a: [1, 2, 3], b: [4, 5, 6] });
    crdt.update({ a: [1, 2, 3, 4] }, '1-1');
    crdt.update({ b: [4, 5, 6, 7] }, '2-1');
    t.deepEqual(crdt.data(), {
        a: [1, 2, 3, 4],
        b: [4, 5, 6, 7]
    });

    // overwriting update
    const crdt2 = new CRDT({ a: [1, 2, 3], b: [4, 5, 6] });
    crdt2.update({ a: [1, 2, 3, 4] }, '1-1');
    crdt2.update({ b: [4, 5, 6, 7] }, '2-1');
    crdt2.update({ a: [1, 2, 3, 4, 5, 6, 7] }, '3-1');
    t.deepEqual(crdt2.data(), {
        a: [1, 2, 3, 4, 5, 6, 7],
        b: [4, 5, 6, 7]
    });

    // nested arrays
    const crdt3 = new CRDT({ a: [1, 2, 3], b: [4, 5, 6] });
    crdt3.update({ a: [1, [2, 3], 4] }, '1-1');
    crdt3.update({ b: [4, 5, [6, 7]] }, '2-1');
    t.deepEqual(crdt3.data(), {
        a: [1, [2, 3], 4],
        b: [4, 5, [6, 7]]
    });

    // arrays with objects
    const crdt4 = new CRDT({ a: [{ a: 1 }, { b: 2 }], b: [{ c: 3 }, { d: 4 }] });
    crdt4.update({ a: [{ a: 1 }, { b: 2 }, { c: 3 }] }, '1-1');
    crdt4.update({ b: [{ c: 3 }, { d: 4 }, { e: 5 }] }, '2-1');
    t.deepEqual(crdt4.data(), {
        a: [{ a: 1 }, { b: 2 }, { c: 3 }],
        b: [{ c: 3 }, { d: 4 }, { e: 5 }]
    });
});

test(`updates with empty data`, t => {
    const crdt = new CRDT({ a: 'some value', b: 2, c: { key: 'value' } });
    crdt.update({}, '1-1');
    t.deepEqual(crdt.data(), { a: 'some value', b: 2, c: { key: 'value' } });
});

test(`adding new keys`, t => {
    const crdt = new CRDT({ a: 'some value', b: { key: 'value' } });

    crdt.update({ c: 'new key' }, '1-1');

    t.deepEqual(crdt.data(), {
        a: 'some value',
        b: { key: 'value' },
        c: 'new key'
    });
});

test('crdt can be initialized with existing timestamp object', t => {
    const crdt = new CRDT(
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

test('CRDT.calculatePatch calculates the correct patch (simple updates)', t => {
    const oldData = { a: 'some value', b: { key: 'value' } };

    const newData = { a: 'new value', b: { key: 'value' } };

    const patch = CRDT.calculatePatch(oldData, newData);

    t.deepEqual(patch, {
        a: 'new value'
    });

    // make sure that the patch applied again as update to the CRDT yields the same object
    const crdt = new CRDT(oldData);
    crdt.update(patch, '1-1');
    t.deepEqual(crdt.data(), newData);
});

test('CRDT.calculatePatch calculates the correct patch (simple arrays)', t => {
    const oldData = { a: 'some value', b: ['A', 'B', 'C'] };

    const newData = { a: 'some value', b: ['D', 'C', 'E'] };

    const patch = CRDT.calculatePatch(oldData, newData);

    t.deepEqual(patch, {
        b: ['D', 'C', 'E']
    });

    // make sure that the patch applied again as update to the CRDT yields the same object
    const crdt = new CRDT(oldData);
    crdt.update(patch, '1-1');
    t.deepEqual(crdt.data(), newData);
});

test('CRDT.calculatePatch calculates the correct patch (item array - simple updates)', t => {
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

    const patch = CRDT.calculatePatch(oldData, newData);

    t.deepEqual(patch, {
        b: { C: { value: 99 } }
    });

    // make sure that the patch applied again as update to the CRDT yields the same object
    // const crdt = new CRDT(oldData);
    // crdt.update(patch, '1-1');
    // t.deepEqual(crdt.data(), newData);
});

test('CRDT.calculatePatch calculates the correct patch (item array - insertion at end)', t => {
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

    const patch = CRDT.calculatePatch(oldData, newData);

    t.deepEqual(patch, {
        b: { D: { id: 'D', value: 4, _index: 3 } }
    });

    // make sure that the patch applied again as update to the CRDT yields the same object
    // const crdt = new CRDT(oldData);
    // crdt.update(patch, '1-1');
    // t.deepEqual(crdt.data(), newData);
});

test('CRDT.calculatePatch calculates the correct patch (item array - insertion at start)', t => {
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

    const patch = CRDT.calculatePatch(oldData, newData);

    t.deepEqual(patch, {
        b: {
            D: { id: 'D', value: 4, _index: 0 },
            A: { _index: 1 },
            B: { _index: 2 },
            C: { _index: 3 }
        }
    });

    // make sure that the patch applied again as update to the CRDT yields the same object
    // const crdt = new CRDT(oldData);
    // crdt.update(patch, '1-1');
    // t.deepEqual(crdt.data(), newData);
});

test('CRDT.calculatePatch calculates the correct patch (item array - insertion in middle)', t => {
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

    const patch = CRDT.calculatePatch(oldData, newData);

    t.deepEqual(patch, {
        b: {
            D: { id: 'D', value: 4, _index: 2 },
            C: { _index: 3 }
        }
    });

    // make sure that the patch applied again as update to the CRDT yields the same object
    // const crdt = new CRDT(oldData);
    // crdt.update(patch, '1-1');
    // t.deepEqual(crdt.data(), newData);
});

test('CRDT.calculatePatch calculates the correct patch (item array - deletion at end)', t => {
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

    const patch = CRDT.calculatePatch(oldData, newData);

    t.deepEqual(patch, {
        b: {
            C: { _index: null }
        }
    });

    // make sure that the patch applied again as update to the CRDT yields the same object
    // const crdt = new CRDT(oldData);
    // crdt.update(patch, '1-1');
    // t.deepEqual(crdt.data(), newData);
});

test('CRDT.calculatePatch calculates the correct patch (item array - deletion at beginning)', t => {
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

    const patch = CRDT.calculatePatch(oldData, newData);

    t.deepEqual(patch, {
        b: {
            A: { _index: null },
            B: { _index: 0 },
            C: { _index: 1 }
        }
    });

    // make sure that the patch applied again as update to the CRDT yields the same object
    // const crdt = new CRDT(oldData);
    // crdt.update(patch, '1-1');
    // t.deepEqual(crdt.data(), newData);
});

test('CRDT.calculatePatch calculates the correct patch (item array - deletion in the middle)', t => {
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

    const patch = CRDT.calculatePatch(oldData, newData);

    t.deepEqual(patch, {
        b: {
            B: { _index: null },
            C: { _index: 1 }
        }
    });

    // make sure that the patch applied again as update to the CRDT yields the same object
    // const crdt = new CRDT(oldData);
    // crdt.update(patch, '1-1');
    // t.deepEqual(crdt.data(), newData);
});

test('CRDT.calculatePatch calculates the correct patch (item array - re-ordering two elements)', t => {
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

    const patch = CRDT.calculatePatch(oldData, newData);

    t.deepEqual(patch, {
        b: {
            A: { _index: 1 },
            B: { _index: 0 }
        }
    });

    // make sure that the patch applied again as update to the CRDT yields the same object
    // const crdt = new CRDT(oldData);
    // crdt.update(patch, '1-1');
    // t.deepEqual(crdt.data(), newData);
});

test('CRDT.calculatePatch calculates the correct patch (item array -  re-ordering multiple elements)', t => {
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

    const patch = CRDT.calculatePatch(oldData, newData);

    t.deepEqual(patch, {
        b: {
            A: { _index: 2 },
            B: { _index: 3 },
            C: { _index: 1 },
            D: { _index: 0 }
        }
    });

    // make sure that the patch applied again as update to the CRDT yields the same object
    // const crdt = new CRDT(oldData);
    // crdt.update(patch, '1-1');
    // t.deepEqual(crdt.data(), newData);
});
