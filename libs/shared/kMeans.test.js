import test from 'ava';
import kMeans from './kMeans.js';

const values = [1, 1.1, 1.2, 2.1, 3, 3.1, 3.2, 3.3, 7, 7.1, 10];
const cluster2 = [
    [1, 1.1, 1.2, 2.1, 3, 3.1, 3.2, 3.3],
    [7, 7.1, 10]
];
const cluster3 = [
    [1, 1.1, 1.2, 2.1],
    [3, 3.1, 3.2, 3.3],
    [7, 7.1, 10]
];
const cluster4 = [[1, 1.1, 1.2], [2.1], [3, 3.1, 3.2, 3.3], [7, 7.1, 10]];
const cluster5 = [[1, 1.1, 1.2], [2.1], [3, 3.1, 3.2, 3.3], [7, 7.1], [10]];

test('test clustering', t => {
    t.deepEqual(kMeans(values, 2), cluster2);
    t.deepEqual(kMeans(values, 3), cluster3);
    t.deepEqual(kMeans(values, 4), cluster4);
    t.deepEqual(kMeans(values, 5), cluster5);
});

test('remove empty clusters from result', t => {
    t.deepEqual(kMeans(values, 6), cluster5);
});
