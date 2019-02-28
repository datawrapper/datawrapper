export default function(app) {
    return function(evt) {
        const th = this;
        // reset the HoT selection
        // find out which data column we're in
        const k = th.parentNode.children.length;
        let thIndex = -1;
        // (stupid HTMLCollection has no indexOf)
        for (let i = 0; i < k; i++) {
            if (th.parentNode.children.item(i) === th) {
                thIndex = i;
                break;
            }
        }
        // find column index
        const colIndex = +app.refs.hot.querySelector(`.htCore tbody tr:first-child td:nth-child(${thIndex + 1})`).dataset.column;
        const chart = app.store.get('dw_chart');
        const { activeColumn, hot } = app.get();
        if (chart.dataset().hasColumn(colIndex)) {
            const newActive = chart.dataset().column(+colIndex);
            // set active column (or unset if it's already set)
            if (activeColumn && activeColumn.name() === newActive.name()) {
                evt.target.parentNode.classList.remove('selected');
                app.set({ activeColumn: false });
                hot.deselectCell();
            } else {
                evt.target.parentNode.classList.add('selected');
                app.set({ activeColumn: newActive });
            }
        }
    };
}
