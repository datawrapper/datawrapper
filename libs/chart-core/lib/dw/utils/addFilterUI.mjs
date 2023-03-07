/* globals dw */

export default function (vis, el, { axisType = 'columns' } = {}) {
    const column = dw.utils.columnNameColumn(vis.axes(true)[axisType]);
    vis.addFilterUI({ column, type: 'auto' });
}
