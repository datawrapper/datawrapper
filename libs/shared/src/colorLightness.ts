/**
 * Returns the Lab lightness value of a given hexidecimal RGB color.
 *
 * @exports colorLightness
 * @kind function
 *
 * @param {string} hexColor - the RGB color as hexadecimal string, e.g. "#330066"
 * @param chroma - chroma instance
 * @returns {number} - the L*a*b lightness, between 0 (black) and 100 (white)
 *
 * @example
 * import colorLightness from '@datawrapper/shared/colorLightness';
 * colorLightness('#ff3399', chroma) // 57.9
 */

export default function colorLightness(
    hexColor: string,
    chroma: typeof import('chroma-js')
): number {
    return chroma(hexColor).lab()[0];
}
