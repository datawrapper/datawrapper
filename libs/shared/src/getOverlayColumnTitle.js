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

export default function defaultOverlayTitle(vis, colName, ZERO_BASELINE) {
    if (colName === ZERO_BASELINE) {
        return '0';
    } else {
        if (!vis.dataset.hasColumn(colName)) return '';
        return vis.dataset.column(colName).title();
    }
}
