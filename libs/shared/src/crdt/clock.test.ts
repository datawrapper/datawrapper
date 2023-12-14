import test from 'ava';
import { Clock } from './clock.js';

test(`init clock`, t => {
    // basic clock
    const clock = new Clock(0);
    t.deepEqual(clock.timestamp(), '0-0');

    // with nodeId
    const clock2 = new Clock(2354645321);
    t.deepEqual(clock2.timestamp(), '2354645321-0');

    // with count
    const clock3 = new Clock(0, 100);
    t.deepEqual(clock3.timestamp(), '0-100');

    // invalid nodeIds
    const error1 = t.throws(() => {
        new Clock(0.4, 9);
    });
    t.is(error1?.message, 'nodeId must be a positive integer');

    const error2 = t.throws(() => {
        new Clock(-1);
    });
    t.is(error2?.message, 'nodeId must be a positive integer');
});

test(`clock tick`, t => {
    const clock = new Clock(0);
    t.deepEqual(clock.tick(), '0-1');
    t.deepEqual(clock.tick(), '0-2');
    t.deepEqual(clock.tick(), '0-3');

    const clock2 = new Clock(2354645321);
    t.deepEqual(clock2.tick(), '2354645321-1');
    t.deepEqual(clock2.tick(), '2354645321-2');
    t.deepEqual(clock2.tick(), '2354645321-3');

    const clock3 = new Clock(0, 100);
    t.deepEqual(clock3.tick(), '0-101');
    t.deepEqual(clock3.tick(), '0-102');
    t.deepEqual(clock3.tick(), '0-103');
});

test(`clock update`, t => {
    // basic update works
    const clock = new Clock(0);
    clock.update('0-100');
    t.deepEqual(clock.timestamp(), '0-100');

    // update with lower count is ignored
    const clock2 = new Clock(0);
    clock2.update('0-100');
    clock2.update('0-99');
    clock2.update('99-99');
    t.deepEqual(clock2.timestamp(), '0-100');

    // update with higher count works
    const clock3 = new Clock(0);
    clock3.update('0-100');
    clock3.update('0-101');
    t.deepEqual(clock3.timestamp(), '0-101');

    // update with different nodeId works
    const clock4 = new Clock(99);
    clock4.update('1234-100');
    t.deepEqual(clock4.timestamp(), '99-100');
});

test(`clock string conversion`, t => {
    // clock to string
    const clock = new Clock(0);
    const str = clock.toString();
    t.deepEqual(str, '0-0');

    // after update
    clock.tick();
    const str2 = clock.toString();
    t.deepEqual(str2, '0-1');

    // string to clock
    const clock2 = Clock.fromString(str2);
    t.deepEqual(clock2.timestamp(), '0-1');
});
