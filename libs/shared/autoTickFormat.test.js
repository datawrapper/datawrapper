import test from 'ava';
import { autoTickFormatDate, autoTickFormatNumber } from './autoTickFormat.js';

test('auto-tick format for number columns', t => {
    t.is(autoTickFormatNumber([0, 0.5]), '0,0.00[0]');
    t.is(autoTickFormatNumber([0, 2]), '0,0.0[0]');
    t.is(autoTickFormatNumber([0, 20]), '0,0.[0]');
    t.is(autoTickFormatNumber([0, 10000]), '0,0');
    t.is(autoTickFormatNumber([0, 2e6]), '0,0a');
    t.is(autoTickFormatNumber([-2e6, -2.01e6]), '0,0a');
});

function date(year, month = 1, day = 1, hour = 0, minute = 0) {
    return new Date(year, month - 1, day, hour, minute);
}

test('auto-tick format for date columns (default precision)', t => {
    const d0 = date(2000);
    t.is(autoTickFormatDate([d0, date(2005)]), 'YYYY|MMM|D');
    t.is(autoTickFormatDate([d0, date(2000, 8)]), 'MMM|D');
    t.is(autoTickFormatDate([d0, date(2000, 2)]), 'MMMM|D');
    t.is(autoTickFormatDate([d0, date(2000, 1, 4)]), 'dddd|LT');
    t.is(autoTickFormatDate([d0, date(2000, 1, 1, 12)]), 'LT');
    t.is(autoTickFormatDate([d0, date(2000, 1, 1, 0, 5)]), 'LTS');
});

test('auto-tick format for date columns (precision year)', t => {
    const d0 = date(2000);
    t.is(autoTickFormatDate([d0, date(2010)], 'year'), "YYYY~~'YY");
    t.is(autoTickFormatDate([d0, date(2004)], 'year'), 'YYYY');
    t.is(autoTickFormatDate([d0, date(2002)], 'year'), 'YYYY|MMM');
});

test('auto-tick format for date columns (precision quarter)', t => {
    const d0 = date(2000);
    t.is(autoTickFormatDate([d0, date(2001)], 'quarter'), 'YYYY|[Q]Q');
    t.is(autoTickFormatDate([d0, date(2000, 4)], 'quarter'), 'YYYY [Q]Q|MMM');
});

test('auto-tick format for date columns (precision week)', t => {
    const d0 = date(2000);
    t.is(autoTickFormatDate([d0, date(2001)], 'week'), 'YYYY|[W]wo');
});
