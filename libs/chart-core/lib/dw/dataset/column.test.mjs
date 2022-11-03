import test from 'ava';
import column from './column.mjs';
import numeral from 'numeral';

const testData = '5.4\t4.2\t4\t3.6\t3.4\t4.5'.split('\t');
const col = column('my title', testData);
const col2 = column('my title', ['18661', '18683', '17103', '16401', '16208', '15025']);

test('Column.name() returns the name', t => {
    t.is(col.name(), 'my title');
});

test('Column.title() returns the title', t => {
    t.is(col.title(), 'my title');
});

test('Column.type() detects a number column type', t => {
    t.is(col.type(), 'number');
    t.is(col2.type(), 'number');
});

test('Column.length contains the number or values', t => {
    t.is(col.length, 6);
});

test('Column.val() returns values parsed as numbers', t => {
    t.is(col.val(0), 5.4);
    t.is(col.val(1), 4.2);
    t.is(col.val(-1), 4.5);
    t.is(col.val(-2), 3.4);
});

test('Column.raw() returns the original values', t => {
    t.is(col.raw(0), '5.4');
    t.is(col.raw(1), '4.2');
    t.is(col.raw(2), '4');
});

test('Column.range() returns the minimum and maximum of the values', t => {
    t.deepEqual(col.range(), [3.4, 5.4]);
});

test('Column.total() returns the number of values', t => {
    t.is(col.total(), 25.1);
});

test('Column.toString() returns column title', t => {
    t.is(col.toString(), 'my title (number)');
});

test('Column.name() purifies HTML name', t => {
    const col = column('evil <script>alert(23)</script> text', []);
    t.is(col.name(), 'evil  text');
});

test('Column.title() purifies non-default HTML tag in title', t => {
    const col = column('Initial title', []);
    col.title('Title with <img src="https://app.datawrapper.de/static/img/icon/favicon.png">tag');
    t.is(col.title(), 'Title with tag');
});

test('Column.title() does not purify non-default HTML tag when tag is explicitly allowed', t => {
    const allowedTags = ['img'];
    const col = column('Initial title', [], undefined, allowedTags);
    col.title('Title with <img src="https://app.datawrapper.de/static/img/icon/favicon.png">tag');
    t.is(
        col.title(),
        'Title with <img src="https://app.datawrapper.de/static/img/icon/favicon.png">tag'
    );
});

test('Column.formatted() formats a number column', t => {
    const col = column('my title', [0, 1, 9000, 3.141592653589793, NaN, null, undefined], 'number');
    t.deepEqual(col.formatted(), [0, 1, 9000, 3.141592653589793, NaN, null, undefined]);

    const locale1 = String(Math.round(Math.random() * 100000));
    numeral.register('locale', locale1, {
        delimiters: {
            thousands: ',', // ignored
            decimal: '.'
        }
    });
    numeral.locale(locale1);
    t.deepEqual(col.formatted(numeral), [
        '0',
        '1',
        '9000',
        '3.141592653589793',
        NaN,
        null,
        undefined
    ]);

    const locale2 = String(Math.round(Math.random() * 100000));
    numeral.register('locale', locale2, {
        delimiters: {
            thousands: ' ', // ignored
            decimal: ','
        }
    });
    numeral.locale(locale2);
    t.deepEqual(col.formatted(numeral), [
        '0',
        '1',
        '9000',
        '3,141592653589793',
        NaN,
        null,
        undefined
    ]);
});

test('Column.formatted() does not format a date column', t => {
    const col = column(
        'my title',
        ['2022-01-13', '2022-01-13T16:47:59+0200', 'Q3 2022', 'spam', NaN, null, undefined],
        'date'
    );
    t.deepEqual(col.formatted(), [
        '2022-01-13',
        '2022-01-13T16:47:59+0200',
        'Q3 2022',
        'spam',
        NaN,
        null,
        undefined
    ]);

    const locale1 = String(Math.round(Math.random() * 100000));
    numeral.register('locale', locale1, {
        delimiters: {
            thousands: ',', // ignored
            decimal: '.'
        }
    });
    numeral.locale(locale1);
    t.deepEqual(col.formatted(numeral), [
        '2022-01-13',
        '2022-01-13T16:47:59+0200',
        'Q3 2022',
        'spam',
        NaN,
        null,
        undefined
    ]);

    const locale2 = String(Math.round(Math.random() * 100000));
    numeral.register('locale', locale2, {
        delimiters: {
            thousands: ' ', // ignored
            decimal: ','
        }
    });
    numeral.locale(locale2);
    t.deepEqual(col.formatted(numeral), [
        '2022-01-13',
        '2022-01-13T16:47:59+0200',
        'Q3 2022',
        'spam',
        NaN,
        null,
        undefined
    ]);
});
