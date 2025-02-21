import { SinonSandbox } from 'sinon';
import { BaseJsonCRDT } from './BaseJsonCRDT';
import anyTest, { TestFn } from 'ava';
import { cloneDeep } from 'lodash';
import { forEachOther, replaySnapshot } from '../../test/helpers/crdt';
import { TIMESTAMP_KEY } from './constants';

const test = anyTest as TestFn<{ sandbox: SinonSandbox }>;

test(`basic updates work`, t => {
    // flat object
    const crdt1 = new BaseJsonCRDT({ data: { a: 'some value', b: 2, c: 3 } });
    crdt1.update({ a: 2, b: 3 }, '1-1');
    t.deepEqual(crdt1.data(), { a: 2, b: 3, c: 3 });

    // deeply nested object
    const crdt2 = new BaseJsonCRDT({ data: { a: { b: { c: { d: { e: { f: 1 } } } } } } });
    crdt2.update({ a: { b: { c: { d: { e: { f: 2 } } } } } }, '1-1');
    t.deepEqual(crdt2.data(), { a: { b: { c: { d: { e: { f: 2 } } } } } });
});

test(`updates get denied for outdated timestamps`, t => {
    // flat object
    const crdt1 = new BaseJsonCRDT({ data: { a: 'some value', b: 2, c: 3 } });
    crdt1.update({ a: 2, b: 3 }, '1-1');
    crdt1.update({ b: 1000 }, '1-0');
    crdt1.update({ b: 1231232 }, '1-0');
    t.deepEqual(crdt1.data(), { a: 2, b: 3, c: 3 });
    crdt1.update({ a: 20 }, '1-2');
    crdt1.update({ a: -1 }, '1-1');
    t.deepEqual(crdt1.data(), { a: 20, b: 3, c: 3 });

    // deeply nested object
    const crdt2 = new BaseJsonCRDT({ data: { a: { b: { c: { d: { e: { f: 1 } } } } } } });
    crdt2.update({ a: { b: { c: { d: { e: { f: 2 } } } } } }, '1-1');
    crdt2.update({ a: { b: { c: { d: { e: { f: 1000 } } } } } }, '2-0');
    t.deepEqual(crdt2.data(), { a: { b: { c: { d: { e: { f: 2 } } } } } });
});

test(`updates with same timestamp value only get applied for higher nodeIds `, t => {
    const crdt = new BaseJsonCRDT({ data: { a: 'some value', b: 2, c: { key: 'value' } } });
    crdt.update({ a: 2 }, '1-1');
    crdt.update({ a: 'update value that does not get applied' }, '1-1');
    t.deepEqual(crdt.data(), { a: 2, b: 2, c: { key: 'value' } });

    crdt.update({ a: 'my creator had a higher node id so it works' }, '2-1');
    // latest update has been applied
    t.deepEqual(crdt.data(), {
        a: 'my creator had a higher node id so it works',
        b: 2,
        c: { key: 'value' },
    });
});

test(`non-conflicting updates get merged`, t => {
    const crdt = new BaseJsonCRDT({ data: { a: 'some value', b: 2, c: { key: 'value' } } });
    crdt.update({ a: 2 }, '1-1');
    crdt.update({ b: 3 }, '2-1');
    crdt.update({ c: { key: 'new value' } }, '3-1');
    t.deepEqual(crdt.data(), {
        a: 2,
        b: 3,
        c: { key: 'new value' },
    });
});

test(`arrays are treated as atomic values`, t => {
    // Note: Right now, arrays behave just as other atomic-objects like strings or numbers, i.e., each update overwrites the array.
    // TODO: Theses tests should be updated to reflect the merging behavior of arrays once this functionality gets implemented.

    // basic update
    const crdt = new BaseJsonCRDT({ data: { a: [1, 2, 3], b: [4, 5, 6] } });
    crdt.update({ a: [1, 2, 3, 4] }, '1-1');
    crdt.update({ b: [4, 5, 6, 7] }, '2-1');
    t.deepEqual(crdt.data(), {
        a: [1, 2, 3, 4],
        b: [4, 5, 6, 7],
    });

    // overwriting update
    const crdt2 = new BaseJsonCRDT({ data: { a: [1, 2, 3], b: [4, 5, 6] } });
    crdt2.update({ a: [1, 2, 3, 4] }, '1-1');
    crdt2.update({ b: [4, 5, 6, 7] }, '2-1');
    crdt2.update({ a: [1, 2, 3, 4, 5, 6, 7] }, '3-1');
    t.deepEqual(crdt2.data(), {
        a: [1, 2, 3, 4, 5, 6, 7],
        b: [4, 5, 6, 7],
    });

    // nested arrays
    const crdt3 = new BaseJsonCRDT({ data: { a: [1, 2, 3], b: [4, 5, 6] } });
    crdt3.update({ a: [1, [2, 3], 4] }, '1-1');
    crdt3.update({ b: [4, 5, [6, 7]] }, '2-1');
    t.deepEqual(crdt3.data(), {
        a: [1, [2, 3], 4],
        b: [4, 5, [6, 7]],
    });

    // arrays with objects
    const crdt4 = new BaseJsonCRDT({ data: { a: [{ a: 1 }, { b: 2 }], b: [{ c: 3 }, { d: 4 }] } });
    crdt4.update({ a: [{ a: 1 }, { b: 2 }, { c: 3 }] }, '1-1');
    crdt4.update({ b: [{ c: 3 }, { d: 4 }, { e: 5 }] }, '2-1');
    t.deepEqual(crdt4.data(), {
        a: [{ a: 1 }, { b: 2 }, { c: 3 }],
        b: [{ c: 3 }, { d: 4 }, { e: 5 }],
    });
});

