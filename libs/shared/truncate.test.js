import test from 'ava';
import truncate from './truncate.js';

test('truncate very long string', t => {
    t.is(truncate('This is a very very long string'), 'This is a v…string');
});

test('dont truncate short strings', t => {
    t.is(truncate('Short enough'), 'Short enough');
});

test('unless we want to', t => {
    t.is(truncate('Short enough', 3, 3), 'Sho…ugh');
});

test('dont truncate non-strings', t => {
    t.is(truncate(42), 42);
});
