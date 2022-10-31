import { Visualization } from './chartTypes';

/**
 * returns the overlays column title
 *
 * @exports defaultOverlayTitle
 * @kind function
 *
 * @param {object} vis
 * @param {string} colName
 *
 * @export
 * @returns {string}
 */
export = function defaultOverlayTitle(
    vis: Visualization,
    colName: string,
    ZERO_BASELINE: string
): string {
    if (colName === ZERO_BASELINE) {
        return '0';
    } else {
        if (!vis.dataset.hasColumn(colName)) return '';
        return vis.dataset.column(colName).title();
    }
};
