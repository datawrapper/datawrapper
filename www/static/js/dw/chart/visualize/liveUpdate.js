/* globals define, _, dw */
define(function() {
    /*
     * initializes the
     */
    function init(iframe) {
        var chartWindow = iframe.get(0).contentWindow;
        var __dw = chartWindow.__dw;
        var needReload = false;

        _.extend(__dw, {
            attributes: function(attrs) {
                var render = false;
                var requiresReload = ['type', 'theme', 'metadata.data.transpose', 'metadata.axes', 'language'];
                var options = dw.backend.currentVis.meta.options;

                for (var name in options) {
                    var o = options[name];

                    if (o['requires-reload']) {
                        requiresReload.push('metadata.visualize.' + name);
                    }

                    if (o.type === 'group') {
                        for (name in o.options) {
                            var o2 = options[name];

                            if (o2['requires-reload']) {
                                requiresReload.push('metadata.visualize.' + name);
                            }
                        }
                    }
                }

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
                    __dw.vis.chart().attributes(attrs);
                    render = true;
                }
                __dw.vis.chart().attributes(attrs);
                __dw.old_attrs = JSON.parse(JSON.stringify(attrs));
                // update dataset to reflect changes
                __dw.vis.chart().load(__dw.params.data);

                if (render) __dw.render();

                function changed(key) {
                    var p0 = __dw.old_attrs;
                    var p1 = attrs;
                    key = key.split('.');
                    _.each(key, function(k) {
                        p0 = p0[k] || {};
                        p1 = p1[k] || {};
                    });
                    return JSON.stringify(p0) !== JSON.stringify(p1);
                }
            },
            saved: function() {
                if (needReload) {
                    iframe.attr('src', iframe.attr('src').replace(/&random=\d+/, '&random=' + _.random(100000)));
                }
            }
        });
    }

    /*
     * updates the chart attributes of a rendered visualization
     * so that is doesn't have to be reloaded.
     */
    function updateChartInIframe(iframe, attributes) {
        var win = iframe.get(0).contentWindow;
        if (win.__dw && win.__dw.attributes) {
            win.__dw.attributes(attributes);
            if (win.__dwUpdate) {
                win.__dwUpdate({ chart: attributes });
            }
        } else {
            setTimeout(function() {
                updateChartInIframe(iframe, attributes);
            }, 100);
        }
    }

    return {
        init: init,
        update: updateChartInIframe
    };
});