test(`updates with empty data`, t => {
    const crdt = new BaseJsonCRDT({ data: { a: 'some value', b: 2, c: { key: 'value' } } });
    crdt.update({}, '1-1');
    t.deepEqual(crdt.data(), { a: 'some value', b: 2, c: { key: 'value' } });
});

test(`adding new keys`, t => {
    const crdt = new BaseJsonCRDT({ data: { a: 'some value', b: { key: 'value' } } });

    crdt.update({ c: 'new key' }, '1-1');

    t.deepEqual(crdt.data(), {
        a: 'some value',
        b: { key: 'value' },
        c: 'new key',
    });
});

test('deleting basic non-nested key', t => {
    const crdt = new BaseJsonCRDT({ data: { a: 'some value', b: 'value' } });

    crdt.update({ a: null }, '1-1');
    t.deepEqual(crdt.data(), { b: 'value' });

    crdt.update({ b: null }, '1-2');
    t.deepEqual(crdt.data(), {});
});

test('inserting a new array', t => {
    const crdt = new BaseJsonCRDT({ data: { a: 'some value' } });

    crdt.update({ b: [] }, '1-1');
    t.deepEqual(crdt.data(), { a: 'some value', b: [] });
});

test('deleted keys can be added back in', t => {
    const crdt = new BaseJsonCRDT({ data: { a: 'some value', b: 'value' } });

    crdt.update({ a: null }, '1-1');
    t.deepEqual(crdt.data(), { b: 'value' });

    crdt.update({ a: 'new value' }, '1-2');
    t.deepEqual(crdt.data(), { a: 'new value', b: 'value' });
});

test('deleting a nested value keeps the parent object', t => {
    const crdt = new BaseJsonCRDT({
        data: {
            a: 'some value',
            b: { c: { d: { e: { f: { g: 'soon gone' } } } } },
        },
    });

    crdt.update({ b: { c: { d: { e: { f: { g: null } } } } } }, '1-1');

    t.deepEqual(crdt.data(), {
        a: 'some value',
        b: { c: { d: { e: { f: {} } } } },
    });
});

test('reinsertions with outdated timestamps get denied', t => {
    const crdt = new BaseJsonCRDT({ data: { a: 'some value', b: 'value' } });

    crdt.update({ a: null }, '1-2');
    t.deepEqual(crdt.data(), { b: 'value' });

    crdt.update({ a: 'outdated value' }, '1-1');
    t.deepEqual(crdt.data(), { b: 'value' });
});

test('deleting an item array is not possible', t => {
    // this is not a safe operation, the conversion of the deletion should be handled in the calculateDiff
    const data = {
        arr: [
            { id: '1', val: 'val1' },
            { id: '2', val: 'val2' },
        ],
    };
    const crdt = new BaseJsonCRDT({ data, pathsToItemArrays: ['arr'] });

    t.throws(() => crdt.update({ arr: null }, '1-2'));

    t.deepEqual(crdt.data(), {
        arr: [
            { id: '1', val: 'val1' },
            { id: '2', val: 'val2' },
        ],
    });
});

test('inserting empty object: new path', t => {
    const crdt = new BaseJsonCRDT({ data: { a: 'some value' } });

    crdt.update({ b: {} }, '1-1');

    t.deepEqual(crdt.data(), { a: 'some value', b: {} });
});

test('inserting empty object: nested new path', t => {
    const crdt = new BaseJsonCRDT({ data: { a: 'some value' } });

    crdt.update({ b: { c: { d: { e: {} } } } }, '1-1');

    t.deepEqual(crdt.data(), { a: 'some value', b: { c: { d: { e: {} } } } });
});

test('inserting empty object: already empty object', t => {
    const crdt = new BaseJsonCRDT({ data: { a: 'some value', b: {} } });

    crdt.update({ b: {} }, '1-1');

    t.deepEqual(crdt.data(), { a: 'some value', b: {} });
});

test('inserting value into empty object', t => {
    const crdt = new BaseJsonCRDT({ data: { a: 'some value', b: {} } });

    crdt.update({ b: {} }, '1-1');

    t.deepEqual(crdt.data(), { a: 'some value', b: {} });
});

test('object conversion', t => {
    const t1 = '1-1';
    const t2 = '2-2';

    const opA = { newObj: { a: 1 } };
    const opB = { newObj: {} };

    const crdtX = new BaseJsonCRDT({ data: {} });
    crdtX.update(opA, t1);
    crdtX.update(opB, t2);

    const crdtY = new BaseJsonCRDT({ data: {} });
    crdtY.update(opB, t2);
    crdtY.update(opA, t1);

    t.deepEqual(crdtX.data(), crdtY.data());
});

