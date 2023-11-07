import { rgb } from 'd3-color';
import get from './get.js';
import { Overlay } from './chartTypes.js';
import { ThemeData } from './themeTypes.js';

/**
 * returns the color used by overlays
 *
 * @exports getOverlayColor
 * @kind function
 *
 * @param {object} overlay
 * @param {object} theme -- theme data for a chart
 *
 * @export
 * @returns {string}
 */
export default function getOverlayColor(overlay: Overlay, theme: ThemeData): string {
    const palette = get(theme, 'colors.palette', []);
    function getColor(c: number | string) {
        if (typeof c === 'number') {
            return palette[c % palette.length];
        }
        return c;
    }

    let overlayColor = getColor(overlay.color).toLowerCase();

    overlayColor = `rgba(${rgb(overlayColor).r},${rgb(overlayColor).g},${
        rgb(overlayColor).b
    }, ${Number(overlay.opacity)})`;

    return overlayColor;
}
