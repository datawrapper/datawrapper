/**
 * Find an alternative color to a provided color with a specific contast
 * ratio between the provided color and a background color. Used for
 * automatically finding suitable substitute colors in dark mode.
 *
 * Accepts color definitions in formats supported by chroma.js
 * (e.g. 'red', '#FF0000', [255, 0, 0])
 *
 * @exports findColorWithContrast
 * @kind function
 *
 * @param {string|Array|Object} baseColor - the color to be substituted
 * @param {string|Array|Object} backgroundColor - the color to be contrasted with the substitute
 * @param {number} contrast - the WCAG contrast ratio (e.g. 4.5 would be a ratio of 4.5:1)
 *
 * @example
 * import findColorWithContrast from '@datawrapper/shared/findColorWithContrast';
 * // or import {findColorWithContrast} from '@datawrapper/shared';
 * const darkModeColor = findColorWithContrast('#', 'black',);
 *
 * @export
 * @returns {Object} chroma.js color object
 */

const chroma = require('chroma-js');

const MAX_ITER = 10;
const EPS = 0.2;

module.exports = function findColorWithContrast(baseColor, backgroundColor, contrast) {
    const color = chroma(baseColor);
    const prevL = color.lab()[0];
    const curC = chroma.contrast(color, backgroundColor);
    return curC < contrast ? test(prevL, 100, MAX_ITER) : test(0, prevL, MAX_ITER);

    function test(low, high, i) {
        const mid = (low + high) * 0.5;
        const col = chroma(baseColor).set('lab.l', mid);
        const colContrast = chroma.contrast(backgroundColor, col);
        if (Math.abs(colContrast - contrast) < EPS || !i) {
            // close enough
            return col;
        }
        return colContrast > contrast ? test(low, mid, i - 1) : test(mid, high, i - 1);
    }
};
