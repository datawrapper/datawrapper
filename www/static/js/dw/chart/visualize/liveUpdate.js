
define(function() {

    /*
     * initializes the
     */
    function init(iframe) {
        var chart_window = iframe.get(0).contentWindow,
            chart_body = iframe.get(0).contentDocument,
            __dw = chart_window.__dw,
            needReload = false;

        function $$(sel) {
            return $(sel, chart_body);
        }

        _.extend(__dw, {
            attributes: function(attrs) {
                if (changed('type') || changed('theme') || changed('metadata.data.transpose') || changed('metadata.axes')) {
                    needReload = true;
                    return;
                }
                // check if we need to update chart
                if (changed('metadata.visualize')) {
                    __dw.vis.chart().attributes(attrs);
                    __dw.render();
                }
                if (changed('title')) {
                    if (attrs.title && !$$('.chart-title').length) needReload = true;
                    if (!attrs.title && $$('.chart-title').length) needReload = true;
                    if (!needReload && heightChanged($$('.chart-title'), attrs.title)) __dw.render();
                }
                if (changed('metadata.describe.intro')) {
                    if (attrs.metadata.describe.intro && !$$('.chart-intro').length) needReload = true;
                    if (!attrs.metadata.describe.intro && $$('.chart-intro').length) needReload = true;
                    if (!needReload) {
                        if (heightChanged($$('.chart-intro'), attrs.metadata.describe.intro)) __dw.render();
                    }
                }
                if (changed('metadata.describe.source-name') || changed('metadata.describe.source-url')) {
                    if (attrs.metadata.describe['source-name'] && !$$('.source-block').length) needReload = true;
                    if (!attrs.metadata.describe['source-name'] && $$('.source-block').length) needReload = true;
                    if (!needReload) {
                        $$('.source-block').html(
                            ($$('.source-block').data('src') || 'Source:')+' '+
                            (attrs.metadata.describe['source-url'] ?
                            '<a href="'+attrs.metadata.describe['source-url']+'">'+attrs.metadata.describe['source-name']+'</a>' :
                            attrs.metadata.describe['source-name'])
                        );
                    }
                }
                __dw.old_attrs = $.extend(true, {}, attrs);

                function changed(key) {
                    var p0 = __dw.old_attrs,
                        p1 = attrs;
                    key = key.split('.');
                    _.each(key, function(k) {
                        p0 = p0[k];
                        p1 = p1[k];
                    });
                    return JSON.stringify(p0) != JSON.stringify(p1);
                }
                function heightChanged(el, html) {
                    var old_h = el.height();
                    el.html(html);
                    return el.height() != old_h;
                }
            },
            saved: function() {
                if (needReload) {
                    iframe.attr('src', iframe.attr('src').replace(/&random=\d+/, '&random='+_.random(100000)));
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