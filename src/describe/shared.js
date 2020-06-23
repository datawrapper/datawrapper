export function getComputedColumns(chart) {
    let virtualColumns = chart.get('metadata.describe.computed-columns', []);
    if (!Array.isArray(virtualColumns)) {
        // convert to array
        virtualColumns = Object.keys(virtualColumns).reduce((acc, cur) => {
            acc.push({
                name: cur,
                formula: virtualColumns[cur]
            });
            return acc;
        }, []);
    }
    return virtualColumns;
}
