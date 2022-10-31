import test from 'ava';
import { testProp, fc } from 'ava-fast-check';
import colorLightness from './colorLightness';

test('white lightness is 100', t => {
    t.is(Math.round(colorLightness('#ffffff')), 100);
});

test('hotpink lightness is 58', t => {
    t.is(Math.round(colorLightness('#ff3399')), 58);
});

test('black lightness is 0', t => {
    t.is(Math.round(colorLightness('#000000')), 0);
});

testProp(
    'color lightness within 0 and 100',
    [fc.hexaString({ minLength: 6, maxLength: 6 })],
    (t, a) => {
        const l = colorLightness(`#${a}`);
        t.true(l >= 0);
        t.true(l <= 100);
    }
);
