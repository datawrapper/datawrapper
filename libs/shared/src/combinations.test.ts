import test from 'ava';
import combinations from './combinations';

test('returns the combinations of one element', t => {
    t.deepEqual(combinations([1]), [[1]]);
});

test('returns the combinations of two elements', t => {
    t.deepEqual(combinations([1, 2]), [[1, 2], [1], [2]]);
});

test('returns the combinations of three elements', t => {
    t.deepEqual(combinations([1, 2, 3]), [[1, 2, 3], [1, 2], [1, 3], [1], [2, 3], [2], [3]]);
});

test('returns an empty array when passed an empty array', t => {
    t.deepEqual(combinations([]), []);
});
