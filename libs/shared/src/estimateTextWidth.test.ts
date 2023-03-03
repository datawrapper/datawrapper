import test from 'ava';
import estimateTextWidth from './estimateTextWidth';

test('test a few simple strings', t => {
    t.is(estimateTextWidth('a'), 9);
    t.is(estimateTextWidth('aa'), 18);
    t.is(estimateTextWidth('aaa'), 27);
});

test('test a different font size', t => {
    t.is(estimateTextWidth('aa', 7), 9);
});

test('test some more strings', t => {
    t.is(estimateTextWidth('hello world'), 78);
    t.is(estimateTextWidth('1234.56'), 58);
    t.is(estimateTextWidth('1234.56 $'), 71);
});

test('test empty string', t => {
    t.is(estimateTextWidth(''), 0);
});

test('test passing non-strings', t => {
    // Violating type constraints to check handling of incorrect data
    /* eslint-disable @typescript-eslint/no-explicit-any */
    t.is(estimateTextWidth(undefined as any), 0);
    t.is(estimateTextWidth(null as any), 0);
    t.is(estimateTextWidth(false as any), 0);
    /* eslint-enable */
});
