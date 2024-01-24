import test from 'ava';
import { CRDTWithClock } from './crdtWithClock.js';
import { cloneDeep } from 'lodash';

test(`crdt internals are immuatable`, t => {
    const crdt = new CRDTWithClock(2, { key: { data: { json: { d: { e: { f: 'str' } } } } } });

    // data is immutable
    const data = crdt.data();
    data.key.data.json.d.e.f = 'not str';
    t.deepEqual(crdt.data(), { key: { data: { json: { d: { e: { f: 'str' } } } } } });

    // perform update to be sure there are timestamps
    crdt.foreignUpdate({
        data: { key: { data: { json: { d: { e: { f: 'new str' } } } } } },
        timestamp: '1-1'
    });

    // timestamps are immutable
    const timestamps = crdt.timestamps();
    timestamps.key.data.json.d.e.f = '4-9';
    t.deepEqual(crdt.timestamps(), { key: { data: { json: { d: { e: { f: '1-1' } } } } } });
});

test(`crdt basic init`, t => {
    // unnested basic object
    const crdt = new CRDTWithClock(1, { key: 'str', data: 2, json: 3 });
    t.deepEqual(crdt.data(), { key: 'str', data: 2, json: 3 });

    // deeply nested object
    const crdt2 = new CRDTWithClock(2, {
        key: { data: { json: { 'another key': { e: { f: 'str' } } } } }
    });
    t.deepEqual(crdt2.data(), { key: { data: { json: { 'another key': { e: { f: 'str' } } } } } });

    // empty object
    const crdt3 = new CRDTWithClock(3, {});
    t.deepEqual(crdt3.data(), {});

    // with existing TimestampObj
    const TimestampObj = crdt2.timestamps();
    const crdt4 = new CRDTWithClock(
        4,
        { key: { data: { json: { 'another key': { e: { f: 'str' } } } } } },
        TimestampObj
    );
    t.deepEqual(crdt4.data(), { key: { data: { json: { 'another key': { e: { f: 'str' } } } } } });
});

test(`init crdt with array fields`, t => {
    // Note: Right now, arrays behave just as other atomic-objects like strings or numbers, i.e., each update overwrites the array.
    // TODO: Theses tests should be updated to reflect the merging behavior of arrays once this functionality gets implemented.

    const crdt = new CRDTWithClock(1, { key: [1, 2, 3] });
    t.deepEqual(crdt.data(), { key: [1, 2, 3] });

    const crdt2 = new CRDTWithClock(2, {
        key: [1, 2, 3],
        data: {
            json: {
                'another key': [
                    { x: 123, y: 456 },
                    { x: 543, y: 543 }
                ]
            }
        }
    });
    t.deepEqual(crdt2.data(), {
        key: [1, 2, 3],
        data: {
            json: {
                'another key': [
                    { x: 123, y: 456 },
                    { x: 543, y: 543 }
                ]
            }
        }
    });
});

test(`flat update`, t => {
    const crdt = new CRDTWithClock(1, { key: 'str', data: 2, json: 3 });
    crdt.selfUpdate({ key: 'value', data: 3 });
    t.deepEqual(crdt.data(), { key: 'value', data: 3, json: 3 });
});

test(`flat foreign updates get denied for outdated timestamps`, t => {
    const crdt = new CRDTWithClock(1, { key: 'str', data: 2, json: 3 });
    crdt.foreignUpdate({ data: { key: 'value', data: 3 }, timestamp: '1-1' });
    crdt.foreignUpdate({ data: { data: 1000 }, timestamp: '1-0' });
    crdt.foreignUpdate({ data: { data: 1231232 }, timestamp: '1-0' });
    t.deepEqual(crdt.data(), { key: 'value', data: 3, json: 3 });
    crdt.foreignUpdate({ data: { key: 20 }, timestamp: '1-2' });
    crdt.foreignUpdate({ data: { key: -1 }, timestamp: '1-1' });
    t.deepEqual(crdt.data(), { key: 20, data: 3, json: 3 });
});

