import test from 'ava';
import column from './column.js';

const testData = [5.4, 4.2, 4, 3.6, 3.4];

test('basic column api: returns the title', t => {
    const col = column('my title', testData);
    t.is(col.title(), 'my title');
});
