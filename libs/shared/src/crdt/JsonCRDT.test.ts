import test from 'ava';
import { JsonCRDT } from './JsonCRDT.js';
import { cloneDeep } from 'lodash';

test(`crdt internals are immuatable`, t => {
    const crdt = new JsonCRDT(2, { key: { data: { json: { d: { e: { f: 'str' } } } } } });

    // data is immutable
    const data = crdt.data();
    data.key.data.json.d.e.f = 'not str';
    t.deepEqual(crdt.data(), { key: { data: { json: { d: { e: { f: 'str' } } } } } });

    // perform update to be sure there are timestamps
    crdt.applyUpdate({
        diff: { key: { data: { json: { d: { e: { f: 'new str' } } } } } },
        timestamp: '1-1'
    });
});

test(`crdt basic init`, t => {
    // unnested basic object
    const crdt = new JsonCRDT(1, { key: 'str', data: 2, json: 3 });
    t.deepEqual(crdt.data(), { key: 'str', data: 2, json: 3 });

    // deeply nested object
    const crdt2 = new JsonCRDT(2, {
        key: { data: { json: { 'another key': { e: { f: 'str' } } } } }
    });
    t.deepEqual(crdt2.data(), { key: { data: { json: { 'another key': { e: { f: 'str' } } } } } });

    // empty object
    const crdt3 = new JsonCRDT(3, {});
    t.deepEqual(crdt3.data(), {});
});

