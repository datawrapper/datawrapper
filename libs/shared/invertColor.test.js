import test from 'ava';
import chroma from 'chroma-js';
import invertColor from './invertColor.cjs';

test('Finds a new color with the expected contrast ratio to the provided background', t => {
    const newColor = invertColor('hotpink', 'black', 'white', 1);
    const oldContrast = chroma.contrast('hotpink', 'white');
    const newContrast = chroma.contrast(newColor, 'black');
    t.truthy(Math.abs(oldContrast - newContrast) < 0.1, `contrast is not similar enough`);
});

test('Finds a new color with an increased contrast ratio to the provided background', t => {
    const newColor = invertColor('hotpink', 'black', 'white', 1.5);
    const oldContrast = chroma.contrast('hotpink', 'white');
    const newContrast = chroma.contrast(newColor, 'black');
    t.truthy(Math.abs(oldContrast * 1.5 - newContrast) < 0.1, `contrast is not similar enough`);
});
