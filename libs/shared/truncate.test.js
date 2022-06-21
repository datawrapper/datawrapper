import test from 'ava';
import { testProp, fc } from 'ava-fast-check';
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

testProp(
    'truncate random strings',
    [fc.lorem(), fc.nat({ max: 10 }), fc.nat({ max: 10 })],
    (t, text, start, end) => {
        const truncated = truncate(text, start, end);
        t.is(typeof truncated, 'string');
        t.true(truncated.length <= text.length);
        if (text.length >= start + end + 3) {
            // needs truncating
            t.true(truncated.includes('…'));
            t.true(truncated.length < text.length);
            t.true(truncated.length <= start + end + 1);
        } else {
            t.is(text, truncated);
        }
    }
);

testProp('truncate random strings at end', [fc.lorem(), fc.nat({ max: 10 })], (t, text, start) => {
    const truncated = truncate(text, start, 0);
    t.is(typeof truncated, 'string');
    t.true(truncated.length <= text.length);
    if (text.length >= start + 3) {
        // needs truncating
        t.true(truncated.endsWith('…'));
        t.true(truncated.length <= start + 1);
    } else {
        t.is(text, truncated);
    }
});

testProp(
    'truncate random strings at beginning',
    [fc.lorem(), fc.nat({ max: 10 })],
    (t, text, end) => {
        const truncated = truncate(text, 0, end);
        t.is(typeof truncated, 'string');
        t.true(truncated.length <= text.length);
        if (text.length >= end + 3) {
            // needs truncating
            t.true(truncated.startsWith('…'));
            t.true(truncated.length <= end + 1);
        } else {
            t.is(text, truncated);
        }
    }
);
