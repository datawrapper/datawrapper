import test from 'ava';
import { normalizeAlphaNumKey, normalizeNumKey } from './normalize';

test('alphanum: lowercase keys', t => {
    t.is(normalizeAlphaNumKey('FooBar'), 'foobar');
    t.is(normalizeAlphaNumKey('FOOBAR'), 'foobar');
});

test('alphanum: remove duplicate spaces', t => {
    t.is(normalizeAlphaNumKey('foo bar'), 'foo bar');
    t.is(normalizeAlphaNumKey('foo  bar'), 'foo bar');
});

test('alphanum: normalize spaces', t => {
    t.is(normalizeAlphaNumKey('foo\u2002bar'), 'foo bar');
    t.is(normalizeAlphaNumKey('foo\u205Fbar'), 'foo bar');
});

test('alphanum: remove soft hyphens', t => {
    t.is(normalizeAlphaNumKey('foo\u00ADbar'), 'foobar');
    const key = 'Schles­wig-Holstein';
    // confirm that invisible soft hyphen is in string
    t.not(key, 'Schleswig-Holstein');
    // confirm that we remove it
    t.is(normalizeAlphaNumKey(key), 'schleswig-holstein');
});

test('alphanum: remove duplicate dashes', t => {
    t.is(normalizeAlphaNumKey('foo--bar-baz'), 'foo-bar-baz');
});

test('alphanum: normalize weird dashes', t => {
    t.is(normalizeAlphaNumKey('em—dash'), 'em-dash');
    t.is(normalizeAlphaNumKey('en–dash'), 'en-dash');
    t.is(normalizeAlphaNumKey('horiz―bar'), 'horiz-bar');
    t.is(normalizeAlphaNumKey('fig‒dash'), 'fig-dash');
    t.is(normalizeAlphaNumKey('minus−sign'), 'minus-sign');
    t.is(normalizeAlphaNumKey('normal-dash'), 'normal-dash');
});

test('num: convert string to number', t => {
    t.is(normalizeNumKey('1234'), 1234);
});

test('num: negative numbers', t => {
    t.is(normalizeNumKey('-1234.12'), -1234.12);
});

test('num: zero-padded number', t => {
    t.is(normalizeNumKey('000123'), 123);
    t.is(normalizeNumKey('00012300'), 12300);
});
