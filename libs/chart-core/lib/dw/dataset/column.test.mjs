import test from 'ava';
import column from './column.mjs';

const testData = '5.4\t4.2\t4\t3.6\t3.4\t4.5'.split('\t');
const col = column('my title', testData);
const col2 = column('my title', ['18661', '18683', '17103', '16401', '16208', '15025']);

test('basic column api: returns the title', t => {
    t.is(col.name(), 'my title');
    t.is(col.title(), 'my title');
});

test('detects column type number', t => {
    t.is(col.type(), 'number');
    t.is(col2.type(), 'number');
});

test('num rows', t => {
    t.is(col.length, 6);
});

test('get values', t => {
    t.is(col.val(0), 5.4);
    t.is(col.val(1), 4.2);
    t.is(col.val(-1), 4.5);
    t.is(col.val(-2), 3.4);
});

test('get raw values', t => {
    t.is(col.raw(0), '5.4');
    t.is(col.raw(1), '4.2');
    t.is(col.raw(2), '4');
});

test('get range', t => {
    t.deepEqual(col.range(), [3.4, 5.4]);
});

test('get total', t => {
    t.is(col.total(), 25.1);
});

test('get string', t => {
    t.is(col.toString(), 'my title (number)');
});

test('column name gets purified', t => {
    const col = column('evil <script>alert(23)</script> text', []);
    t.is(col.name(), 'evil alert(23) text');
});
