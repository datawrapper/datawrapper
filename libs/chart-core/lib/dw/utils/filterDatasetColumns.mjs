export default function (chart, dataset) {
    if (!dataset.filterColumns) return dataset;

    const columnFormat = chart.getMetadata('data.column-format', {});
    const ignore = Object.fromEntries(
        Object.entries(columnFormat).map(([key, format]) => [key, !!format.ignore])
    );
    dataset.filterColumns(ignore);
    return dataset;
}
