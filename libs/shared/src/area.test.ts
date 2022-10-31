import test from 'ava';
import area from './area';

test('area of a square', t => {
    t.is(
        area([
            [0, 0],
            [5, 0],
            [5, 5],
            [0, 5],
            [0, 0]
        ]),
        25
    );
});

test('area of a triangle', t => {
    t.is(
        area([
            [0, 0],
            [5, 0],
            [5, 5],
            [0, 0]
        ]),
        25 / 2
    );
});

test('area of a square - counter-clockwise', t => {
    t.is(
        area([
            [0, 0],
            [0, 5],
            [5, 5],
            [5, 0],
            [0, 0]
        ]),
        -25
    );
});
