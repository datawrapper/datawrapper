export default function(chart, dataset) {
    var order = chart.getMetadata('data.column-order', []);
    if (order.length && order.length === dataset.numColumns()) {
        dataset.columnOrder(order);
    }
    return dataset;
}