test('override with empty object deletes object content', t => {
    const crdt = new BaseJsonCRDT({ data: {} });

    crdt.update({ obj: { value: 'something' } }, '1-1');
    crdt.update({ obj: {} }, '1-2');

    t.deepEqual(crdt.data(), { obj: {} });
});

test('override with empty object partially deletes object content', t => {
    const crdt = new BaseJsonCRDT({ data: {} });

    crdt.update({ obj: { value: 'something' } }, '1-1');
    crdt.update({ obj: { keepThisValue: 'kept' } }, '1-3');
    crdt.update({ obj: {} }, '1-2');

    t.deepEqual(crdt.data(), { obj: { keepThisValue: 'kept' } });
});

test('override with empty object deletes nested object content', t => {
    const crdt = new BaseJsonCRDT({ data: {} });

    crdt.update({ obj: { deeply: { nested: { object: { value: 1 } } } } }, '1-1');
    crdt.update({ obj: {} }, '1-2');

    t.deepEqual(crdt.data(), { obj: {} });
});

test('override with empty object partially deletes nested object content', t => {
    const crdt = new BaseJsonCRDT({ data: {} });

    crdt.update({ obj: { deeply: { nested: { object: { value: 1 } } } } }, '1-1');
    crdt.update({ obj: { deeply: { nested: { object: { keepThisValue: 'kept' } } } } }, '1-3');
    crdt.update({ obj: {} }, '1-2');

    t.deepEqual(crdt.data(), {
        obj: { deeply: { nested: { object: { keepThisValue: 'kept' } } } },
    });
});

test('override with empty object partially deletes nested object content for empty object', t => {
    const crdt = new BaseJsonCRDT({ data: {} });

    crdt.update({ obj: { deeply: { nested: { object: { keepThisValue: {} } } } } }, '1-3');
    crdt.update({ obj: {} }, '1-2');

    t.deepEqual(crdt.data(), {
        obj: { deeply: { nested: { object: { keepThisValue: {} } } } },
    });
});

test('override with empty object partially deletes nested object content for empty object if it was a date before', t => {
    const crdt = new BaseJsonCRDT({ data: {} });

    crdt.update({ obj: new Date() }, '1-1');
    crdt.update({ obj: { deeply: { nested: { object: { keepThisValue: {} } } } } }, '1-3');
    crdt.update({ obj: {} }, '1-2');

    t.deepEqual(crdt.data(), {
        obj: { deeply: { nested: { object: { keepThisValue: {} } } } },
    });
});

test('test', t => {
    const crdt = new BaseJsonCRDT({
        data: {
            m0: {
                f1: 1,
                h1: {
                    j2: 1,
                    l2: {
                        n3: 1,
                    },
                },
            },
        },
    });

    crdt.update(
        {
            m0: { a1: 2, f1: { k2: 2 } },
        },
        '1-2'
    );

    t.deepEqual(crdt.data(), {
        m0: {
            a1: 2,
            f1: { k2: 2 },
            h1: {
                j2: 1,
                l2: {
                    n3: 1,
                },
            },
        },
    });
});

test('inserting empty object over atomic value', t => {
    const crdt = new BaseJsonCRDT({ data: { a: 'some value', b: 8 } });

    crdt.update({ b: {} }, '1-1');

    t.deepEqual(crdt.data(), { a: 'some value', b: {} });
});

test('a Date inserted at initialization or with update is a Date in the data', t => {
    const crdt = new BaseJsonCRDT<any>({ data: { a: new Date('2024-02-14T09:10:23.956Z') } });

    crdt.update({ b: new Date('2024-02-13T09:10:23.956Z') }, '1-1');
    t.deepEqual(crdt.data(), {
        a: new Date('2024-02-14T09:10:23.956Z'),
        b: new Date('2024-02-13T09:10:23.956Z'),
    });
});

test('a Date can be deleted with null', t => {
    const crdt = new BaseJsonCRDT<any>({
        data: { a: new Date('2024-02-14T09:10:23.956Z'), b: 'stays' },
    });

    crdt.update({ a: null }, '1-1');
    t.deepEqual(crdt.data(), { b: 'stays' });
});

test('null can be replaced with a Date', t => {
    const crdt = new BaseJsonCRDT<any>({ data: { a: null } });

    crdt.update({ a: new Date('2024-02-14T09:10:23.956Z') }, '1-1');
    t.deepEqual(crdt.data(), { a: new Date('2024-02-14T09:10:23.956Z') });
});

test('a Date can be explicitly set to undefined', t => {
    const crdt = new BaseJsonCRDT<any>({
        data: { a: new Date('2024-02-14T09:10:23.956Z'), b: 'stays' },
    });

    crdt.update({ a: undefined }, '1-1');
    t.deepEqual(crdt.data(), { b: 'stays' });
});

// object <-> atomic value conversion