test(`flat state diverges before patch exchange`, t => {
    const initObj = { key: 0, data: 0, json: 0 };

    const crdt1 = new CRDTWithClock(1, cloneDeep(initObj));
    const crdt2 = new CRDTWithClock(2, cloneDeep(initObj));

    crdt1.selfUpdate({ key: 'str' });
    crdt2.selfUpdate({ data: 2 });

    t.deepEqual(crdt1.data(), { key: 'str', data: 0, json: 0 });
    t.deepEqual(crdt2.data(), { key: 0, data: 2, json: 0 });
});

test(`flat non-conflicting updates from multiple users get merged`, t => {
    const initObj = { key: 0, data: 0, json: 0 };

    const crdt1 = new CRDTWithClock(1, cloneDeep(initObj));
    const patch1 = crdt1.selfUpdate({ key: 'str' });

    const crdt2 = new CRDTWithClock(2, cloneDeep(initObj));
    const patch2 = crdt2.selfUpdate({ data: 2 });

    const crdt3 = new CRDTWithClock(3, cloneDeep(initObj));
    const patch3 = crdt3.selfUpdate({ json: 3 });

    crdt1.foreignUpdate(patch2);
    crdt1.foreignUpdate(patch3);

    crdt2.foreignUpdate(patch1);
    crdt2.foreignUpdate(patch3);

    crdt3.foreignUpdate(patch1);
    crdt3.foreignUpdate(patch2);

    t.deepEqual(crdt1.data(), { key: 'str', data: 2, json: 3 });
    t.deepEqual(crdt1.data(), crdt2.data());
    t.deepEqual(crdt2.data(), crdt3.data());
});

test(`flat conflicting updates from multiple users get merged`, t => {
    const initObj = { key: 0, data: 0, json: 0 };

    const crdt1 = new CRDTWithClock(1, cloneDeep(initObj));
    const crdt2 = new CRDTWithClock(2, cloneDeep(initObj));
    const crdt3 = new CRDTWithClock(3, cloneDeep(initObj));

    const patch3 = crdt3.selfUpdate({ key: 3 });
    crdt1.foreignUpdate(patch3);
    crdt2.foreignUpdate(patch3);

    const patch2 = crdt2.selfUpdate({ key: 2 });
    crdt1.foreignUpdate(patch2);
    crdt3.foreignUpdate(patch2);

    const patch1 = crdt1.selfUpdate({ key: 'str' });
    crdt2.foreignUpdate(patch1);
    crdt3.foreignUpdate(patch1);

    // user 'str'wins because he made the latest update
    t.deepEqual(crdt1.data(), { key: 'str', data: 0, json: 0 });
    t.deepEqual(crdt1.data(), crdt2.data());
    t.deepEqual(crdt2.data(), crdt3.data());
});

test(`flat conflicting updates with equal timestamp from multiple users get merged`, t => {
    // unnested object

    const initObj = { key: 0, data: 0, json: 0 };

    const crdt1 = new CRDTWithClock(1, cloneDeep(initObj));
    const patch1 = crdt1.selfUpdate({ key: 'str' });

    const crdt2 = new CRDTWithClock(2, cloneDeep(initObj));
    const patch2 = crdt2.selfUpdate({ key: 2 });

    const crdt3 = new CRDTWithClock(3, cloneDeep(initObj));
    const patch3 = crdt3.selfUpdate({ key: 3 });

    crdt1.foreignUpdate(patch2);
    crdt1.foreignUpdate(patch3);

    crdt2.foreignUpdate(patch1);
    crdt2.foreignUpdate(patch3);

    crdt3.foreignUpdate(patch1);
    crdt3.foreignUpdate(patch2);

    // user 3 wins because of highest id
    t.deepEqual(crdt1.data(), { key: 3, data: 0, json: 0 });
    t.deepEqual(crdt1.data(), crdt2.data());
    t.deepEqual(crdt2.data(), crdt3.data());
});

