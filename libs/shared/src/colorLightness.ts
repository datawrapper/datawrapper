// We have to use `const ... = require` syntax here because there are no type definitions for this path
// eslint-disable-next-line @typescript-eslint/no-var-requires
const hex2rgb = require('chroma-js/src/io/hex/hex2rgb.js');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const rgb2lab = require('chroma-js/src/io/lab/rgb2lab.js');

/**
 * Returns the Lab lightness value of a given hexidecimal
 * RGB color. Uses chroma-js to convert from Hex to Lab, but
 * only adds a few hundreds bytes to your build.
 *
 * To use this function, you have to manually install chroma-js using
 * `npm install chroma-js`.
 *
 * @exports colorLightness
 * @kind function
 *
 * @param {string} hexColor - the RGB color as hexadecimal string, e.g. "#330066"
 * @returns {number} - the L*a*b lightness, between 0 (black) and 100 (white)
 *
 * @example
 * import colorLightness from '@datawrapper/shared/colorLightness';
 * colorLightness('#ff3399') // 57.9
 */
export = function colorLightness(hexColor: string): number {
    return rgb2lab(hex2rgb(hexColor))[0];
};
