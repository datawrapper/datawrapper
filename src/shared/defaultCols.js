import { interpolateRgb } from 'd3-interpolate';
import chroma from 'chroma-js';

export function defaultCols(theme) {
    const fallback = chroma.contrast(theme.colors.background, '#000000') < 5.5 ? '#f1f1f1' : '#333333';
    const darkBG = chroma(theme.colors.background).luminance() < 0.5;
    return {
        tickText: {
            secondary: interpolateRgb(fallback, theme.colors.background)(darkBG ? 0.6 : 0.4),
            primary: interpolateRgb(fallback, theme.colors.background)(0.2)
        },

        series: fallback,

        value: interpolateRgb(fallback, theme.colors.background)(0.2),

        axis: fallback,

        gridline: interpolateRgb(fallback, theme.colors.background)(0.82),

        fallbackBaseColor: fallback
    };
}
