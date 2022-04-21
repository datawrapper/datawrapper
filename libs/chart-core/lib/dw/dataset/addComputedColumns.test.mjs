import Chart from '../chart.mjs';
import Column from '../dataset/column.mjs';
import Dataset from '../dataset/index.mjs';
import addComputedColumns from './addComputedColumns.mjs';
import test from 'ava';

test('addComputedColumns adds a computed column that references an invalid date', async t => {
    const chart = Chart({
        metadata: {
            describe: {
                'computed-columns': {
                    my_computed_column: 'my_date_column'
                }
            }
        }
    });
    const validDate = new Date('2022-01-31');
    const invalidDate = new Date('spam');
    const dataset = Dataset([Column('my_date_column', [validDate, invalidDate], 'date')]);
    const datesetWithComputedColumns = addComputedColumns(chart, dataset);
    t.deepEqual(datesetWithComputedColumns.list(), [
        {
            my_date_column: validDate,
            my_computed_column: '2022-01-31T00:00:00.000Z'
        },
        {
            my_date_column: invalidDate,
            my_computed_column: 'Invalid Date'
        }
    ]);
});
