/* globals dw */

export default function addFilterUI(vis, el, { axisType = 'columns' } = {}) {
    const column = dw.utils.columnNameColumn(vis.axes(true)[axisType]);
    if (column.length > 1) vis.addFilterUI({ column, type: 'auto' });
}