test(`deny converting atomic value to object if atomic value timestamp higher`, t => {
    const crdt = new BaseJsonCRDT({ data: { a: 'some value' } });

    crdt.update({ a: 'another value' }, '2-2');

    crdt.update({ a: { b: { c: 'nested' } } }, '1-1');

    t.deepEqual(crdt.data(), {
        a: 'another value',
    });
});

test(`convert atomic value (string) to object`, t => {
    const crdt = new BaseJsonCRDT({ data: { a: 'some value' } });

    crdt.update({ a: { b: { c: 'nested' } } }, '1-1');

    t.deepEqual(crdt.data(), {
        a: { b: { c: 'nested' } },
    });
});

test(`outdated conversion of atomic value (string) to object is rejected`, t => {
    const crdt = new BaseJsonCRDT({ data: { a: 'some value' } });

    crdt.update({ a: { b: { c: 'nested' } } }, '0-0');

    t.deepEqual(crdt.data(), {
        a: 'some value',
    });
});

test(`convert atomic value (int) to object`, t => {
    const crdt = new BaseJsonCRDT({ data: { a: 9 } });

    crdt.update({ a: { b: { c: 'nested' } } }, '1-1');

    t.deepEqual(crdt.data(), {
        a: { b: { c: 'nested' } },
    });
});

test(`convert atomic value (array) to object`, t => {
    const crdt = new BaseJsonCRDT({ data: { a: [] } });

    crdt.update({ a: { b: { c: 'nested' } } }, '1-1');

    t.deepEqual(crdt.data(), {
        a: { b: { c: 'nested' } },
    });
});

test(`convert atomic value (string) to empty object`, t => {
    const crdt = new BaseJsonCRDT({ data: { a: 'some value' } });

    crdt.update({ a: {} }, '1-1');

    t.deepEqual(crdt.data(), {
        a: {},
    });
});

test(`outdated conversion of atomic value (string) to empty object is rejected`, t => {
    const crdt = new BaseJsonCRDT({ data: { a: 'some value' } });

    crdt.update({ a: {} }, '0-0');

    t.deepEqual(crdt.data(), {
        a: 'some value',
    });
});

test(`convert atomic value (array) to empty object`, t => {
    const crdt = new BaseJsonCRDT({ data: { a: [] } });

    crdt.update({ a: {} }, '1-1');

    t.deepEqual(crdt.data(), {
        a: {},
    });
});

test(`outdated conversion of atomic value (array) to empty object is rejected`, t => {
    const crdt = new BaseJsonCRDT({ data: { a: [] } });

    crdt.update({ a: {} }, '0-0');

    t.deepEqual(crdt.data(), {
        a: [],
    });
});

test(`convert empty object to atomic value`, t => {
    const crdt = new BaseJsonCRDT({ data: { a: {} } });

    crdt.update({ a: 'string' }, '1-1');

    t.deepEqual(crdt.data(), {
        a: 'string',
    });
});

test(`outdated conversion of empty object to atomic value is rejected`, t => {
    const crdt = new BaseJsonCRDT({ data: { a: {} } });

    crdt.update({ a: 'string' }, '0-0');

    t.deepEqual(crdt.data(), { a: {} });
});

test(`convert nested object to atomic value`, t => {
    const crdt = new BaseJsonCRDT({ data: { a: { b: { c: 1 } } } });

    crdt.update({ a: 'string' }, '1-1');

    t.deepEqual(crdt.data(), {
        a: 'string',
    });
});

test(`outdated conversion of atomic value to object is rejected`, t => {
    const crdt = new BaseJsonCRDT({
        data: { a: 'string' },
        timestamps: { a: { [TIMESTAMP_KEY]: '1-2' } },
        pathsToItemArrays: [],
    });

    crdt.update({ a: { b: 1 } }, '1-1');

    t.deepEqual(crdt.data(), { a: 'string' });
});

test(`outdated conversion of nested object to atomic value is rejected`, t => {
    const crdt = new BaseJsonCRDT({
        data: { a: { b: { c: 1 } } },
        timestamps: { a: { b: { c: { [TIMESTAMP_KEY]: '1-2' } } } },
        pathsToItemArrays: [],
    });

    crdt.update({ a: 'string' }, '1-1');

    t.deepEqual(crdt.data(), { a: { b: { c: 1 } } });
});

test(`delete nested object`, t => {
    const crdt = new BaseJsonCRDT({ data: { a: { b: { c: 1 } } } });

    crdt.update({ a: null }, '1-1');

    t.deepEqual(crdt.data(), {});
});

test(`delete nested empty object`, t => {
    const crdt = new BaseJsonCRDT({
        data: {
            a: {},
            b: {
                x: {},
                y: {
                    n: {
                        m: 2,
                    },
                },
            },
        },
    });

    crdt.update({ b: { y: { n: { m: 5 } } } }, '1-2');
    crdt.update({ b: null }, '1-1');

    t.deepEqual(crdt.data(), { a: {}, b: { y: { n: { m: 5 } } } });
});

test(`oudated delete nested object is rejected`, t => {
    const crdt = new BaseJsonCRDT({ data: { a: { b: { c: 1 } } } });

    crdt.update({ a: null }, '0-0');

    t.deepEqual(crdt.data(), { a: { b: { c: 1 } } });
});

