/* globals dw, $, _ */

function updateChartAttributes({ iframe, attrs, forceRender = false, callback }) {
    const win = iframe.contentWindow;

    if (!win.__dw || !win.__dw.vis) {
        // iframe is not ready yet, try again in 100ms
        setTimeout(() => {
            updateChartAttributes({ iframe, attrs, forceRender, callback });
        }, 100);
        return false;
    }

    let render = forceRender;
    let needReload = false;

    const requiresReload = ['type', 'theme', 'metadata.data.transpose', 'metadata.axes'];

    requiresReload.forEach(function(key) {
        if (changed(key)) {
            needReload = true;
        }
    });

    if (
        changed('metadata.data.column-format') ||
        changed('metadata.data.changes') ||
        changed('metadata.data.column-order') ||
        changed('metadata.describe.computed-columns')
    ) {
        needReload = true;
        return;
    }

    // check if we need to update chart
    if (changed('metadata.visualize')) {
        // win.__dw.vis.chart().attributes(attrs);
        render = true;
    }

    if (needReload) {
        setTimeout(() => {
            win.location.reload();
        }, 1000);
        return;
    }

    // make a copy
    attrs = JSON.parse(JSON.stringify(attrs));

    win.__dw.vis.chart().attributes(attrs);
    win.__dw.old_attrs = $.extend(true, {}, attrs);
    // update dataset to reflect changes
    win.__dw.vis.chart().load(win.__dw.params.data);

    if (render) win.__dw.render();

    if (callback) callback();

    function changed(key) {
        if (!win.__dw) return false;
        var p0 = win.__dw.old_attrs || {};
        var p1 = attrs;
        key = key.split('.');
        _.each(key, function(k) {
            p0 = p0[k] || {};
            p1 = p1[k] || {};
        });
        return JSON.stringify(p0) !== JSON.stringify(p1);
    }
}

export default updateChartAttributes;
