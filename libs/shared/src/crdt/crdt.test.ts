import test from 'ava';
import { CRDT, Timestamps } from './crdt.js';
import { cloneDeep } from 'lodash';

test(`getters return immutable objects`, t => {
    const crdt = new CRDT({ a: 1, b: 2, c: 3 });

    const data = crdt.data();
    data.a = 99;
    t.deepEqual(crdt.data(), { a: 1, b: 2, c: 3 });

    const timestamps = crdt.timestamps();
    timestamps.a = '99-99';
    t.deepEqual(crdt.timestamps(), { a: '0-0', b: '0-0', c: '0-0' });
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
