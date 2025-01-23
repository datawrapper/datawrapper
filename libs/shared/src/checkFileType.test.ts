import { isCSV, isJSON } from './checkFileType';
import test from 'ava';

test('isCSV returns true for a string that contains a newline', t => {
    t.true(isCSV('foo\nbar'));
});

test('isCSV returns true for a string that contains a separator', t => {
    t.true(isCSV('foo,bar'));
    t.true(isCSV('foo;bar'));
    t.true(isCSV('foo\tbar'));
});

test('isCSV returns false for a string that contains markup', t => {
    t.false(isCSV('foo\nbar,baz\n</html>'));
    t.false(isCSV('foo\nbar,baz\n</svg>'));
});

test('isJSON returns true for a valid JSON string', t => {
    t.true(isJSON('{ "foo": 1 }'));
});

test('isJSON returns false for an invalid JSON string', t => {
    t.false(isJSON('{ "foo": 1'));
});
