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
    set,
    removeNullsFromObject,
    itemArrayPathFromIndexPath,
    isPathToItemArrayAncestor,
    isPathToItemArray,
    isPathToItemArrayItem,
    generateRandomId,
    typeofObjectProperties,
    valueWithType,
} from './utils.js';
import { TIMESTAMP_KEY } from './constants.js';

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

test('hasId - returns false for non-objects and objects without an id property or an empty string id property', t => {
    t.false(hasId({ id: undefined }));
    t.false(hasId({ id: null }));
    t.false(hasId({ foo: 'bar' }));
    t.false(hasId('test'));
    t.false(hasId(null));
    t.false(hasId(false));
    t.false(hasId({}));
    t.false(hasId({ id: '' }));
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
            { id: 'b', bar: 'baz' },
        ]),
        {
            a: { foo: 'bar', id: 'a', _index: 0 },
            b: { bar: 'baz', id: 'b', _index: 1 },
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

test('removeNullsFromObject - removes null values everywhere in nested object', t => {
    const obj = { a: { b: { d: 1, e: { null: null, not_null: 'not_null' } } }, x: null };
    t.deepEqual(removeNullsFromObject(obj), { a: { b: { d: 1, e: { not_null: 'not_null' } } } });
});

test('removeNullsFromObject - does not remove null values for _index keys', t => {
    const obj = {
        a: { b: { d: 1, _index: null, e: { _index: null, not_null: 'not_null' } } },
        x: null,
    };
    t.deepEqual(removeNullsFromObject(obj), {
        a: { b: { d: 1, _index: null, e: { _index: null, not_null: 'not_null' } } },
    });
});

test('itemArrayPathFromIndexPath - returns the correct path for item array index', t => {
    t.deepEqual(itemArrayPathFromIndexPath(['a', 'id', '_index']), ['a']);
    t.deepEqual(itemArrayPathFromIndexPath(['a', 'b', 'c', 'id', '_index']), ['a', 'b', 'c']);
});

test('itemArrayPathFromIndexPath - throws error if path is not to item array index', t => {
    t.throws(() => itemArrayPathFromIndexPath(['a', 'id', TIMESTAMP_KEY]));
    t.throws(() => itemArrayPathFromIndexPath(['a', 'id']));
    t.throws(() => itemArrayPathFromIndexPath(['a']));
    t.throws(() => itemArrayPathFromIndexPath([]));
});

test('isPathToItemArrayAncestor', t => {
    const pathsToItemArrays = ['arr', 'a.b', 'a.2.4.r'];

    // path to item array ancestors
    t.true(isPathToItemArrayAncestor(pathsToItemArrays, ['a']));
    t.true(isPathToItemArrayAncestor(pathsToItemArrays, ['a', '2', '4']));
    t.true(isPathToItemArrayAncestor(pathsToItemArrays, ['a', '2']));

    // path to item arrays
    t.false(isPathToItemArrayAncestor(pathsToItemArrays, ['arr']));
    t.false(isPathToItemArrayAncestor(pathsToItemArrays, ['a', 'b']));
    t.false(isPathToItemArrayAncestor(pathsToItemArrays, ['a', '2', '4', 'r']));

    // path to item array items
    t.false(isPathToItemArrayAncestor(pathsToItemArrays, ['a', 'b', 'c']));
    t.false(isPathToItemArrayAncestor(pathsToItemArrays, ['a', '2', '4', 'r', 's']));

    // random paths
    t.false(isPathToItemArray(pathsToItemArrays, ['a', 'false']));
    t.false(isPathToItemArray(pathsToItemArrays, ['arr', 'x', 'y']));

    // edge case:
    t.false(isPathToItemArrayAncestor(['ab'], ['a']));
});

test('isPathToItemArray', t => {
    const pathsToItemArrays = ['arr', 'a.b', 'a.2.4.r'];

    // path to item array ancestors
    t.false(isPathToItemArray(pathsToItemArrays, ['a']));
    t.false(isPathToItemArray(pathsToItemArrays, ['a', '2', '4']));
    t.false(isPathToItemArray(pathsToItemArrays, ['a', '2']));

    // path to item arrays
    t.true(isPathToItemArray(pathsToItemArrays, ['arr']));
    t.true(isPathToItemArray(pathsToItemArrays, ['a', 'b']));
    t.true(isPathToItemArray(pathsToItemArrays, ['a', '2', '4', 'r']));

    // path to item array items
    t.false(isPathToItemArray(pathsToItemArrays, ['a', 'b', 'c']));
    t.false(isPathToItemArray(pathsToItemArrays, ['a', '2', '4', 'r', 's']));

    t.false(isPathToItemArray(pathsToItemArrays, ['arr', 'x', 'y']));
});

test('isPathToItemArrayItem', t => {
    const pathsToItemArrays = ['arr', 'a.b', 'a.2.4.r'];

    // path to item array ancestors
    t.false(isPathToItemArrayItem(pathsToItemArrays, ['a']));
    t.false(isPathToItemArrayItem(pathsToItemArrays, ['a', '2', '4']));
    t.false(isPathToItemArrayItem(pathsToItemArrays, ['a', '2']));

    // path to item arrays
    t.false(isPathToItemArrayItem(pathsToItemArrays, ['arr']));
    t.false(isPathToItemArrayItem(pathsToItemArrays, ['a', 'b']));
    t.false(isPathToItemArrayItem(pathsToItemArrays, ['a', '2', '4', 'r']));
    t.false(isPathToItemArrayItem(pathsToItemArrays, ['a', 'false']));

    // path to item array items
    t.true(isPathToItemArrayItem(pathsToItemArrays, ['a', 'b', 'c']));
    t.true(isPathToItemArrayItem(pathsToItemArrays, ['a', '2', '4', 'r', 's']));

    // path to item array item child
    t.false(isPathToItemArrayItem(pathsToItemArrays, ['a', '2', '4', 'r', 's', 't']));
});

test('generateRandomId - generates random string', t => {
    t.true(generateRandomId().length > 0);
});

test('generateRandomId - generates different string every time', t => {
    const ids = new Set<string>();
    for (let i = 0; i < 10; i++) {
        ids.add(generateRandomId());
    }
    t.is(ids.size, 10);
});

test('typeofObjectProperties - returns the type of all properties of an object', t => {
    t.deepEqual(typeofObjectProperties({ a: 1, b: 'foo', c: { d: 2 } }), {
        a: 'number',
        b: 'string',
        c: 'object',
    });
});

test('valueWithType - returns the value with its type for primitives', t => {
    t.is(valueWithType(1), '`1` (number)');
    t.is(valueWithType('foo'), '`foo` (string)');
    t.is(valueWithType(true), '`true` (boolean)');
    t.is(valueWithType(null), '`null` (object)');
    t.is(valueWithType(undefined), '`undefined` (undefined)');
});

test('valueWithType - returns the value with its type for objects', t => {
    t.is(valueWithType({ a: 1, b: { c: 2 } }), '`{"a":1,"b":{"c":2}}` (object)');
    t.is(valueWithType([]), '`[]` (object)');
    t.is(valueWithType([1, 2, 3]), '`[1,2,3]` (object)');
    t.is(
        valueWithType(new Date('2024-10-29T18:51:30.361Z')),
        '`"2024-10-29T18:51:30.361Z"` (object)'
    );
});
