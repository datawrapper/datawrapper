import _ from 'underscore';

export default function(chart, dataset) {
    var changes = chart.getMetadata('data.changes', []);
    var transpose = chart.getMetadata('data.transpose', false);
    // apply changes
    changes.forEach(change => {
        let row = 'row';
        let column = 'column';
        if (transpose) {
            row = 'column';
            column = 'row';
        }

        if (dataset.hasColumn(change[column])) {
            if (change[row] === 0) {
                if (change.previous) {
                    const oldTitle = dataset.column(change[column]).title();
                    if (oldTitle !== change.previous) return;
                }
                dataset.column(change[column]).title(change.value);
            } else {
                if (change.previous) {
                    const curValue = dataset.column(change[column]).raw(change[row] - 1);
                    if (curValue !== change.previous) return;
                }
                dataset.column(change[column]).raw(change[row] - 1, change.value);
            }
        }
    });

    // overwrite column types
    var columnFormats = chart.getMetadata('data.column-format', {});
    _.each(columnFormats, (columnFormat, key) => {
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
