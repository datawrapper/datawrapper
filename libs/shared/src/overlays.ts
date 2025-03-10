import { rgb } from 'd3-color';
import get from './get.js';
import { Dataset, Overlay } from './chartTypes.js';
import { ThemeData } from './themeTypes.js';

export const ZERO_BASELINE = '--zero-baseline--';

/**
 * Returns the color used by overlays.
 *
 * @exports getOverlayColor
 * @kind function
 *
 * @param {object} overlay
 * @param {object} theme - theme data for a chart
 *
 * @export
 * @returns {string}
 */
export function getOverlayColor(overlay: Overlay, theme: ThemeData): string {
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

/**
 * Returns the overlays column title.
 *
 * @exports getOverlayColumnTitle
 * @kind function
 *
 * @param {object} dataset
 * @param {string} colName
 *
 * @export
 * @returns {string}
 */
export function getOverlayColumnTitle(dataset: Dataset, colName: string): string {
    if (colName === ZERO_BASELINE) {
        return '0';
    } else {
        if (!dataset.hasColumn(colName)) return '';
        return dataset.column(colName).title();
    }
}

/**
 * Returns which column name is used by a value overlay.
 * By default uses the `from` column, but falls back to `to` column
 * if `from` is assigned to zero baseline (in which case `from` is not assigned to any column).
 *
 * @exports getValueOverlayColumnName
 * @kind function
 *
 * @param {object} overlay
 *
 * @export
 * @returns {string}
 */
export function getValueOverlayColumnName(overlay: Overlay) {
    return overlay.from === ZERO_BASELINE ? overlay.to : overlay.from;
}

/**
 * Returns default overlay label if no custom title is specified.
 *
 * @exports getDefaultOverlayLabel
 * @kind function
 *
 * @param {object} overlay
 * @param {object} dataset
 * @param {function} [rangeFormat] - function to format the label for range overlays
 *
 * @export
 * @returns {string}
 */
export function getDefaultOverlayLabel(
    overlay: Overlay,
    dataset: Dataset,
    rangeFormat?: (from: string, to: string) => string
) {
    if (overlay.type === 'value') {
        return getOverlayColumnTitle(dataset, getValueOverlayColumnName(overlay));
    }
    const from = getOverlayColumnTitle(dataset, overlay.from);
    const to = getOverlayColumnTitle(dataset, overlay.to);
    return typeof rangeFormat === 'function' ? rangeFormat(from, to) : `${from} - ${to}`;
}
