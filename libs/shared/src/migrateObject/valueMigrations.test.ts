import test from 'ava';
import { getValueFromArray } from './valueMigrations';

test('getValueFromArray should return the value at the given index if probablyArray is an array', t => {
    const result = getValueFromArray([1, 2, 3], 1);
    t.is(result, 2);
});

test('getValueFromArray should return undefined if probablyArray is undefined', t => {
    const result = getValueFromArray(undefined, 1);
    t.is(result, undefined);
});

test('getValueFromArray should return undefined if probablyArray is not an array', t => {
    const result = getValueFromArray('not an array', 1);
    t.is(result, undefined);
});

test('getValueFromArray should return undefined if the index is out of bounds', t => {
    const result = getValueFromArray([1, 2, 3], 5);
    t.is(result, undefined);
});
