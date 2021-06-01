import purifyHtml from '@datawrapper/shared/purifyHtml';
import { columnFormatter } from '@datawrapper/shared/columnFormatter';

/**
 * getCellRenderer defines what classes are set on each HOT cell
 */
export default function (app, chart, dataset, Handsontable) {
    const colTypeIcons = {
        date: 'fa fa-clock-o'
    };
    function HtmlCellRender(instance, TD, row, col, prop, value, cellProperties) {
        var escaped = purifyHtml(Handsontable.helper.stringify(value));
        TD.innerHTML = escaped; // this is faster than innerHTML. See: https://github.com/warpech/jquery-handsontable/wiki/JavaScript-&-DOM-performance-tips
    }
    return function (instance, td, row, col, prop, value, cellProperties) {
        if (dataset.numColumns() <= col || !dataset.hasColumn(col)) return;
        const column = dataset.column(col);
        const { searchResults, currentResult, activeColumn } = app.get();
        const colFormat = app.getColumnFormat(column.name());
        row = instance.toPhysicalRow(row);
        if (row > 0) {
            var formatter = columnFormatter(column, chart.get().metadata, column.name());
            value =
                column.val(row - 1) === null || column.val(row - 1) === ''
                    ? '–'
                    : formatter(column.val(row - 1), true);
        }
        if (parseInt(value) < 0) {
            // if row contains negative number
            td.classList.add('negative');
        }
        td.classList.add(column.type() + 'Type');
        td.dataset.column = col;

        if (column.type() === 'text' && value && value.length > 70) {
            value = value.substr(0, 60) + '…';
        }

        if (row === 0) {
            td.classList.add('firstRow');
            if (colTypeIcons[column.type()]) {
                value = '<i class="' + colTypeIcons[column.type()] + '"></i> ' + value;
            }
        } else {
            td.classList.add(row % 2 ? 'oddRow' : 'evenRow');
        }
        if (colFormat.ignore) {
            td.classList.add('ignored');
        }
        if (activeColumn && activeColumn.name() === column.name()) {
            td.classList.add('active');
        }
        const rowPosition = Handsontable.hooks.run(instance, 'modifyRow', row);
        // const rowPosition = row; // instance.getPlugin('columnSorting').untranslateRow(row);
        searchResults.forEach(res => {
            if (res.row === rowPosition && res.col === col) {
                td.classList.add('htSearchResult');
            }
        });
        if (currentResult && currentResult.row === rowPosition && currentResult.col === col) {
            td.classList.add('htCurrentSearchResult');
        }
        if (
            row > 0 &&
            !column.type(true).isValid(column.val(row - 1)) &&
            column.val(row - 1) !== null &&
            column.val(row - 1) !== ''
        ) {
            td.classList.add('parsingError');
        }
        if (row > 0 && (column.val(row - 1) === null || column.val(row - 1) === '')) {
            td.classList.add('noData');
        }
        if (
            column.isComputed &&
            column.errors.length &&
            column.errors.find(err => err.row === 'all' || err.row === row - 1)
        ) {
            td.classList.add('parsingError');
        }
        if (cellProperties.readOnly) td.classList.add('readOnly');

        if (chart.dataCellChanged(col, row)) {
            td.classList.add('changed');
        }
        HtmlCellRender(instance, td, row, col, prop, value, cellProperties);
        // Reflect.apply(HtmlCellRender, this, arguments);
    };
}