test(`init crdt with array fields`, t => {
    // Note: Right now, arrays behave just as other atomic-objects like strings or numbers, i.e., each update overwrites the array.
    // TODO: Theses tests should be updated to reflect the merging behavior of arrays once this functionality gets implemented.

    const crdt = new JsonCRDT(1, { key: [1, 2, 3] });
    t.deepEqual(crdt.data(), { key: [1, 2, 3] });

    const crdt2 = new JsonCRDT(2, {
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
    const crdt = new JsonCRDT(1, { key: 'str', data: 2, json: 3 });
    crdt.createUpdate({ key: 'value', data: 3 });
    t.deepEqual(crdt.data(), { key: 'value', data: 3, json: 3 });
});

test(`flat updates get denied for outdated timestamps`, t => {
    const crdt = new JsonCRDT(1, { key: 'str', data: 2, json: 3 });
    crdt.applyUpdate({ diff: { key: 'value', data: 3 }, timestamp: '1-1' });
    crdt.applyUpdate({ diff: { data: 1000 }, timestamp: '1-0' });
    crdt.applyUpdate({ diff: { data: 1231232 }, timestamp: '1-0' });
    t.deepEqual(crdt.data(), { key: 'value', data: 3, json: 3 });
    crdt.applyUpdate({ diff: { key: 20 }, timestamp: '1-2' });
    crdt.applyUpdate({ diff: { key: -1 }, timestamp: '1-1' });
    t.deepEqual(crdt.data(), { key: 20, data: 3, json: 3 });
});

test(`flat state diverges before update exchange`, t => {
    const initObj = { key: 0, data: 0, json: 0 };

    const crdt1 = new JsonCRDT(1, cloneDeep(initObj));
    const crdt2 = new JsonCRDT(2, cloneDeep(initObj));

    crdt1.createUpdate({ key: 'str' });
    crdt2.createUpdate({ data: 2 });

    t.deepEqual(crdt1.data(), { key: 'str', data: 0, json: 0 });
    t.deepEqual(crdt2.data(), { key: 0, data: 2, json: 0 });
});

test(`flat non-conflicting updates from multiple users get merged`, t => {
    const initObj = { key: 0, data: 0, json: 0 };

    const crdt1 = new JsonCRDT(1, cloneDeep(initObj));
    const update1 = crdt1.createUpdate({ key: 'str' });

    const crdt2 = new JsonCRDT(2, cloneDeep(initObj));
    const update2 = crdt2.createUpdate({ data: 2 });

    const crdt3 = new JsonCRDT(3, cloneDeep(initObj));
    const update3 = crdt3.createUpdate({ json: 3 });

    crdt1.applyUpdate(update2);
    crdt1.applyUpdate(update3);

    crdt2.applyUpdate(update1);
    crdt2.applyUpdate(update3);

    crdt3.applyUpdate(update1);
    crdt3.applyUpdate(update2);

    t.deepEqual(crdt1.data(), { key: 'str', data: 2, json: 3 });
    t.deepEqual(crdt1.data(), crdt2.data());
    t.deepEqual(crdt2.data(), crdt3.data());
});

test('outdated edits and deletions are ignored', t => {
    const crdt = new JsonCRDT(1, { key: 'str' });

    // outdated edit
    crdt.createUpdate({ key: null });
    crdt.applyUpdate({ diff: { key: 'value' }, timestamp: '1-1' });

    t.deepEqual(crdt.data(), {});

    // outdated deletion
    crdt.createUpdate({ key: 'str' });
    crdt.applyUpdate({ diff: { key: null }, timestamp: '1-1' });

    t.deepEqual(crdt.data(), { key: 'str' });
});

test(`flat conflicting updates from multiple users get merged`, t => {
    const initObj = { key: 0, data: 0, json: 0 };

    const crdt1 = new JsonCRDT(1, cloneDeep(initObj));
    const crdt2 = new JsonCRDT(2, cloneDeep(initObj));
    const crdt3 = new JsonCRDT(3, cloneDeep(initObj));

    const update3 = crdt3.createUpdate({ key: 3 });
    crdt1.applyUpdate(update3);
    crdt2.applyUpdate(update3);

    const update2 = crdt2.createUpdate({ key: 2 });
    crdt1.applyUpdate(update2);
    crdt3.applyUpdate(update2);

    const update1 = crdt1.createUpdate({ key: 'str' });
    crdt2.applyUpdate(update1);
    crdt3.applyUpdate(update1);

    // user 'str'wins because he made the latest update
    t.deepEqual(crdt1.data(), { key: 'str', data: 0, json: 0 });
    t.deepEqual(crdt1.data(), crdt2.data());
    t.deepEqual(crdt2.data(), crdt3.data());
});

test(`flat conflicting updates with equal timestamp from multiple users get merged`, t => {
    // unnested object

    const initObj = { key: 0, data: 0, json: 0 };

    const crdt1 = new JsonCRDT(1, cloneDeep(initObj));
    const update1 = crdt1.createUpdate({ key: 'str' });

    const crdt2 = new JsonCRDT(2, cloneDeep(initObj));
    const update2 = crdt2.createUpdate({ key: 2 });

    const crdt3 = new JsonCRDT(3, cloneDeep(initObj));
    const update3 = crdt3.createUpdate({ key: 3 });

    crdt1.applyUpdate(update2);
    crdt1.applyUpdate(update3);

    crdt2.applyUpdate(update1);
    crdt2.applyUpdate(update3);

    crdt3.applyUpdate(update1);
    crdt3.applyUpdate(update2);

    // user 3 wins because of highest id
    t.deepEqual(crdt1.data(), { key: 3, data: 0, json: 0 });
    t.deepEqual(crdt1.data(), crdt2.data());
    t.deepEqual(crdt2.data(), crdt3.data());
});

test(`flat users miss intermediate update for conflicting updates`, t => {
    const initObj = { key: 0, data: 0, json: 0 };

    const crdt1 = new JsonCRDT(1, cloneDeep(initObj));
    const crdt2 = new JsonCRDT(2, cloneDeep(initObj));
    const crdt3 = new JsonCRDT(3, cloneDeep(initObj));

    const update1 = crdt3.createUpdate({ key: 3 });
    crdt2.applyUpdate(update1);
    // crdt3 doesn't receive update1

    const update2 = crdt2.createUpdate({ key: 999 });
    crdt1.applyUpdate(update2);
    crdt3.applyUpdate(update2);

    // user 'str'wins because he made the latest update
    t.deepEqual(crdt1.data(), { key: 999, data: 0, json: 0 });
    t.deepEqual(crdt1.data(), crdt2.data());
    t.deepEqual(crdt2.data(), crdt3.data());
});

test(`nested update`, t => {
    const crdt = new JsonCRDT(2, {
        key: { data: { json: { 'another key': { e: { f: 'str' } } } } }
    });
    crdt.createUpdate({ key: { data: { json: { 'another key': { e: { f: 2 } } } } } });
    t.deepEqual(crdt.data(), { key: { data: { json: { 'another key': { e: { f: 2 } } } } } });
});

test(`nested updates get denied for outdated timestamps`, t => {
    const crdt = new JsonCRDT(2, {
        key: { data: { json: { 'another key': { e: { f: 'str', g: 0 } } } } }
    });
    crdt.applyUpdate({
        diff: { key: { data: { json: { 'another key': { e: { f: 2 } } } } } },
        timestamp: '1-1000'
    });

    crdt.applyUpdate({
        diff: { key: { data: { json: { 'another key': { e: { f: 1000 } } } } } },
        timestamp: '1-5'
    });
    crdt.applyUpdate({
        diff: { key: { data: { json: { 'another key': { e: { f: 123123, g: true } } } } } },
        timestamp: '1-100'
    });
    t.deepEqual(crdt.data(), {
        key: { data: { json: { 'another key': { e: { f: 2, g: true } } } } }
    });
    crdt.applyUpdate({
        diff: { key: { data: { json: { 'another key': { e: { f: 20 } } } } } },
        timestamp: '1-2000'
    });
    crdt.applyUpdate({
        diff: { key: { data: { json: { 'another key': { e: { f: -1 } } } } } },
        timestamp: '1-1500'
    });
    t.deepEqual(crdt.data(), {
        key: { data: { json: { 'another key': { e: { f: 20, g: true } } } } }
    });
});

test(`nested non-conflicting updates from multiple users get merged`, t => {
    const initObj = { x: { y: { z: { key: 0, data: 0, json: 0 } } } };

    const crdt1 = new JsonCRDT(1, cloneDeep(initObj));
    const update1 = crdt1.createUpdate({ x: { y: { z: { key: 'str' } } } });

    const crdt2 = new JsonCRDT(2, cloneDeep(initObj));
    const update2 = crdt2.createUpdate({ x: { y: { z: { data: 2 } } } });

    const crdt3 = new JsonCRDT(3, cloneDeep(initObj));
    const update3 = crdt3.createUpdate({ x: { y: { z: { json: 3 } } } });

    crdt1.applyUpdate(update2);
    crdt1.applyUpdate(update3);

    crdt2.applyUpdate(update1);
    crdt2.applyUpdate(update3);

    crdt3.applyUpdate(update1);
    crdt3.applyUpdate(update2);

    t.deepEqual(crdt1.data(), { x: { y: { z: { key: 'str', data: 2, json: 3 } } } });
    t.deepEqual(crdt1.data(), crdt2.data());
    t.deepEqual(crdt2.data(), crdt3.data());
});

test(`nested conflicting updates from multiple users get merged`, t => {
    const initObj = { x: { y: { z: { key: 0, data: 0, json: 0 } } } };

    const crdt1 = new JsonCRDT(1, cloneDeep(initObj));

    const crdt2 = new JsonCRDT(2, cloneDeep(initObj));

    const crdt3 = new JsonCRDT(3, cloneDeep(initObj));

    const update3 = crdt3.createUpdate({ x: { y: { z: { key: 3 } } } });
    crdt1.applyUpdate(update3);
    crdt2.applyUpdate(update3);

    const update2 = crdt2.createUpdate({ x: { y: { z: { key: 2 } } } });
    crdt1.applyUpdate(update2);
    crdt3.applyUpdate(update2);

    const update1 = crdt1.createUpdate({ x: { y: { z: { key: 'str' } } } });
    crdt2.applyUpdate(update1);
    crdt3.applyUpdate(update1);

    // user 'str'wins because he made the latest update
    t.deepEqual(crdt1.data(), { x: { y: { z: { key: 'str', data: 0, json: 0 } } } });
    t.deepEqual(crdt1.data(), crdt2.data());
    t.deepEqual(crdt2.data(), crdt3.data());
});

test(`nested conflicting updates with equal timestamp from multiple users get merged`, t => {
    const initObj = { x: { y: { z: { key: 0, data: 0, json: 0 } } } };

    const crdt3 = new JsonCRDT(3, cloneDeep(initObj));
    const update3 = crdt3.createUpdate({ x: { y: { z: { json: 3 } } } });

    const crdt1 = new JsonCRDT(1, cloneDeep(initObj));
    const update1 = crdt1.createUpdate({ x: { y: { z: { key: 'str' } } } });

    const crdt2 = new JsonCRDT(2, cloneDeep(initObj));
    const update2 = crdt2.createUpdate({ x: { y: { z: { data: 2 } } } });

    crdt1.applyUpdate(update2);
    crdt1.applyUpdate(update3);

    crdt2.applyUpdate(update1);
    crdt2.applyUpdate(update3);

    crdt3.applyUpdate(update1);
    crdt3.applyUpdate(update2);

    // user 3 wins because of highest id
    t.deepEqual(crdt1.data(), { x: { y: { z: { key: 'str', data: 2, json: 3 } } } });
    t.deepEqual(crdt1.data(), crdt2.data());
    t.deepEqual(crdt2.data(), crdt3.data());
});

test(`nested user misses intermediate update for conflicting updates`, t => {
    const initObj = { x: { y: { z: { key: 0, data: 0, json: 0 } } } };

    const crdt1 = new JsonCRDT(1, cloneDeep(initObj));
    const crdt2 = new JsonCRDT(2, cloneDeep(initObj));
    const crdt3 = new JsonCRDT(3, cloneDeep(initObj));

    const update1 = crdt3.createUpdate({ x: { y: { z: { key: 3 } } } });
    crdt2.applyUpdate(update1);
    // crdt3 doesn't receive update1_1

    const update2 = crdt2.createUpdate({ x: { y: { z: { key: 999 } } } });
    crdt1.applyUpdate(update2);
    crdt3.applyUpdate(update2);

    // user 'str'wins because he made the latest update
    t.deepEqual(crdt1.data(), { x: { y: { z: { key: 999, data: 0, json: 0 } } } });
    t.deepEqual(crdt1.data(), crdt2.data());
    t.deepEqual(crdt2.data(), crdt3.data());
});

test(`update with array fields`, t => {
    // solo update
    const crdt = new JsonCRDT(1, { key: [1, 2, 3] });
    crdt.createUpdate({ key: [7, 8, 9] });
    t.deepEqual(crdt.data(), { key: [7, 8, 9] });

    // multi client updates (no conflicts)
    const crdt1 = new JsonCRDT(1, { key: [1, 2, 3], data: [10, 100, 100] });
    const crdt2 = new JsonCRDT(2, { key: [1, 2, 3], data: [10, 100, 100] });

    const update1 = crdt1.createUpdate({ key: [7, 8, 9] });
    const update2 = crdt2.createUpdate({ data: [10, 100, 100, 1000] });

    crdt1.applyUpdate(update2);
    crdt2.applyUpdate(update1);

    t.deepEqual(crdt1.data(), { key: [7, 8, 9], data: [10, 100, 100, 1000] });
    t.deepEqual(crdt1.data(), crdt2.data());

    // multi client updates (conflicts)

    const crdt3 = new JsonCRDT(3, { key: [1, 2, 3], data: [10, 100, 100] });
    const crdt4 = new JsonCRDT(4, { key: [1, 2, 3], data: [10, 100, 100] });

    const update3 = crdt3.createUpdate({ key: [7, 8, 9] });
    const update4 = crdt4.createUpdate({ key: [7, 8, 9, 10] });

    crdt3.applyUpdate(update4);
    crdt4.applyUpdate(update3);

    // user 4 wins because of higher user id
    t.deepEqual(crdt3.data(), { key: [7, 8, 9, 10], data: [10, 100, 100] });
    t.deepEqual(crdt3.data(), crdt4.data());
});

test(`add new fields single client`, t => {
    const crdt = new JsonCRDT(1, { key: 'str' });

    // add a new field
    crdt.createUpdate({ key: 'value', data: 3 });
    t.deepEqual(crdt.data(), { key: 'value', data: 3 });

    // add a new nested field
    crdt.createUpdate({ json: { 'another key': { e: 9 } } });
    t.deepEqual(crdt.data(), { key: 'value', data: 3, json: { 'another key': { e: 9 } } });

    // add a whole new nested object
    crdt.createUpdate({ x: { y: 3, z: 4, i: { j: 'hello', k: 'untouched', abc: { f: 234 } } } });
    t.deepEqual(crdt.data(), {
        key: 'value',
        data: 3,
        json: { 'another key': { e: 9 } },
        x: { y: 3, z: 4, i: { j: 'hello', k: 'untouched', abc: { f: 234 } } }
    });

    // update new fields
    crdt.createUpdate({ data: 8, x: { y: 5, i: { j: 6, abc: { f: 8 } } } });
    t.deepEqual(crdt.data(), {
        key: 'value',
        data: 8,
        json: { 'another key': { e: 9 } },
        x: { y: 5, z: 4, i: { j: 6, k: 'untouched', abc: { f: 8 } } }
    });
});

test(`add new fields multi client`, t => {
    const crdt1 = new JsonCRDT(1, { key: 'str' });
    const crdt2 = new JsonCRDT(2, { key: 'str' });

    // add a new field
    const update1 = crdt1.createUpdate({ data: 2 });
    crdt2.applyUpdate(update1);
    t.deepEqual(crdt1.data(), { key: 'str', data: 2 });
    t.deepEqual(crdt1.data(), crdt2.data());

    // add a conflicting new field
    const update2 = crdt2.createUpdate({ json: 3 });
    const update1B = crdt1.createUpdate({ json: -9 });
    crdt1.applyUpdate(update2);
    crdt2.applyUpdate(update1B);

    // user 2 wins because of higher user id
    t.deepEqual(crdt1.data(), { key: 'str', data: 2, json: 3 });
    t.deepEqual(crdt1.data(), crdt2.data());
});
