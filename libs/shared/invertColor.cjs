/**
 * Inverts a color to have a similar contrast against an inverted background
 *
 * Accepts color definitions in formats supported by chroma.js
 * (e.g. 'red', '#FF0000', [255, 0, 0])
 *
 * @exports invertColor
 * @kind function
 *
 * @param {string|Array|Object} baseColor - the color to be inverted
 * @param {string|Array|Object} darkBackgroundColor - the inverted background color
 * @param {string|Array|Object} lightBackgroundColor - the original background color
 * @param {number} gamma - gamma exponent for lightness correction
 *
 * @example
 * import invertColor from '@datawrapper/shared/invertColor.cjs';

 * const darkModeColor = invertColor('#ff99gg', 'black', 'white');
 *
 * @export
 * @returns {string} hex color
 */

const chroma = require('chroma-js');

const MAX_ITER = 10;
const EPS = 0.01;

module.exports = function invertColor(
    baseColor,
    darkBackgroundColor,
    lightBackgroundColor,
    gamma = 0.8
) {
    const color = chroma(baseColor);
    const prevL = color.lab()[0];
    const bgLightL = chroma(lightBackgroundColor).lab()[0];
    const bgDarkL = chroma(darkBackgroundColor).lab()[0];

    const contrast = computeContrast(baseColor, lightBackgroundColor);

    // contrast 1:1, return bg
    if (Math.abs(contrast - 1) < EPS) return darkBackgroundColor;

    const origIsDarker = bgLightL > prevL;

    const result = origIsDarker ? test(bgDarkL, 100, MAX_ITER) : test(0, bgDarkL, MAX_ITER);
    // gamma correction
    const resL = result.lab()[0];
    const correctedL = Math.pow(resL / 100, gamma) * 100;
    return result.set('lab.l', correctedL).hex();

    function test(low, high, i) {
        const mid = (low + high) * 0.5;

        const col = chroma(baseColor).set('lab.l', mid);

        const colContrast = computeContrast(darkBackgroundColor, col);
        if (Math.abs(colContrast - contrast) < EPS || !i) {
            // close enough
            return col;
        }

        const colIsLighter = mid > bgDarkL;
        const goodSide = (colIsLighter && origIsDarker) || (!colIsLighter && origIsDarker);
        return (goodSide && colContrast > contrast) || (!goodSide && colContrast < contrast)
            ? test(low, mid, i - 1)
            : test(mid, high, i - 1);
    }
};

function computeContrast(colA, colB) {
    // TODO: maybe find a better contrast computation some day
    // as there are some problems with W3C contrast ratios
    return chroma.contrast(colA, colB);
}
