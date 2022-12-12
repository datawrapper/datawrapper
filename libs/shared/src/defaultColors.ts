import chroma from 'chroma-js';
import { Theme } from './themeTypes';
import get from './get';

/**
 * defines colors for the various chart elements like axis text, gridlines,
 * bar background etc. based on the theme background color, and some other optional theme parameters
 *
 * @exports defaultColors
 * @kind function
 *
 * @example
 * // returns {"tickText":{"secondary":"#9d9d9d","primary":"#d9d9d9"},"series":"#f1f1f1","value":"#d9d9d9","axis":"#f1f1f1","gridline":"#707070","fallbackBaseColor":"#f1f1f1"}
 * defaultColors({"colors": {"background": "#333333"}});
 *
 * @example
 * // returns {"tickText":{"secondary":"#ffffff","primary":"#ffffff"},"series":"#ffffff","value":"#fef2e4","axis":"#ffffff","gridline":"#fedeb5","fallbackBaseColor":"#ffffff"}
 * defaultColors({"colors": {"bgBlendRatios": {"gridline": 0.5,"tickText": {"primary": 0,"secondary": 0}},"chartContentBaseColor": "#ffffff","background": "#FCB716"}});

 * @param {*} themeData -- theme data for a chart
 * @returns {*} -- object with color definitions and blendColor function
 */
export function defaultColors(themeData: Theme) {
    const bg = get(themeData, 'colors.background', '#ffffff');
    const fallback = get(
        themeData,
        'colors.chartContentBaseColor',
        chroma.contrast(bg, '#000000') < 5.5 ? '#f1f1f1' : '#333333'
    );

    const darkBG = chroma(bg).luminance() < 0.5;
    const bgBlendRatios = {
        tickText: {
            secondary: get(
                themeData,
                'colors.bgBlendRatios.tickText.secondary',
                darkBG ? 0.6 : 0.4
            ),
            primary: get(themeData, 'colors.bgBlendRatios.tickText.primary', 0.2)
        },
        series: get(themeData, 'colors.bgBlendRatios.series', 0),
        value: get(themeData, 'colors.bgBlendRatios.value', 0.2),
        axis: get(themeData, 'colors.bgBlendRatios.axis', 0),
        gridline: get(themeData, 'colors.bgBlendRatios.gridline', 0.82)
    };

    return {
        tickText: {
            secondary: chroma.mix(fallback, bg, bgBlendRatios.tickText.secondary).hex(),
            primary: chroma.mix(fallback, bg, bgBlendRatios.tickText.primary).hex()
        },

        series: chroma.mix(fallback, bg, bgBlendRatios.series).hex(),

        value: chroma.mix(fallback, bg, bgBlendRatios.value).hex(),

        axis: chroma.mix(fallback, bg, bgBlendRatios.axis).hex(),

        gridline: chroma.mix(fallback, bg, bgBlendRatios.gridline).hex(),

        fallbackBaseColor: fallback,

        blendColor(blendRatio: number) {
            return chroma.mix(fallback, bg, blendRatio).hex();
        }
    };
}