test(`delete empty object`, t => {
    const crdt = new BaseJsonCRDT({ data: { a: {} } });

    crdt.update({ a: null }, '1-1');

    t.deepEqual(crdt.data(), {});
});

test(`outdated delete empty object is rejected without initialized timestamp`, t => {
    const crdt = new BaseJsonCRDT({ data: { a: {} } });

    crdt.update({ a: null }, '0-0');

    t.deepEqual(crdt.data(), { a: {} });
});

test(`outdated delete empty object is rejected`, t => {
    const crdt = new BaseJsonCRDT({
        data: { a: {} },
        timestamps: { a: { [TIMESTAMP_KEY]: '1-1' } },
        pathsToItemArrays: [],
    });

    crdt.update({ a: null }, '1-1');

    t.deepEqual(crdt.data(), { a: {} });
});

test(`inserting new nested value in previous but now deleted atomic value is rejected when outdated`, t => {
    // Start with atomic value.
    const crdt = new BaseJsonCRDT({
        data: { a: 1 },
        timestamps: { a: { [TIMESTAMP_KEY]: '1-1' } },
        pathsToItemArrays: [],
    });

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
    const crdt = new BaseJsonCRDT({
        data: { a: { b: { id: 1 } } },
        timestamps: { a: { b: { id: { [TIMESTAMP_KEY]: '1-1' } } } },
        pathsToItemArrays: [],
    });

    crdt.update({ a: { c: { id: 3 } } }, '2-1');
    t.deepEqual(crdt.data(), { a: { b: { id: 1 }, c: { id: 3 } } });
});

test(`insert new value should resolve same level via node ID`, t => {
    const crdt = new BaseJsonCRDT({
        data: { a: 1 },
        timestamps: { a: { [TIMESTAMP_KEY]: '1-1' } },
        pathsToItemArrays: [],
    });

    crdt.update({ a: 2 }, '2-1');
    t.deepEqual(crdt.data(), { a: 2 });

    crdt.update({ a: { b: 3 } }, '3-1');
    t.deepEqual(crdt.data(), { a: { b: 3 } });

    crdt.update({ a: { b: 3 } }, '3-2');
    t.deepEqual(crdt.data(), { a: { b: 3 } });
});

test(`nested insertion does respect timestamp of ancestor change`, t => {
    const crdt = new BaseJsonCRDT({
        data: { a: 1 },
        timestamps: { a: { [TIMESTAMP_KEY]: '1-1' } },
        pathsToItemArrays: [],
    });

    crdt.update({ a: null }, '1-2');
    t.deepEqual(crdt.data(), {});

    crdt.update({ a: { b: 2 } }, '1-3');
    t.deepEqual(crdt.data(), { a: { b: 2 } });

    crdt.update({ a: { c: 3 } }, '1-1');
    t.deepEqual(crdt.data(), { a: { b: 2 } });
});

test(`deleting nested object results in partial deletes`, t => {
    const crdt1 = new BaseJsonCRDT({ data: {} });

    crdt1.update({ a0: { a1: 'd' } }, '1-5');
    t.deepEqual(crdt1.data(), {
        a0: { a1: 'd' },
    });

    crdt1.update({ a0: { d1: 'b' } }, '2-1');
    t.deepEqual(crdt1.data(), {
        a0: { a1: 'd', d1: 'b' },
    });

    crdt1.update({ a0: null }, '2-2');
    t.deepEqual(crdt1.data(), { a0: { a1: 'd' } });

    // --------------------------------------------

    const crdt2 = new BaseJsonCRDT({ data: {} });

    crdt2.update({ a0: { d1: 'b' } }, '2-1');
    t.deepEqual(crdt2.data(), {
        a0: { d1: 'b' },
    });

    crdt2.update({ a0: null }, '2-2');
    t.deepEqual(crdt2.data(), {});

    crdt2.update({ a0: { a1: 'd' } }, '1-5');
    t.deepEqual(crdt2.data(), { a0: { a1: 'd' } });
});

test(`overwriting nested object with atomic value results in partial deletes`, t => {
    const crdt1 = new BaseJsonCRDT({ data: {} });

    crdt1.update({ a0: { a1: 'd' } }, '1-5');
    t.deepEqual(crdt1.data(), {
        a0: { a1: 'd' },
    });

    crdt1.update({ a0: { d1: 'b' } }, '2-1');
    t.deepEqual(crdt1.data(), {
        a0: { a1: 'd', d1: 'b' },
    });

    crdt1.update({ a0: 'string' }, '2-2');
    t.deepEqual(crdt1.data(), { a0: { a1: 'd' } });

    // --------------------------------------------

    const crdt2 = new BaseJsonCRDT({ data: {} });

    crdt2.update({ a0: { d1: 'b' } }, '2-1');
    t.deepEqual(crdt2.data(), {
        a0: { d1: 'b' },
    });

    crdt2.update({ a0: 'string' }, '2-2');
    t.deepEqual(crdt2.data(), { a0: 'string' });

    crdt2.update({ a0: { a1: 'd' } }, '1-5');
    t.deepEqual(crdt2.data(), { a0: { a1: 'd' } });
});

