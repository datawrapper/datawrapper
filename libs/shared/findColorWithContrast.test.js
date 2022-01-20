import test from 'ava';
import chroma from 'chroma-js';

import findColorWithContrast from './findColorWithContrast.cjs';

test('Finds a new color with the expected contrast ratio to the provided background', t => {
    const newColor = findColorWithContrast('hotpink', 'black', 5);
    const contrast = chroma.contrast(newColor, 'black');
    t.truthy(contrast > 4.8, `contrast is too low (${contrast} instead of 5 +/- 0.2)`);
    t.truthy(contrast < 5.2, `contrast is too high (${contrast} instead of 5 +/- 0.2)`);
});
