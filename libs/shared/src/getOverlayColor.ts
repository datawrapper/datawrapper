import { lab, rgb } from 'd3-color';
import get from './get';
import colorLightness from './colorLightness';
import { Overlay } from './chartTypes';
import { Theme } from './themeTypes';

/**
 * returns the color used by overlays
 *
 * @exports getOverlayColor
 * @kind function
 *
 * @param {object} overlay
 * @param {string} baseColor
 * @param {object} theme -- theme data for a chart
 *
 * @export
 * @returns {string}
 */
export = function getOverlayColor(overlay: Overlay, baseColor: string, theme: Theme): string {
    const palette = get(theme, 'colors.palette', []);
    function getColor(c: number | string) {
        if (typeof c === 'number') {
            return palette[c % palette.length];
        }
        return c;
    }

    baseColor = getColor(baseColor).toLowerCase();
    let overlayColor = getColor(overlay.color).toLowerCase();

    if (baseColor === overlayColor) {
        const color = lab(baseColor);
        overlayColor =
            colorLightness(baseColor) < 60
                ? lab(color.l * 1.5, color.a, color.b).hex()
                : lab(color.l * 0.5, color.a, color.b).hex();
    }

    overlayColor = `rgba(${rgb(overlayColor).r},${rgb(overlayColor).g},${
        rgb(overlayColor).b
    }, ${Number(overlay.opacity)})`;

    return overlayColor;
};
