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

import { lab, rgb } from 'd3-color';
import get from 'lodash-es/get.js';
import colorLightness from './colorLightness.js';

export default function getOverlayColor(overlay, baseColor, theme) {
    function getColor(c) {
        return typeof c === 'number' ? get(theme, 'colors.palette')[c] : c;
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
}
