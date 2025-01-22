import Chart from '../chart.js';
import Column from '../dataset/column.js';
import Dataset from '../dataset/index.js';
import addComputedColumns from './addComputedColumns.js';
import test from 'ava';

test('addComputedColumns adds a computed column that references an invalid date', async t => {
    const chart = Chart({
        metadata: {
            describe: {
                'computed-columns': {
                    my_computed_column: 'my_date_column',
                },
            },
        },
    });
    const validDate = new Date('2022-01-31');
    const invalidDate = new Date('spam');
    const dataset = Dataset([Column('my_date_column', [validDate, invalidDate], 'date')]);
    const datesetWithComputedColumns = addComputedColumns(chart, dataset);
    t.deepEqual(datesetWithComputedColumns.list(), [
        {
            my_date_column: validDate,
            my_computed_column: '2022-01-31T00:00:00.000Z',
        },
        {
            my_date_column: invalidDate,
            my_computed_column: 'Invalid Date',
        },
    ]);
});

test('addComputedColumns treats null cells in a text column as empty strings', async t => {
    const chart = Chart({
        metadata: {
            describe: {
                'computed-columns': [
                    { name: 'my_computed_column', formula: 'LENGTH my_text_column' },
                ],
            },
        },
    });

    const textContent = 'This is text';

    const dataset = Dataset([Column('my_text_column', [textContent, null], 'text')]);
    const datesetWithComputedColumns = addComputedColumns(chart, dataset);
    t.deepEqual(datesetWithComputedColumns.list(), [
        {
            my_text_column: textContent,
            my_computed_column: textContent.length,
        },
        {
            my_text_column: null,
            my_computed_column: 0,
        },
    ]);
});
