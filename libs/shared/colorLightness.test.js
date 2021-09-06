import test from 'ava';
import colorLightness from './colorLightness.js';

test('white lightness is 100', t => {
    t.is(Math.round(colorLightness('#ffffff')), 100);
});

test('hotpink lightness is 58', t => {
    t.is(Math.round(colorLightness('#ff3399')), 58);
});

test('black lightness is 0', t => {
    t.is(Math.round(colorLightness('#000000')), 0);
});
