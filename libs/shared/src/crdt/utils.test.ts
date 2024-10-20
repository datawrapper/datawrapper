import test from 'ava';
import {
    assertOneOf,
    hasId,
    isActualObject,
    isAtomic,
    isDeleteOperator,
    isEmptyObject,
    isExistingAtomicValue,
    isItemArray,
    isNonEmptyObject,
    isPathToItemArrayIndex,
    itemArrayToObject,
    migrateTimestamps,
    set
} from './utils.js';
import { TIMESTAMP_KEY } from './constants.js';

test('migrateTimestamps - migrates legacy timestamps', t => {
    t.deepEqual(
        migrateTimestamps<object>({
            c: {
                _self: '2-5',
                d: '3-1',
                f: {
                    _self: '4-2',
                    g: '5-1'
                },
                i: {
                    j: '6-1'
                }
            },
            e: '5-1',
            h: {
                _self: '6-1'
            }
        }),
        {
            c: {
                [TIMESTAMP_KEY]: '2-5',
                d: {
                    [TIMESTAMP_KEY]: '3-1'
                },
                f: {
                    [TIMESTAMP_KEY]: '4-2',
                    g: {
                        [TIMESTAMP_KEY]: '5-1'
                    }
                },
                i: {
                    j: {
                        [TIMESTAMP_KEY]: '6-1'
                    }
                }
            },
            e: {
                [TIMESTAMP_KEY]: '5-1'
            },
            h: {
                [TIMESTAMP_KEY]: '6-1'
            }
        }
    );
});

test('migrateTimestamps - migrates legacy timestamps for item array', t => {
    t.deepEqual(
        migrateTimestamps<object>({
            itemArr: {
                a: {
                    someValue: '1-1',
                    _index: '1-2'
                },
                b: {
                    someValue: '1-3',
                    _index: '1-4'
                }
            }
        }),
        {
            itemArr: {
                a: {
                    someValue: { [TIMESTAMP_KEY]: '1-1' },
                    _index: { [TIMESTAMP_KEY]: '1-2' }
                },
                b: {
                    someValue: { [TIMESTAMP_KEY]: '1-3' },
                    _index: { [TIMESTAMP_KEY]: '1-4' }
                }
            }
        }
    );
});

test('migrateTimestamps - keeps new timestamps', t => {
    t.deepEqual(
        migrateTimestamps<object>({
            a: {
                [TIMESTAMP_KEY]: '1-1',
                b: {
                    [TIMESTAMP_KEY]: '1-2'
                }
            },
            c: {
                [TIMESTAMP_KEY]: '2-1'
            }
        }),
        {
            a: {
                [TIMESTAMP_KEY]: '1-1',
                b: {
                    [TIMESTAMP_KEY]: '1-2'
                }
            },
            c: {
                [TIMESTAMP_KEY]: '2-1'
            }
        }
    );
});

test('migrateTimestamps - keeps new timestamps for item array', t => {
    t.deepEqual(
        migrateTimestamps<object>({
            itemArr: {
                a: {
                    someValue: { [TIMESTAMP_KEY]: '1-1' },
                    _index: { [TIMESTAMP_KEY]: '1-2' }
                },
                b: {
                    someValue: { [TIMESTAMP_KEY]: '1-3' },
                    _index: { [TIMESTAMP_KEY]: '1-4' }
                }
            }
        }),
        {
            itemArr: {
                a: {
                    someValue: { [TIMESTAMP_KEY]: '1-1' },
                    _index: { [TIMESTAMP_KEY]: '1-2' }
                },
                b: {
                    someValue: { [TIMESTAMP_KEY]: '1-3' },
                    _index: { [TIMESTAMP_KEY]: '1-4' }
                }
            }
        }
    );
});

test('isDeleteOperator', t => {
    t.true(isDeleteOperator(null));
    t.true(isDeleteOperator(undefined));

    t.false(isDeleteOperator(false));
    t.false(isDeleteOperator(true));
    t.false(isDeleteOperator(1));
    t.false(isDeleteOperator('a'));
    t.false(isDeleteOperator([]));
    t.false(isDeleteOperator([1, 2]));
    t.false(isDeleteOperator({}));
    t.false(isDeleteOperator({ a: 1 }));
    t.false(isDeleteOperator(new Date()));
});

test('isActualObject', t => {
    t.true(isActualObject({}));
    t.true(isActualObject({ a: 1 }));

    t.false(isActualObject(null));
    t.false(isActualObject(undefined));
    t.false(isActualObject(false));
    t.false(isActualObject(true));
    t.false(isActualObject(1));
    t.false(isActualObject('a'));
    t.false(isActualObject([]));
    t.false(isActualObject([1, 2]));
    t.false(isActualObject(new Date()));
});

test('isEmptyObject', t => {
    t.true(isEmptyObject({}));

    t.false(isEmptyObject({ a: 1 }));
    t.false(isEmptyObject(null));
    t.false(isEmptyObject(undefined));
    t.false(isEmptyObject(false));
    t.false(isEmptyObject(true));
    t.false(isEmptyObject(1));
    t.false(isEmptyObject('a'));
    t.false(isEmptyObject([]));
    t.false(isEmptyObject([1, 2]));
    t.false(isEmptyObject(new Date()));
});

test('isNonEmptyObject', t => {
    t.true(isNonEmptyObject({ a: 1 }));

    t.false(isNonEmptyObject({}));
    t.false(isNonEmptyObject(null));
    t.false(isNonEmptyObject(undefined));
    t.false(isNonEmptyObject(false));
    t.false(isNonEmptyObject(true));
    t.false(isNonEmptyObject(1));
    t.false(isNonEmptyObject('a'));
    t.false(isNonEmptyObject([]));
    t.false(isNonEmptyObject([1, 2]));
    t.false(isNonEmptyObject(new Date()));
});

