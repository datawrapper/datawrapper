import test from 'ava';
import column from '../column.js';

test('make sure text column values get purified', t => {
    const col = column('', ['evil <script>alert(23)</script> text']);
    t.is(col.val(0), 'evil  text');
    t.is(col.values()[0], 'evil  text');
    t.is(col.raw(0), 'evil  text');
    t.is(col.raw()[0], 'evil  text');
});