test(`Nested inserts only take ancestor timestamp into account`, t => {
    const crdt1 = new BaseJsonCRDT({ data: {} });

    crdt1.update({ c0: 'f' }, '1-1');
    t.deepEqual(crdt1.data(), {
        c0: 'f',
    });

    crdt1.update({ c0: null }, '1-2');
    t.deepEqual(crdt1.data(), {});

    crdt1.update({ c0: { c1: 'f' } }, '2-2');
    t.deepEqual(crdt1.data(), { c0: { c1: 'f' } });

    // --------------------------------------------

    const crdt2 = new BaseJsonCRDT({ data: {} });

    crdt2.update({ c0: { c1: 'f' } }, '2-5');
    t.deepEqual(crdt2.data(), {
        c0: { c1: 'f' },
    });

    crdt2.update({ c0: null }, '1-5');
    t.deepEqual(crdt2.data(), { c0: { c1: 'f' } });
});

// TODO: verify we really don't need this
test('deleting non-existing nested values create nested objects', t => {
    const crdt1 = new BaseJsonCRDT({ data: {} });

    crdt1.update({ a: { b: { c: 1, d: { e: 2 } } } }, '1-1');
    t.deepEqual(crdt1.data(), { a: { b: { c: 1, d: { e: 2 } } } });

    crdt1.update({ a: null }, '1-2');
    t.deepEqual(crdt1.data(), {});

    crdt1.update({ a: { b: { c: null } } }, '1-3');
    t.deepEqual(crdt1.data(), { a: { b: {} } });
});

test('nested empty objects get deleted on partial deletes', t => {
    const crdt1 = new BaseJsonCRDT({
        data: {
            a: {
                b: {
                    c: 1,
                },
                d: 3,
            },
        },
        timestamps: {
            a: {
                b: {
                    c: { [TIMESTAMP_KEY]: '1-1' },
                },
                d: { [TIMESTAMP_KEY]: '1-4' },
            },
        },
        pathsToItemArrays: [],
    });

    crdt1.update(
        {
            a: {
                b: {
                    c: null,
                },
            },
        },
        '1-2'
    );
    t.deepEqual(crdt1.data(), {
        a: {
            b: {},
            d: 3,
        },
    });

    crdt1.update(
        {
            a: null,
        },
        '1-3'
    );
    t.deepEqual(crdt1.data(), {
        a: {
            d: 3,
        },
    });
});

test('keeps empty object after delete regardless of order', t => {
    const crdt1 = new BaseJsonCRDT({
        data: {
            a: { b: { c: 1 } },
        },
    });
    const crdt2 = new BaseJsonCRDT({
        data: {
            a: { b: { c: 1 } },
        },
    });

    crdt1.update({ a: null }, '1-1');
    crdt1.update({ a: { b: null } }, '1-2');

    crdt2.update({ a: { b: null } }, '1-2');
    crdt2.update({ a: null }, '1-1');

    t.deepEqual(crdt1.data(), {
        a: {},
    });
    t.deepEqual(crdt1.data(), crdt2.data());
});

test('deletes work regardless of order 2', t => {
    const crdt1 = new BaseJsonCRDT({
        data: {
            a: { b: { c: 1 } },
        },
    });

    crdt1.update({ a: null }, '1-1');
    crdt1.update({ a: { b: null } }, '1-2');
    crdt1.update({ a: { b: { c: null } } }, '1-3');

    t.deepEqual(crdt1.data(), {
        a: {
            b: {},
        },
    });
});

test('properly deletes empty ancestor even if a descendant has been deleted with higher timestamp', t => {
    const crdt = new BaseJsonCRDT({ data: {} });

    crdt.update(
        {
            a: { b: { c: { d: 3 } } },
        },
        '1-7'
    );
    crdt.update(
        {
            a: { b: { c: { d: null } } },
        },
        '1-8'
    );

    crdt.update({ a: null }, '1-1');

    t.deepEqual(crdt.data(), { a: { b: { c: {} } } });
});

test('does not delete ancestor if a descendant with a value with higher timestamp exists', t => {
    const crdt = new BaseJsonCRDT({
        data: {
            a: { b: { c: { d: 1 } } },
        },
        timestamps: {
            a: { b: { c: { d: { [TIMESTAMP_KEY]: '9-9' } } } },
        },
        pathsToItemArrays: [],
    });

    crdt.update({ a: null }, '1-1');
    t.deepEqual(crdt.data(), { a: { b: { c: { d: 1 } } } });
});

test('keeps empty parent after nested delete', t => {
    const crdt = new BaseJsonCRDT({
        data: {
            a: {
                d: {
                    g: {},
                },
            },
        },
    });
    crdt.update(
        {
            a: {
                b: 1,
                d: {
                    g: {
                        j: 1,
                    },
                },
            },
        },
        '1-1'
    );

    crdt.update(
        {
            a: {
                c: 2,
                d: {
                    g: null,
                },
            },
        },
        '1-2'
    );

    t.deepEqual(crdt.data(), {
        a: {
            b: 1,
            d: {},
            c: 2,
        },
    });
});