test(`flat users miss intermediate update for conflicting updates`, t => {
    const initObj = { key: 0, data: 0, json: 0 };

    const crdt1 = new CRDTWithClock(1, cloneDeep(initObj));
    const crdt2 = new CRDTWithClock(2, cloneDeep(initObj));
    const crdt3 = new CRDTWithClock(3, cloneDeep(initObj));

    const patch1 = crdt3.selfUpdate({ key: 3 });
    crdt2.foreignUpdate(patch1);
    // crdt3 doesn't receive patch1

    const patch2 = crdt2.selfUpdate({ key: 999 });
    crdt1.foreignUpdate(patch2);
    crdt3.foreignUpdate(patch2);

    // user 'str'wins because he made the latest update
    t.deepEqual(crdt1.data(), { key: 999, data: 0, json: 0 });
    t.deepEqual(crdt1.data(), crdt2.data());
    t.deepEqual(crdt2.data(), crdt3.data());
});

test(`nested update`, t => {
    const crdt = new CRDTWithClock(2, {
        key: { data: { json: { 'another key': { e: { f: 'str' } } } } }
    });
    crdt.selfUpdate({ key: { data: { json: { 'another key': { e: { f: 2 } } } } } });
    t.deepEqual(crdt.data(), { key: { data: { json: { 'another key': { e: { f: 2 } } } } } });
});

test(`nested foreign updates get denied for outdated timestamps`, t => {
    const crdt = new CRDTWithClock(2, {
        key: { data: { json: { 'another key': { e: { f: 'str', g: 0 } } } } }
    });
    crdt.foreignUpdate({
        data: { key: { data: { json: { 'another key': { e: { f: 2 } } } } } },
        timestamp: '1-1000'
    });

    crdt.foreignUpdate({
        data: { key: { data: { json: { 'another key': { e: { f: 1000 } } } } } },
        timestamp: '1-5'
    });
    crdt.foreignUpdate({
        data: { key: { data: { json: { 'another key': { e: { f: 123123, g: true } } } } } },
        timestamp: '1-100'
    });
    t.deepEqual(crdt.data(), {
        key: { data: { json: { 'another key': { e: { f: 2, g: true } } } } }
    });
    crdt.foreignUpdate({
        data: { key: { data: { json: { 'another key': { e: { f: 20 } } } } } },
        timestamp: '1-2000'
    });
    crdt.foreignUpdate({
        data: { key: { data: { json: { 'another key': { e: { f: -1 } } } } } },
        timestamp: '1-1500'
    });
    t.deepEqual(crdt.data(), {
        key: { data: { json: { 'another key': { e: { f: 20, g: true } } } } }
    });
});

test(`nested non-conflicting updates from multiple users get merged`, t => {
    const initObj = { x: { y: { z: { key: 0, data: 0, json: 0 } } } };

    const crdt1 = new CRDTWithClock(1, cloneDeep(initObj));
    const patch1 = crdt1.selfUpdate({ x: { y: { z: { key: 'str' } } } });

    const crdt2 = new CRDTWithClock(2, cloneDeep(initObj));
    const patch2 = crdt2.selfUpdate({ x: { y: { z: { data: 2 } } } });

    const crdt3 = new CRDTWithClock(3, cloneDeep(initObj));
    const patch3 = crdt3.selfUpdate({ x: { y: { z: { json: 3 } } } });

    crdt1.foreignUpdate(patch2);
    crdt1.foreignUpdate(patch3);

    crdt2.foreignUpdate(patch1);
    crdt2.foreignUpdate(patch3);

    crdt3.foreignUpdate(patch1);
    crdt3.foreignUpdate(patch2);

    t.deepEqual(crdt1.data(), { x: { y: { z: { key: 'str', data: 2, json: 3 } } } });
    t.deepEqual(crdt1.data(), crdt2.data());
    t.deepEqual(crdt2.data(), crdt3.data());
});

