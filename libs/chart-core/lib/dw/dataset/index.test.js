import test from 'ava';
import Column from './column.js';
import Dataset from './index.js';
import delimited from './delimited.js';
import numeral from 'numeral';

test.beforeEach(t => {
    const priceEUR = Column('price (EUR)', [24, 0, 80], 'number');
    priceEUR.isComputed = true;
    t.context.dataset = Dataset([
        Column('thing', ['foo', 'bar', 'spam'], 'text'),
        Column('price', [1.2, undefined, '4'], 'number'),
        priceEUR,
    ]);
});

test('Dataset() sets unique names for columns with empty names', async t => {
    const dataset = Dataset([Column('foo', []), Column('', []), Column('bar', []), Column('', [])]);
    t.deepEqual(
        dataset.columns().map(column => [column.name(), column.origName()]),
        [
            ['foo', 'foo'],
            ['X.1', ''],
            ['bar', 'bar'],
            ['X.2', ''],
        ]
    );
});

test('Dataset() sets unique names for columns with same names', async t => {
    const dataset = Dataset([
        Column('foo', []),
        Column('foo', []),
        Column('foo.2', []),
        Column('foo', []),
        Column('foo.1', []),
        Column('foo', []),
    ]);
    t.deepEqual(
        dataset.columns().map(column => [column.name(), column.origName()]),
        [
            ['foo', 'foo'],
            ['foo.1', 'foo'],
            ['foo.2', 'foo.2'],
            ['foo.3', 'foo'],
            ['foo.1.1', 'foo.1'],
            ['foo.4', 'foo'],
        ]
    );
});

test('Dataset() handles both columns with empty names and columns with non-unique names', async t => {
    const dataset = Dataset([Column('', []), Column('X', []), Column('X', []), Column('', [])]);
    t.deepEqual(
        dataset.columns().map(column => [column.name(), column.origName()]),
        [
            ['X.1', ''],
            ['X', 'X'],
            ['X.2', 'X'],
            ['X.3', ''],
        ]
    );
});

test('Dataset.csv() returns a CSV including computed columns and the header by default', async t => {
    const expected = `thing,price,price (EUR)
foo,1.2,24
bar,,0
spam,4,80`;
    t.is(t.context.dataset.csv(), expected);
});

test('Dataset.csv() returns a CSV without computed columns when an option is passed', async t => {
    const expected = `thing,price
foo,1.2
bar,
spam,4`;
    t.is(t.context.dataset.csv({ includeComputedColumns: false }), expected);
});

test('Dataset.csv() returns a localized CSV when the numeral argument is passed', async t => {
    const sourceDataset = Dataset([
        Column('thing', ['foo', 'bar', 'spam'], 'text'),
        Column('price', [3.141592653589793, 9000, undefined], 'number'),
        Column('date', ['2022-01-13', '2022-01-14', undefined], 'date'),
    ]);
    const expectedCSV = `thing;price;date
foo;3,141592653589793;2022-01-13
bar;9000;2022-01-14
spam;;`;
    const locale = String(Math.round(Math.random() * 100000));
    numeral.register('locale', locale, {
        delimiters: {
            thousands: ' ', // ignored
            decimal: ',',
        },
    });
    numeral.locale(locale);
    const resultCSV = sourceDataset.csv({ numeral });
    t.is(resultCSV, expectedCSV);
});

test('Dataset.csv() returns a CSV without the header row when an option is passed', async t => {
    const expected = `foo,1.2,24
bar,,0
spam,4,80`;
    t.is(t.context.dataset.csv({ includeHeader: false }), expected);
});

test('Dataset.csv() quoting', async t => {
    const sourceValues = [
        'standard',
        '"quoted"',
        'line\nfeed',
        'carriage\rreturn',
        'with,delimiter',
        '"with,delimiter-quoted"',
        'with"quote',
        '"with"quote-quoted"',
    ];
    const expectedCSV = `X.1
standard
"""quoted"""
"line\nfeed"
"carriage\rreturn"
"with,delimiter"
"""with,delimiter-quoted"""
"with""quote"
"""with""quote-quoted"""`;

    const sourceDataset = Dataset([Column('X.1', sourceValues, 'text')]);
    const resultCSV = sourceDataset.csv();
    t.is(resultCSV, expectedCSV);

    const parsedDataset = await delimited({ csv: resultCSV }).dataset();
    t.deepEqual(parsedDataset.column(0).raw(), sourceValues);
});

