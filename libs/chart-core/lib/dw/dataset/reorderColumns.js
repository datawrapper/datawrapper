function reorderColumns(chart, dataset) {
    const order = chart.getMetadata('data.column-order', []);
    if (order.length && order.length === dataset.numColumns()) {
        dataset.columnOrder(order);
    }
    return dataset;
}

export default reorderColumns;
