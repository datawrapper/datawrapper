import test from 'ava';
import { range, uniq } from 'underscore';
import round from './round.js';
import significantDimension from './significantDimension.js';

const tests = [
    { values: range(10), dim: 0 },
    { values: range(0, 100, 10), dim: -1 },
    { values: range(0, 1000, 100), dim: -2 },
    { values: range(0, 100, 1), dim: 0 },
    { values: [9, 10.57, 12.14, 13.71, 15.28, 16.85, 18.42], dim: 0 },
    { values: [9, 10.57, 12.14, 12.31, 15.28, 16.85, 18.42], dim: 1 },
    { values: [9, 10.57, 12.14, 12.134, 15.28, 16.85, 18.42], dim: 2 },
    { values: [13000, 18000, 9000, 17000, 20000, 11000, 10000, 12000, 14000], dim: -3 },
    {
        values: [
            13000, 18000, 9000, 13000, 17000, 18000, 20000, 20000, 13000, 18000, 11000, 20000,
            20000, 13000, 13000, 13000, 10000, 11000, 12000, 12000, 12000, 13000, 12000, 14000,
            10000
        ],
        dim: -3
    },
    { values: [50, 70, 90, 100, 130], dim: -1 },
    { values: [0.01, 0.02, 0.03, 0.04, 0.04], dim: 2 }
];

tests.forEach((testCase, i) => {
    test(`case ${i + 1}: check significant dimension`, t => {
        t.is(significantDimension(testCase.values), testCase.dim);
    });
    test(`case ${i + 1}: check unique value count after rounding`, t => {
        const dim = significantDimension(testCase.values);
        const uniqueBefore = uniq(testCase.values);
        const uniqueAfter = uniq(testCase.values.map(v => round(v, dim)));

        t.is(uniqueBefore.length, uniqueAfter.length);
    });
});
