import test from 'ava';
import dateFormatter from './dateColumnFormatter.js';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat.js';
dayjs.extend(localizedFormat);

const dates = [
    new Date(2000, 0, 1),
    new Date(2000, 3, 1, 11, 34, 5),
    new Date(2001, 6, 1),
    new Date(2001, 11, 25)
];

test('full year format', t => {
    const column = {
        format: () => 'YYYY',
        precision: () => 'year'
    };

    const formatter = dateFormatter(column);
    t.is(formatter(dates[0]), 2000);
    t.is(formatter(dates[2]), 2001);
});

test('half year format', t => {
    const column = {
        format: () => 'YYYY-h',
        precision: () => 'half'
    };

    const formatter = dateFormatter(column);
    t.is(formatter(dates[0]), '2000 H1');
    t.is(formatter(dates[2]), '2001 H2');
});

test('quarter year format', t => {
    const column = {
        format: () => 'Q-YYYY',
        precision: () => 'quarter'
    };

    const formatter = dateFormatter(column);
    t.is(formatter(dates[0]), '2000 Q1');
    t.is(formatter(dates[1]), '2000 Q2');
    t.is(formatter(dates[2]), '2001 Q3');
});

test('month format', t => {
    const column = {
        format: () => 'M-YYYY',
        precision: () => 'month'
    };

    const formatter = dateFormatter(column);
    t.is(formatter(dates[0]), 'Jan 00');
    t.is(formatter(dates[1]), 'Apr 00');
    t.is(formatter(dates[2]), 'Jul 01');
});

test('week', t => {
    const column = {
        format: () => 'YYYY-WW',
        precision: () => 'week'
    };

    const formatter = dateFormatter(column);
    t.is(formatter(dates[1]), '2000 W13');
    t.is(formatter(dates[2]), '2001 W26');
});

test('day', t => {
    const column = {
        format: () => 'MM/DD/YYYY',
        precision: () => 'day'
    };

    const formatter = dateFormatter(column);

    // non-verbose
    t.is(formatter(dates[0]), '1/1/2000');
    t.is(formatter(dates[1]), '4/1/2000');
    t.is(formatter(dates[2]), '7/1/2001');
    t.is(formatter(dates[3]), '12/25/2001');

    // verbose
    t.is(formatter(dates[0], true), 'Saturday, January 01, 2000');
    t.is(formatter(dates[1], true), 'Saturday, April 01, 2000');
    t.is(formatter(dates[2], true), 'Sunday, July 01, 2001');
    t.is(formatter(dates[3], true), 'Tuesday, December 25, 2001');
});

test('day-minutes', t => {
    const column = {
        format: () => 'MM/DD/YYYY HH:MM',
        precision: () => 'day-minutes'
    };

    const formatter = dateFormatter(column);

    // verbose
    t.is(formatter(dates[0], true), 'Jan&nbsp;01 - 12:00&nbsp;AM');
    t.is(formatter(dates[1], true), 'Apr&nbsp;01 - 11:34&nbsp;AM');
});

test('day-seconds', t => {
    const column = {
        format: () => 'ISO8601',
        precision: () => 'day-seconds'
    };

    const formatter = dateFormatter(column);

    // verbose
    t.is(formatter(dates[0], true), '12:00:00&nbsp;AM');
    t.is(formatter(dates[1], true), '11:34:05&nbsp;AM');
});
