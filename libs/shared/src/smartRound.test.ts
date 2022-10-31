import test from 'ava';
import smartRound from './smartRound';

test('simple', t => {
    const topic = [9, 10.571428, 12.1428571, 13.7142857, 15.2857142, 16.8571428, 18.428571];
    t.deepEqual(smartRound(topic), [9, 11, 12, 14, 15, 17, 18]);
    t.deepEqual(smartRound(topic, 1), [9, 10.6, 12.1, 13.7, 15.3, 16.9, 18.4]);
});

test('readme', t => {
    t.deepEqual(smartRound([9, 10.5714, 12.1428, 13.7142]), [9, 11, 12, 14]);
    t.deepEqual(smartRound([9, 10.5714, 12.1428, 12.4142]), [9, 10.6, 12.1, 12.4]);
});

/*
test('large numbers', t => {
    const topic = [
        1567671,
        2674349,
        2681458,
        3416274,
        4721235,
        6604073,
        7253794,
        8378838,
        8432436,
        8522286
    ];
    t.deepEqual(smartRound(topic), [
        1570000,
        2670000,
        2680000,
        3420000,
        4720000,
        6600000,
        7250000,
        8380000,
        8430000,
        8520000
    ]);
    t.deepEqual(smartRound(topic, 1), [
        1568000,
        2674000,
        2681000,
        3416000,
        4721000,
        6604000,
        7254000,
        8379000,
        8432000,
        8522000
    ]);
});
*/

test('small numbers', t => {
    const topic = [156e-6, 267e-6, 341e-6, 472e-6];
    t.deepEqual(smartRound(topic), [16e-5, 27e-5, 34e-5, 47e-5]);
});
