import test from 'ava';
import dateFormatter from './dateColumnFormatter';
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
        precision: () => 'year' as const
    };

    const formatter = dateFormatter(column);
    t.is(formatter(dates[0]), 2000);
    t.is(formatter(dates[2]), 2001);
});

test('half year format', t => {
    const formatter = dateFormatter({
        format: () => 'YYYY-h',
        precision: () => 'half'
    });
    t.is(formatter(dates[0]), '2000 H1');
    t.is(formatter(dates[2]), '2001 H2');
});

test('quarter year format', t => {
    const formatter = dateFormatter({
        format: () => 'Q-YYYY',
        precision: () => 'quarter'
    });
    t.is(formatter(dates[0]), '2000 Q1');
    t.is(formatter(dates[1]), '2000 Q2');
    t.is(formatter(dates[2]), '2001 Q3');
});

test('month format', t => {
    const formatter = dateFormatter({
        format: () => 'M-YYYY',
        precision: () => 'month'
    });
    t.is(formatter(dates[0]), 'Jan 00');
    t.is(formatter(dates[1]), 'Apr 00');
    t.is(formatter(dates[2]), 'Jul 01');
});

test('week', t => {
    const formatter = dateFormatter({
        format: () => 'YYYY-WW',
        precision: () => 'week'
    });
    t.is(formatter(dates[1]), '2000 W13');
    t.is(formatter(dates[2]), '2001 W26');
});

test('day', t => {
    const formatter = dateFormatter({
        format: () => 'MM/DD/YYYY',
        precision: () => 'day'
    });

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
    const formatter = dateFormatter({
        format: () => 'MM/DD/YYYY HH:MM',
        precision: () => 'day-minutes'
    });

    // non-verbose
    t.is(formatter(dates[0]), 'Jan&nbsp;01 - 12:00&nbsp;AM');
    t.is(formatter(dates[1]), 'Apr&nbsp;01 - 11:34&nbsp;AM');

    // verbose
    t.is(formatter(dates[0], true), 'Jan&nbsp;01,&nbsp;2000 - 12:00&nbsp;AM');
    t.is(formatter(dates[1], true), 'Apr&nbsp;01,&nbsp;2000 - 11:34&nbsp;AM');
});

test('day-seconds', t => {
    const formatter = dateFormatter({
        format: () => 'ISO8601',
        precision: () => 'day-seconds'
    });

    // non-verbose
    t.is(formatter(dates[0]), '12:00:00&nbsp;AM');
    t.is(formatter(dates[1]), '11:34:05&nbsp;AM');

    // verbose
    t.is(formatter(dates[0], true), 'Jan&nbsp;01,&nbsp;2000 - 12:00:00&nbsp;AM');
    t.is(formatter(dates[1], true), 'Apr&nbsp;01,&nbsp;2000 - 11:34:05&nbsp;AM');
});