test('Dataset.csv() returns a CSV that does not escape less/greater-than signs', async t => {
    const dataset = Dataset([
        Column('text', ['<10', '10', '>10'], 'text'),
        Column('numbers', [0, 1, 2], 'number'),
    ]);

    const expectedCSV = `text,numbers
<10,0
10,1
>10,2`;

    t.is(dataset.csv({ includeHeader: true }), expectedCSV);
});

test('Dataset.csv() does not contain html-escaped values', async t => {
    const dataset = Dataset([
        Column('text', ['Amp &amp; Ersand', '&quot;Double&quot;', '&#39;Single&#39;'], 'text'),
        Column('numbers', [0, 1, 2], 'number'),
    ]);

    const expectedCSV = `text,numbers
Amp & Ersand,0
"""Double""",1
'Single',2`;

    t.is(dataset.csv({ includeHeader: true }), expectedCSV);
});

test('Dataset.deleteRow() deletes correct row', async t => {
    const expected = `thing,price,price (EUR)
foo,1.2,24
spam,4,80`;
    // First row is header, so index of `1` deletes 3rd line in csv.
    t.context.dataset.deleteRow(1);
    t.is(t.context.dataset.csv(), expected);
});

test('Dataset.deleteRow() does nothing when row index does not exist', async t => {
    const dataset = Dataset([Column('letter', ['A'], 'text'), Column('number', [0], 'number')]);
    t.context.dataset.deleteRow(99);
    t.deepEqual(dataset.column('letter').raw(), ['A']);
    t.deepEqual(dataset.column('number').raw(), [0]);
});

test('Dataset.deleteRow() deletes several rows', async t => {
    const dataset = Dataset([
        Column('letter', ['A', 'B', 'C', 'D', 'E'], 'text'),
        Column('number', [0, 1, 2, 3, 4], 'number'),
    ]);
    dataset.deleteRow(4, 2, 0);
    t.deepEqual(dataset.column('letter').raw(), ['B', 'D']);
    t.deepEqual(dataset.column('number').raw(), [1, 3]);
});

test('Dataset.deleteRow() deletes several rows when columns have different lengths', async t => {
    const dataset = Dataset([
        Column('letter', ['A', 'B'], 'text'),
        Column('number', [0, 1, 2, 3], 'number'),
    ]);
    dataset.deleteRow(1, 3);
    t.deepEqual(dataset.column('letter').raw(), ['A']);
    t.deepEqual(dataset.column('number').raw(), [0, 2]);
});

test('Dataset.row(index) returns a row object containing all column values', async t => {
    const dataset = Dataset([Column('foo', ['foo1']), Column('bar', ['bar1'])]);
    t.deepEqual(dataset.row(0), { foo: 'foo1', bar: 'bar1' });
});

test('Dataset.numRows() returns zero when the dataset has no columns', async t => {
    const dataset = Dataset([]);
    t.is(dataset.numRows(), 0);
});

test('Dataset.columnOrder() sorts columns according to given order', async t => {
    const dataset = Dataset([Column('foo', []), Column('bar', []), Column('baz', [])]);
    dataset.columnOrder([2, 0, 1]);
    t.deepEqual(
        dataset.columns().map(column => column.name()),
        ['baz', 'foo', 'bar']
    );
});

test('Dataset.columnOrder() puts columns that do not appear in the order array at the end', async t => {
    const dataset = Dataset([Column('foo', []), Column('bar', []), Column('baz', [])]);
    dataset.columnOrder([
        3, // This is an invalid index, so column 2 doesn't appear here and will be put at the end.
        1,
        0,
    ]);
    t.deepEqual(
        dataset.columns().map(column => column.name()),
        ['bar', 'foo', 'baz']
    );
});

test('Dataset.list() returns an empty list when the dataset has no columns', async t => {
    const dataset = Dataset([]);
    t.deepEqual(dataset.list(), []);
});

test('Dataset.row() returns an empty object when the dataset has no columns', async t => {
    const dataset = Dataset([]);
    t.deepEqual(dataset.row(0), {});
});

test('Dataset.csv() returns an empty string when the dataset has no columns', async t => {
    const dataset = Dataset([]);
    t.deepEqual(dataset.csv(), '');
});
