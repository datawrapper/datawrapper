import test from 'ava';
import {
    Clock,
    incrementTimestamp,
    getHighestTimestamp,
    validateTimestamp,
    counterFromTimestamp,
    compareTimestamps
} from './clock.js';

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

test(`clock tick `, t => {
    // basic tick
    const clock = new Clock(0);
    t.deepEqual(clock.tick(), '0-1');
    t.deepEqual(clock.tick(), '0-2');
    t.deepEqual(clock.tick(), '0-3');

    // tick with nodeId
    const clock2 = new Clock(2354645321);
    t.deepEqual(clock2.tick(), '2354645321-1');
    t.deepEqual(clock2.tick(), '2354645321-2');
    t.deepEqual(clock2.tick(), '2354645321-3');

    // tick with count
    const clock3 = new Clock(10, 100);
    t.deepEqual(clock3.tick(), '10-101');
    t.deepEqual(clock3.tick(), '10-102');
    t.deepEqual(clock3.tick(), '10-103');
});

test(`clock update `, t => {
    // basic update
    const clock = new Clock(0);
    clock.update('0-100');
    t.deepEqual(clock.timestamp(), '0-100');

    // update with lower count is ignored
    const clock2 = new Clock(0);
    clock2.update('0-100');
    // with own nodeId
    clock2.update('0-99');
    // with prefered nodeId
    clock2.update('99-99');
    t.deepEqual(clock2.timestamp(), '0-100');

    // update with higher count
    const clock3 = new Clock(0);
    clock3.update('0-100');
    clock3.update('0-101');
    t.deepEqual(clock3.timestamp(), '0-101');

    // update with different nodeId
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

test(`increment timestamp`, t => {
    // basic increment
    const timestamp = '0-0';
    const timestamp2 = incrementTimestamp(timestamp);
    t.deepEqual(timestamp2, '0-1');

    // increment with nodeId
    const timestamp3 = '1234-0';
    const timestamp4 = incrementTimestamp(timestamp3);
    t.deepEqual(timestamp4, '1234-1');

    // increment with count
    const timestamp5 = '0-1234';
    const timestamp6 = incrementTimestamp(timestamp5);
    t.deepEqual(timestamp6, '0-1235');
});

test(`validate timestamp`, t => {
    // valid
    t.true(validateTimestamp('0-0'));
    t.true(validateTimestamp('0-1'));
    t.true(validateTimestamp('1-0'));
    t.true(validateTimestamp('1-1'));
    t.true(validateTimestamp('1234123-5434654'));

    // invalid
    t.false(validateTimestamp('0-0-0'));
    t.false(validateTimestamp('0'));
    t.false(validateTimestamp('0-'));
    t.false(validateTimestamp('-0'));
    t.false(validateTimestamp('0-a'));
    t.false(validateTimestamp('a-0'));
    t.false(validateTimestamp('a-a'));
    t.false(validateTimestamp('a'));
});

test(`counter from timestamp`, t => {
    // basic
    t.deepEqual(counterFromTimestamp('0-0'), 0);
    t.deepEqual(counterFromTimestamp('0-1'), 1);
    t.deepEqual(counterFromTimestamp('1-0'), 0);
    t.deepEqual(counterFromTimestamp('1-1'), 1);
    t.deepEqual(counterFromTimestamp('1234123-5434654'), 5434654);
});

test(`getHighestTimestamp`, t => {
    // basic
    const timestamps = {
        a: '0-0',
        b: '0-1',
        c: '1-0',
        d: '1-1',
        e: '0-5434654'
    };
    t.deepEqual(getHighestTimestamp(timestamps), '0-5434654');

    // with empty object
    t.deepEqual(getHighestTimestamp({}), '0-0');

    // with nested object
    const timestamps2 = {
        a: '0-0',
        b: '0-1',
        c: {
            a: '1-0',
            b: '1-1',
            c: {
                a: '1234123-5434654'
            }
        }
    };
    t.deepEqual(getHighestTimestamp(timestamps2), '1234123-5434654');

    // with invalid timestamps
    const timestamps3 = {
        a: '0-0',
        b: '0-1',
        c: 'foo-bar'
    };
    t.throws(() => getHighestTimestamp(timestamps3));
    const timestamps4 = {
        a: '0-0',
        b: 42,
        c: '0-1'
    };
    t.throws(() => getHighestTimestamp(timestamps4));
});

test(`compare timestamps`, t => {
    // bigger
    t.true(compareTimestamps('0-2', '0-1'));
    t.true(compareTimestamps('0-1', '1-0'));

    // not bigger
    t.false(compareTimestamps('0-0', '0-1'));
    t.false(compareTimestamps('0-0', '1-0'));
    t.false(compareTimestamps('0-1', '0-1'));
});
