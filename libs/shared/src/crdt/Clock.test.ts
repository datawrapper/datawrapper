import test from 'ava';
import { Clock } from './Clock.js';

test(`init clock`, t => {
    // basic clock
    const clock = new Clock(0);
    t.deepEqual(clock.timestamp, '0-0');

    // with nodeId
    const clock2 = new Clock(2354645321);
    t.deepEqual(clock2.timestamp, '2354645321-0');

    // with count
    const clock3 = new Clock(0, 100);
    t.deepEqual(clock3.timestamp, '0-100');

    // with undefined timestamp
    const clock4 = new Clock(undefined);
    t.deepEqual(clock4.timestamp, '0-0');

    // invalid nodeIds
    const error1 = t.throws(() => {
        new Clock(0.4, 9);
    });
    t.is(error1?.message, 'nodeId must be a positive integer but is `0.4` (number)');

    const error2 = t.throws(() => {
        new Clock(-1);
    });
    t.is(error2?.message, 'nodeId must be a positive integer but is `-1` (number)');
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
    t.deepEqual(clock.timestamp, '0-100');

    // update with lower count is ignored
    const clock2 = new Clock(0);
    clock2.update('0-100');
    // with own nodeId
    clock2.update('0-99');
    // with prefered nodeId
    clock2.update('99-99');
    t.deepEqual(clock2.timestamp, '0-100');

    // update with higher count
    const clock3 = new Clock(0);
    clock3.update('0-100');
    clock3.update('0-101');
    t.deepEqual(clock3.timestamp, '0-101');

    // update with different nodeId
    const clock4 = new Clock(99);
    clock4.update('1234-100');
    t.deepEqual(clock4.timestamp, '99-100');
});

test(`clock string conversion`, t => {
    // clock to string
    const clock = new Clock(0);
    const str = clock.timestamp;
    t.deepEqual(str, '0-0');
    t.deepEqual(`${clock}`, '0-0');
    t.deepEqual(JSON.stringify(clock), '"0-0"');

    // after update
    clock.tick();
    const str2 = clock.timestamp;
    t.deepEqual(str2, '0-1');
    t.deepEqual(`${clock}`, '0-1');
    t.deepEqual(JSON.stringify(clock), '"0-1"');

    // string to timestamp
    const clock2 = new Clock(str2);
    t.deepEqual(clock2.timestamp, '0-1');
});

test(`increment clock`, t => {
    // basic increment
    const clock = new Clock('0-0');
    clock.tick();
    t.deepEqual(clock.timestamp, '0-1');

    // increment with nodeId
    const clock2 = new Clock('1234-0');
    clock2.tick();
    t.deepEqual(clock2.timestamp, '1234-1');

    // increment with count
    const clock3 = new Clock('0-1234');
    clock3.tick();
    t.deepEqual(clock3.timestamp, '0-1235');
});

test(`validate timestamp`, t => {
    // valid
    t.true(Clock.validate('0-0'));
    t.true(Clock.validate('0-1'));
    t.true(Clock.validate('1-0'));
    t.true(Clock.validate('1-1'));
    t.true(Clock.validate('1234123-5434654'));

    // invalid
    t.false(Clock.validate('0-0-0'));
    t.false(Clock.validate('0'));
    t.false(Clock.validate('0-'));
    t.false(Clock.validate('-0'));
    t.false(Clock.validate('0-a'));
    t.false(Clock.validate('a-0'));
    t.false(Clock.validate('a-a'));
    t.false(Clock.validate('a'));
});

test(`counter from clock`, t => {
    // basic
    t.deepEqual(new Clock('0-0').count, 0);
    t.deepEqual(new Clock('0-1').count, 1);
    t.deepEqual(new Clock('1-0').count, 0);
    t.deepEqual(new Clock('1-1').count, 1);
    t.deepEqual(new Clock('1234123-5434654').count, 5434654);
});

test(`Clock.max`, t => {
    // basic
    const timestamps = {
        a: '0-0',
        b: '0-1',
        c: '1-0',
        d: '1-1',
        e: '0-5434654',
    };
    t.deepEqual(Clock.max(timestamps).timestamp, '0-5434654');

    // with empty object
    t.deepEqual(Clock.max({}).timestamp, '0-0');

    // with nested object
    const timestamps2 = {
        a: '0-0',
        b: '0-1',
        c: {
            a: '1-0',
            b: '1-1',
            c: {
                a: '1234123-5434654',
            },
        },
    };
    t.deepEqual(Clock.max(timestamps2).timestamp, '1234123-5434654');

    // with invalid timestamps
    const timestamps3 = {
        a: '0-0',
        b: '0-1',
        c: 'foo-bar',
    };
    t.throws(() => Clock.max(timestamps3));
    const timestamps4 = {
        a: '0-0',
        b: 42,
        c: '0-1',
    };
    t.throws(() => Clock.max(timestamps4));
});

test(`compare clocks`, t => {
    // newer
    t.true(new Clock('0-2').isNewerThan('0-1'));
    t.true(new Clock('0-1').isNewerThan('1-0'));
    t.true(new Clock('0-1').isNewerThan(new Clock('1-0')));

    // not newer
    t.false(new Clock('0-0').isNewerThan('0-1'));
    t.false(new Clock('0-0').isNewerThan('1-0'));
    t.false(new Clock('0-1').isNewerThan('0-1'));

    // older
    t.true(new Clock('0-0').isOlderThan('0-1'));
    t.true(new Clock('0-0').isOlderThan('1-0'));
    t.true(new Clock('0-0').isOlderThan(new Clock('1-0')));

    // not older
    t.false(new Clock('0-2').isOlderThan('0-1'));
    t.false(new Clock('0-1').isOlderThan('1-0'));
    t.false(new Clock('0-1').isOlderThan('0-1'));
});
