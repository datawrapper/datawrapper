import test from 'ava';
import makeUnique from './makeUnique';

test('makeUnique creates a list of unique keys', t => {
    t.deepEqual(makeUnique(['test', 'test', 'test']), ['test', 'test_1', 'test_2']);
    t.deepEqual(makeUnique(['test', 'foo', 'test']), ['test', 'foo', 'test_1']);
    t.deepEqual(makeUnique(['test', 'foo', 'bar']), ['test', 'foo', 'bar']);
    t.deepEqual(makeUnique(['test', 'foo', 'bar', 'bar']), ['test', 'foo', 'bar', 'bar_1']);
    t.deepEqual(makeUnique([]), []);
});
