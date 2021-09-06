import { each } from 'underscore';

export default function applyChanges(chart, dataset) {
    const changes = chart.getMetadata('data.changes', []);
    const transpose = chart.getMetadata('data.transpose', false);
    const numRows = dataset.numRows();
    changes.forEach(change => {
        const row = !transpose ? change.row : change.column;
        const column = !transpose ? change.column : change.row;
        if (dataset.hasColumn(column)) {
            change.ignored = false;
            if (row === 0) {
                if (change.previous && change.previous !== 'undefined') {
                    const oldTitle = dataset.column(column).title();
                    if (oldTitle !== change.previous) {
                        // change.ignored = true; // TODO Something is buggy about this, let's revisit later.
                        return;
                    }
                }
                dataset.column(column).title(change.value);
            } else if (row <= numRows) {
                if (change.previous && change.previous !== 'undefined') {
                    const curValue = dataset.column(column).raw(row - 1);
                    if (curValue !== change.previous) {
                        // change.ignored = true; // TODO Something is buggy about this, let's revisit later.
                        return;
                    }
                }
                dataset.column(column).raw(row - 1, change.value);
            }
        }
    });

    // overwrite column types
    var columnFormats = chart.getMetadata('data.column-format', {});
    each(columnFormats, (columnFormat, key) => {
        if (columnFormat.type && dataset.hasColumn(key) && columnFormat.type !== 'auto') {
            dataset.column(key).type(columnFormat.type);
        }
        if (columnFormat['input-format'] && dataset.hasColumn(key)) {
            dataset
                .column(key)
                .type(true)
                .format(columnFormat['input-format']);
        }
    });
    return dataset;
}