test(`nested conflicting updates from multiple users get merged`, t => {
    const initObj = { x: { y: { z: { key: 0, data: 0, json: 0 } } } };

    const crdt1 = new CRDTWithClock(1, cloneDeep(initObj));

    const crdt2 = new CRDTWithClock(2, cloneDeep(initObj));

    const crdt3 = new CRDTWithClock(3, cloneDeep(initObj));

    const patch3 = crdt3.selfUpdate({ x: { y: { z: { key: 3 } } } });
    crdt1.foreignUpdate(patch3);
    crdt2.foreignUpdate(patch3);

    const patch2 = crdt2.selfUpdate({ x: { y: { z: { key: 2 } } } });
    crdt1.foreignUpdate(patch2);
    crdt3.foreignUpdate(patch2);

    const patch1 = crdt1.selfUpdate({ x: { y: { z: { key: 'str' } } } });
    crdt2.foreignUpdate(patch1);
    crdt3.foreignUpdate(patch1);

    // user 'str'wins because he made the latest update
    t.deepEqual(crdt1.data(), { x: { y: { z: { key: 'str', data: 0, json: 0 } } } });
    t.deepEqual(crdt1.data(), crdt2.data());
    t.deepEqual(crdt2.data(), crdt3.data());
});

test(`nested conflicting updates with equal timestamp from multiple users get merged`, t => {
    const initObj = { x: { y: { z: { key: 0, data: 0, json: 0 } } } };

    const crdt3 = new CRDTWithClock(3, cloneDeep(initObj));
    const patch3 = crdt3.selfUpdate({ x: { y: { z: { json: 3 } } } });

    const crdt1 = new CRDTWithClock(1, cloneDeep(initObj));
    const patch1 = crdt1.selfUpdate({ x: { y: { z: { key: 'str' } } } });

    const crdt2 = new CRDTWithClock(2, cloneDeep(initObj));
    const patch2 = crdt2.selfUpdate({ x: { y: { z: { data: 2 } } } });

    crdt1.foreignUpdate(patch2);
    crdt1.foreignUpdate(patch3);

    crdt2.foreignUpdate(patch1);
    crdt2.foreignUpdate(patch3);

    crdt3.foreignUpdate(patch1);
    crdt3.foreignUpdate(patch2);

    // user 3 wins because of highest id
    t.deepEqual(crdt1.data(), { x: { y: { z: { key: 'str', data: 2, json: 3 } } } });
    t.deepEqual(crdt1.data(), crdt2.data());
    t.deepEqual(crdt2.data(), crdt3.data());
});

test(`nested user misses intermediate update for conflicting updates`, t => {
    const initObj = { x: { y: { z: { key: 0, data: 0, json: 0 } } } };

    const crdt1 = new CRDTWithClock(1, cloneDeep(initObj));
    const crdt2 = new CRDTWithClock(2, cloneDeep(initObj));
    const crdt3 = new CRDTWithClock(3, cloneDeep(initObj));

    const patch1 = crdt3.selfUpdate({ x: { y: { z: { key: 3 } } } });
    crdt2.foreignUpdate(patch1);
    // crdt3 doesn't receive patch1_1

    const patch2 = crdt2.selfUpdate({ x: { y: { z: { key: 999 } } } });
    crdt1.foreignUpdate(patch2);
    crdt3.foreignUpdate(patch2);

    // user 'str'wins because he made the latest update
    t.deepEqual(crdt1.data(), { x: { y: { z: { key: 999, data: 0, json: 0 } } } });
    t.deepEqual(crdt1.data(), crdt2.data());
    t.deepEqual(crdt2.data(), crdt3.data());
});