test('isAtomic', t => {
    t.true(isAtomic(null));
    t.true(isAtomic(undefined));
    t.true(isAtomic(false));
    t.true(isAtomic(true));
    t.true(isAtomic(1));
    t.true(isAtomic('a'));
    t.true(isAtomic([]));
    t.true(isAtomic([1, 2]));
    t.true(isAtomic(new Date()));

    t.false(isAtomic({ a: 1 }));
    t.false(isAtomic({}));
});

test('isExistingAtomicValue', t => {
    t.true(isExistingAtomicValue(false));
    t.true(isExistingAtomicValue(true));
    t.true(isExistingAtomicValue(1));
    t.true(isExistingAtomicValue('a'));
    t.true(isExistingAtomicValue([]));
    t.true(isExistingAtomicValue([1, 2]));
    t.true(isExistingAtomicValue(new Date()));

    // This currently makes sense because null values are treated as regular values. They are only removed later.
    t.true(isExistingAtomicValue(null));

    t.false(isExistingAtomicValue(undefined));
    t.false(isExistingAtomicValue({ a: 1 }));
    t.false(isExistingAtomicValue({}));
});

test('isPathToItemArrayIndex', t => {
    t.true(isPathToItemArrayIndex(['a', 'b', '_index']));

    t.false(isPathToItemArrayIndex(['a', 'b', TIMESTAMP_KEY]));
    t.false(isPathToItemArrayIndex(['a', 'b']));
    t.false(isPathToItemArrayIndex(['a']));
    t.false(isPathToItemArrayIndex([]));
});

test('isItemArray - returns true for valid item arrays', t => {
    t.true(isItemArray([{ id: 'a' }, { id: 'b', foo: 'bar' }, { id: 1 }]));
});

test('isItemArray - returns false for non item arrays', t => {
    t.false(isItemArray({}));
    t.false(isItemArray(null));
    t.false(isItemArray([]));
    t.false(isItemArray([1, 2, 3]));
    t.false(isItemArray([{ foo: 'bar' }, { id: 'b', foo: 'bar' }, { id: 1 }]));
    t.false(isItemArray([{ id: 'a' }, { id: 'b', foo: 'bar' }, 3]));
});

test('hasId - returns true for objects with a string or number id property', t => {
    t.true(hasId({ id: 'a' }));
    t.true(hasId({ id: 1 }));
});

test('hasId - returns false for non-objects and objects without an id property', t => {
    t.false(hasId({ id: undefined }));
    t.false(hasId({ id: null }));
    t.false(hasId({ foo: 'bar' }));
    t.false(hasId('test'));
    t.false(hasId(null));
    t.false(hasId(false));
    t.false(hasId({}));
});

test('assertOneOf - does not throw error if at least one callback returns true', t => {
    t.notThrows(() => assertOneOf(3, [v => v === 1, v => v === 2, v => v === 3]));
    t.notThrows(() => assertOneOf(4, [Boolean]));

    t.notThrows(() => assertOneOf(null, [isDeleteOperator, isAtomic]));
    t.notThrows(() => assertOneOf({}, [isDeleteOperator, isActualObject]));
});

test('assertOneOf - throws error if no callback returns true', t => {
    t.throws(() => assertOneOf(4, [v => v === 2, v => v === 3]));
    t.throws(() => assertOneOf(4, []));

    t.throws(() => assertOneOf(null, [isActualObject, isEmptyObject]));
    t.throws(() => assertOneOf({ foo: 'bar' }, [isAtomic, isDeleteOperator]));
});

test('itemArrayToObject - converts an item array to an object', t => {
    t.deepEqual(
        itemArrayToObject([
            { id: 'a', foo: 'bar' },
            { id: 'b', bar: 'baz' }
        ]),
        {
            a: { foo: 'bar', id: 'a', _index: 0 },
            b: { bar: 'baz', id: 'b', _index: 1 }
        }
    );
});

test('set - throws error when path is passed as a string', t => {
    // @ts-expect-error - intentionally passing a string as path
    t.throws(() => set({}, 'a', 42));
});

test('set - assigns nested value', t => {
    const obj = { a: { b: { c: 3 } } };
    set(obj, ['a', 'b', 'c'], 42);
    t.deepEqual(obj, { a: { b: { c: 42 } } });
});

test('set - creates nested value', t => {
    const obj = {};
    set(obj, ['a', 'b', 'c'], 42);
    t.deepEqual(obj, { a: { b: { c: 42 } } });
});

test('set - replaces arrays and does not merge properties onto the array', t => {
    const obj = { a: [1, 2, 3] };
    set(obj, ['a', 'b', 'c'], 42);
    t.deepEqual(obj, { a: { b: { c: 42 } } });
});

test('set - replaces primitive values', t => {
    const obj = { a: 'foo', b: 42, c: true };
    set(obj, ['a', 'b', 'c'], 4);
    set(obj, ['b', 'c'], 5);
    set(obj, ['c', 'd'], 6);
    t.deepEqual(obj, { a: { b: { c: 4 } }, b: { c: 5 }, c: { d: 6 } });
});

test('set - inserts properties into existing objects', t => {
    const obj = { a: { b: 1 } };
    set(obj, ['a', 'c'], 2);
    set(obj, ['a', 'd', 'e', 'f'], 3);
    t.deepEqual(obj, { a: { b: 1, c: 2, d: { e: { f: 3 } } } });
});
