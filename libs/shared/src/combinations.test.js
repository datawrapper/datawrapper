import test from 'ava';
import combinations from './combinations.js';

test('just one element', t => {
    t.deepEqual(combinations([1]), [[1]]);
});

test('two elements', t => {
    t.deepEqual(combinations([1, 2]), [[1, 2], [1], [2]]);
});

test('three elements', t => {
    t.deepEqual(combinations([1, 2, 3]), [[1, 2, 3], [1, 2], [1, 3], [1], [2, 3], [2], [3]]);
});