test('deleting a nested object with a nested value with higher timestamp than the delete deletes everything in that object except for the value with higher timestamp', t => {
    const crdt1 = new BaseJsonCRDT({
        data: {
            a: { b: { c: 1 } },
        },
    });

    crdt1.update({ a: { y: { z: 2 } } }, '1-1');
    crdt1.update({ a: { x: 4 } }, '9-9');
    crdt1.update({ a: null }, '1-2');

    t.deepEqual(crdt1.data(), { a: { x: 4 } });
});

test('inserting nested numeric keys does not create arrays but regular objects', t => {
    const crdt = new BaseJsonCRDT({
        data: { a: { b: 1 } },
        timestamps: {
            a: { b: { [TIMESTAMP_KEY]: '1-4' } },
        },
        pathsToItemArrays: [],
    });

    crdt.update({ a: { 0: 2 } }, '1-1');
    t.deepEqual(crdt.data(), {
        a: { b: 1, 0: 2 },
    });

    crdt.update({ a: { c: { 0: 'foo' } } }, '1-2');
    t.deepEqual(crdt.data(), {
        a: { b: 1, 0: 2, c: { 0: 'foo' } },
    });
});

test('setting nested keys containing dots does not result in more nested objects', t => {
    const crdt = new BaseJsonCRDT({
        data: { a: {} },
        timestamps: {
            a: { [TIMESTAMP_KEY]: '0-0' },
        },
        pathsToItemArrays: [],
    });

    crdt.update({ a: { 'this.has.dots': 3 } }, '1-1');
    t.deepEqual(crdt.data(), {
        a: { 'this.has.dots': 3 },
    });

    crdt.update({ x: { a: { 'this.has.dots': { b: { c: 'test.123' } } } } }, '1-1');
    t.deepEqual(crdt.data(), {
        a: { 'this.has.dots': 3 },
        x: { a: { 'this.has.dots': { b: { c: 'test.123' } } } },
    });
});

test('overwriting an existing object updates its timestamp when the updating timestamp is higher than that of the object, even if the update is rejected due to newer child timestamps', t => {
    const crdts = replaySnapshot('9a022');

    forEachOther(crdts, ([, crdtA], [, crdtB]) => {
        t.deepEqual(crdtA.data(), crdtB.data());
    });
});

test('update existing nesteed object with empty object', t => {
    const crdt = new BaseJsonCRDT({ data: {} });

    crdt.update(
        {
            a: {
                b: {
                    c: 1,
                },
            },
        },
        '1-1'
    );

    crdt.update(
        {
            a: {},
        },
        '1-2'
    );

    t.deepEqual(crdt.data(), {
        a: {},
    });
});

test('cannot insert into empty object if object timestamp is higher', t => {
    const crdt = new BaseJsonCRDT({ data: {} });

    crdt.update(
        {
            a: {},
        },
        '1-2'
    );

    crdt.update(
        {
            a: {
                b: 1,
            },
        },
        '1-1'
    );

    t.deepEqual(crdt.data(), {
        a: {},
    });
});

test('deleting a non-existent nested value does not delete ancestors without timestamp', t => {
    const crdt = new BaseJsonCRDT({
        data: {
            a0: {},
        },
    });

    crdt.update(
        {
            a0: 'test',
        },
        '1-1'
    );

    crdt.update(
        {
            a0: {
                a1: 'abc',
                d1: {
                    d2: null,
                },
            },
        },
        '2-1'
    );

    t.deepEqual(crdt.data(), {
        a0: {
            a1: 'abc',
            d1: {},
        },
    });
});

test('cannot insert new nested value if some deleted ancestor has higher timestamp', t => {
    const crdt = new BaseJsonCRDT({ data: {} });

    crdt.update(
        {
            a: {
                b: 1,
            },
        },
        '1-1'
    );

    crdt.update(
        {
            a: {
                b: null,
            },
        },
        '1-3'
    );

    crdt.update(
        {
            a: {
                b: {
                    c: 1,
                },
            },
        },
        '1-2'
    );

    t.deepEqual(crdt.data(), {
        a: {},
    });
});

test('update issue #2', t => {
    const crdt1 = new BaseJsonCRDT({
        data: {
            b0: 'abc',
        },
    });

    crdt1.update(
        {
            b0: null,
        },
        '1-1'
    );

    crdt1.update(
        {
            b0: {
                d1: [1, 2, 3],
            },
        },
        '1-2'
    );

    crdt1.update(
        {
            b0: null,
        },
        '2-1'
    );

    crdt1.update(
        {
            b0: {},
        },
        '2-2'
    );

    t.deepEqual(crdt1.data(), {
        b0: {},
    });

    // ----------------

    const crdt2 = new BaseJsonCRDT({
        data: {
            b0: 'abc',
        },
    });

    crdt2.update(
        {
            b0: null,
        },
        '2-1'
    );

    crdt2.update(
        {
            b0: {},
        },
        '2-2'
    );

    crdt2.update(
        {
            b0: null,
        },
        '1-1'
    );

    crdt2.update(
        {
            b0: {
                d1: [1, 2, 3],
            },
        },
        '1-2'
    );

    t.deepEqual(crdt1.data(), crdt2.data());
});

