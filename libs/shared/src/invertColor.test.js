import test from 'ava';
import chroma from 'chroma-js';
import invertColor from './invertColor.js';

test('Finds a new color with the expected contrast ratio to the provided background', t => {
    const newColor = invertColor('hotpink', 'black', 'white', 1);
    const oldContrast = chroma.contrast('hotpink', 'white');
    const newContrast = chroma.contrast(newColor, 'black');
    t.truthy(Math.abs(oldContrast - newContrast) < 0.1, `contrast is not similar enough`);
});

test('Finds a new color with an increased contrast ratio to the provided background', t => {
    const newColor = invertColor('hotpink', 'black', 'white', 0.85);
    const oldContrast = chroma.contrast('hotpink', 'white');
    const newContrast = chroma.contrast(newColor, 'black');
    t.truthy(newContrast - oldContrast > 0.6, `contrast is not increased`);
});

test('gray,green,orange', t => {
    const colors = ['#727272', '#09bb9f', '#fa8c00'];
    const invertedColors = colors.map(color => invertColor(color, '#252525', 'white', 0.85));
    const expected = ['#9d9d9d', '#1e7c64', '#b15112'];
    t.deepEqual(invertedColors, expected);
});

test('blues', t => {
    const colors = ['#00557d', '#007aa4', '#18a1cd', '#58caf8', '#88f5ff'];
    const invertedColors = colors.map(color => invertColor(color, '#252525', 'white', 0.85));
    const expected = ['#94cbfa', '#50a7d3', '#2584af', '#1f628b', '#144a54'];
    t.deepEqual(invertedColors, expected);
});
