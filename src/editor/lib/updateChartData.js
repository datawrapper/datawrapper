function updateChartData({ iframe, data, callback }) {
    const win = iframe.contentWindow;

    if (!win.__dw || !win.__dw.vis) {
        // iframe is not ready yet, try again in 100ms
        setTimeout(() => {
            updateChartData({ iframe, data, callback });
        }, 100);
        return false;
    }

    let render = false;
    let needReload = false; // TODO check if column configuration changed

    if (data !== win.__dw.params.data) {
        // render = true;
    }

    if (needReload) {
        setTimeout(() => {
            win.location.reload();
        }, 1000);
        return;
    }

    // update dataset to reflect changes
    win.__dw.params.data = data;

    if (render) {
        win.__dw.vis.chart().load(win.__dw.params.data);
        win.__dw.render();
    }

    if (callback) callback();
}

export default updateChartData;