test(`update with array fields`, t => {
    // solo update
    const crdt = new CRDTWithClock(1, { key: [1, 2, 3] });
    crdt.selfUpdate({ key: [7, 8, 9] });
    t.deepEqual(crdt.data(), { key: [7, 8, 9] });

    // multi client updates (no conflicts)
    const crdt1 = new CRDTWithClock(1, { key: [1, 2, 3], data: [10, 100, 100] });
    const crdt2 = new CRDTWithClock(2, { key: [1, 2, 3], data: [10, 100, 100] });

    const patch1 = crdt1.selfUpdate({ key: [7, 8, 9] });
    const patch2 = crdt2.selfUpdate({ data: [10, 100, 100, 1000] });

    crdt1.foreignUpdate(patch2);
    crdt2.foreignUpdate(patch1);

    t.deepEqual(crdt1.data(), { key: [7, 8, 9], data: [10, 100, 100, 1000] });
    t.deepEqual(crdt1.data(), crdt2.data());

    // multi client updates (conflicts)

    const crdt3 = new CRDTWithClock(3, { key: [1, 2, 3], data: [10, 100, 100] });
    const crdt4 = new CRDTWithClock(4, { key: [1, 2, 3], data: [10, 100, 100] });

    const patch3 = crdt3.selfUpdate({ key: [7, 8, 9] });
    const patch4 = crdt4.selfUpdate({ key: [7, 8, 9, 10] });

    crdt3.foreignUpdate(patch4);
    crdt4.foreignUpdate(patch3);

    // user 4 wins because of higher user id
    t.deepEqual(crdt3.data(), { key: [7, 8, 9, 10], data: [10, 100, 100] });
    t.deepEqual(crdt3.data(), crdt4.data());
});

test(`add new fields single client`, t => {
    const crdt = new CRDTWithClock(1, { key: 'str' });

    // add a new field
    crdt.selfUpdate({ key: 'value', data: 3 });
    t.deepEqual(crdt.data(), { key: 'value', data: 3 });

    // add a new nested field
    crdt.selfUpdate({ json: { 'another key': { e: 9 } } });
    t.deepEqual(crdt.data(), { key: 'value', data: 3, json: { 'another key': { e: 9 } } });

    // add a whole new nested object
    crdt.selfUpdate({ x: { y: 3, z: 4, i: { j: 'hello', k: 'untouched', abc: { f: 234 } } } });
    t.deepEqual(crdt.data(), {
        key: 'value',
        data: 3,
        json: { 'another key': { e: 9 } },
        x: { y: 3, z: 4, i: { j: 'hello', k: 'untouched', abc: { f: 234 } } }
    });

    // update new fields
    crdt.selfUpdate({ data: 8, x: { y: 5, i: { j: 6, abc: { f: 8 } } } });
    t.deepEqual(crdt.data(), {
        key: 'value',
        data: 8,
        json: { 'another key': { e: 9 } },
        x: { y: 5, z: 4, i: { j: 6, k: 'untouched', abc: { f: 8 } } }
    });
});

test(`add new fields multi client`, t => {
    const crdt1 = new CRDTWithClock(1, { key: 'str' });
    const crdt2 = new CRDTWithClock(2, { key: 'str' });

    // add a new field
    const patch1 = crdt1.selfUpdate({ data: 2 });
    crdt2.foreignUpdate(patch1);
    t.deepEqual(crdt1.data(), { key: 'str', data: 2 });
    t.deepEqual(crdt1.data(), crdt2.data());

    // add a conflicting new field
    const patch2 = crdt2.selfUpdate({ json: 3 });
    const patch1B = crdt1.selfUpdate({ json: -9 });
    crdt1.foreignUpdate(patch2);
    crdt2.foreignUpdate(patch1B);

    // user 2 wins because of higher user id
    t.deepEqual(crdt1.data(), { key: 'str', data: 2, json: 3 });
    t.deepEqual(crdt1.data(), crdt2.data());
});