test('partial delete sets timestamps', t => {
    const data = {};

    const crdt1 = new BaseJsonCRDT({ data: cloneDeep(data) });
    const crdt2 = new BaseJsonCRDT({ data: cloneDeep(data) });

    const updates1 = [
        {
            diff: {
                e0: null,
            },
            timestamp: '1-2',
        },
        {
            diff: {
                e0: {
                    b1: [1, 2, 3],
                    a1: {
                        b2: 'abc',
                        c2: {
                            f3: [],
                        },
                    },
                },
            },
            timestamp: '2-1',
        },
        {
            diff: {
                e0: {
                    a1: {
                        c2: {
                            f3: null,
                        },
                    },
                    b1: {
                        e2: 'test',
                        c2: {
                            f3: 2,
                        },
                    },
                },
            },
            timestamp: '2-2',
        },
        {
            diff: {
                e0: {
                    b1: 1,
                    d1: {
                        a2: [],
                        d2: {
                            a3: null,
                        },
                    },
                },
            },
            timestamp: '3-2',
        },

        {
            diff: {
                e0: {
                    f1: {},
                    a1: {
                        c2: 'abc',
                        e2: {
                            a3: {},
                        },
                    },
                },
            },
            timestamp: '1-1',
        },
    ] as const;

    const updates2 = [
        {
            diff: {
                e0: {
                    b1: 1,
                    d1: {
                        a2: [],
                        d2: {
                            a3: null,
                        },
                    },
                },
            },
            timestamp: '3-2',
        },

        {
            diff: {
                e0: {
                    f1: {},
                    a1: {
                        c2: 'abc',
                        e2: {
                            a3: {},
                        },
                    },
                },
            },
            timestamp: '1-1',
        },
        {
            diff: {
                e0: null,
            },
            timestamp: '1-2',
        },
        {
            diff: {
                e0: {
                    b1: [1, 2, 3],
                    a1: {
                        b2: 'abc',
                        c2: {
                            f3: [],
                        },
                    },
                },
            },
            timestamp: '2-1',
        },
        {
            diff: {
                e0: {
                    a1: {
                        c2: {
                            f3: null,
                        },
                    },
                    b1: {
                        e2: 'test',
                        c2: {
                            f3: 2,
                        },
                    },
                },
            },
            timestamp: '2-2',
        },
    ] as const;

    for (const update of updates1) {
        crdt1.update(update.diff, update.timestamp);
    }

    for (const update of updates2) {
        crdt2.update(update.diff, update.timestamp);
    }

    t.deepEqual(crdt2.data(), {
        e0: {
            a1: {
                c2: {},
            },
            b1: 1,
            d1: {
                a2: [],
                d2: {},
            },
        },
    });
    t.deepEqual(crdt2.data(), crdt1.data());
});

test('empty objects are not deleted when their _self timestamp is present and not older', t => {
    const crdt = new BaseJsonCRDT({ data: { o0: 2 } });

    crdt.update({ o0: {} }, '2-1');
    crdt.update({ o0: null }, '1-1');

    t.deepEqual(crdt.data(), { o0: {} });
});

test('deleting a value does not delete non-empty ancestors', t => {
    const crdt = new BaseJsonCRDT({
        data: {
            a: {
                b: {
                    c: 1,
                },
                d: 2,
            },
        },
    });

    crdt.update({ a: { b: { c: null } } }, '1-1');

    t.deepEqual(crdt.data(), {
        a: {
            b: {},
            d: 2,
        },
    });
});

test('cannot insert new value into deleted object that has higher timestamp', t => {
    const crdt = new BaseJsonCRDT({
        data: {},
        timestamps: {
            a: {
                [TIMESTAMP_KEY]: '2-2',
                b: {
                    [TIMESTAMP_KEY]: '1-1',
                },
            },
        },
        pathsToItemArrays: [],
    });

    crdt.update({ a: { c: 1 } }, '1-2');

    t.deepEqual(crdt.data(), {});
});

test('can insert empty object', t => {
    const crdt = new BaseJsonCRDT({ data: {} });

    crdt.update({ a: {} }, '1-1');

    t.deepEqual(crdt.data(), { a: {} });
});

test('cannot overwrite object with atomic value if any child has higher timestamp', t => {
    const crdt = new BaseJsonCRDT({ data: {}, timestamps: {}, pathsToItemArrays: [] });

    crdt.update({ a: {} }, '1-1');
    crdt.update({ a: { b: 3 } }, '1-2');
    crdt.update({ a: { c: 5 } }, '1-7');
    crdt.update({ a: { c: null } }, '1-8');
    crdt.update({ a: '123' }, '1-4');

    t.deepEqual(crdt.data(), { a: {} });
});

test(`can set property with name '_index' outside of item arrays`, t => {
    const crdt = new BaseJsonCRDT({
        data: {
            foo: 'bar',
        },
    });

    crdt.update(
        {
            some: {
                path: {
                    _index: 'test',
                },
            },
        },
        '1-1'
    );

    t.deepEqual(crdt.data(), {
        foo: 'bar',
        some: {
            path: {
                _index: 'test',
            },
        },
    });
});
