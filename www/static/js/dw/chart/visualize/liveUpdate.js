/* globals define, _, $, dw */
define(function() {
    /*
     * initializes the
     */
    function init(iframe) {
        var chartWindow = iframe.get(0).contentWindow;
        var chartBody = iframe.get(0).contentDocument;
        var __dw = chartWindow.__dw;
        var needReload = false;

        function $$(sel) {
            return $(sel, chartBody);
        }

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
                if (changed('title') || changed('metadata.describe.hide-title')) {
                    var $title = $$('.chart-title');
                    var $h1 = $title.parent();
                    if (attrs.title && !attrs.metadata.describe['hide-title']) {
                        if (!$title.length) needReload = true;
                        // no title found, reload chart
                        else if ($h1.hasClass('hidden')) {
                            $h1.removeClass('hidden');
                            render = true;
                        }
                    } else {
                        if (!$h1.hasClass('hidden')) {
                            $h1.addClass('hidden');
                            render = true;
                        }
                    }
                    if (!needReload && heightChanged($$('.chart-title'), attrs.title)) render = true;
                }
                if (changed('metadata.describe.intro')) {
                    var $desc = $$('.chart-intro');
                    if (attrs.metadata.describe.intro) {
                        if (!$desc.length) needReload = true;
                        // no title found, reload chart
                        else if ($desc.hasClass('hidden')) {
                            $desc.removeClass('hidden');
                            render = true;
                        }
                    } else {
                        if (!$desc.hasClass('hidden')) {
                            $desc.addClass('hidden');
                            render = true;
                        }
                    }
                    if (!needReload) {
                        if (heightChanged($$('.chart-intro'), attrs.metadata.describe.intro)) render = true;
                    }
                }
                if (changed('metadata.annotate.notes')) {
                    var $notes = $$('.dw-chart-notes');
                    if (attrs.metadata.annotate.notes) {
                        if ($notes.hasClass('hidden')) {
                            $notes.removeClass('hidden');
                            render = true;
                        }
                    } else {
                        if (!$notes.hasClass('hidden')) {
                            $notes.addClass('hidden');
                            render = true;
                        }
                    }
                    if (!needReload) {
                        if (heightChanged($notes, attrs.metadata.annotate.notes)) render = true;
                    }
                }
                if (changed('metadata.describe.source-name') || changed('metadata.describe.source-url')) {
                    $$('.source-block a')
                        .html(attrs.metadata.describe['source-name'])
                        .attr('href', attrs.metadata.describe['source-url'] || '');
                    $$('.source-block')[attrs.metadata.describe['source-name'] ? 'removeClass' : 'addClass']('hidden');
                }
                if (changed('metadata.describe.byline')) {
                    $$('.byline-block .chart-byline').text(attrs.metadata.describe.byline);
                    $$('.byline-block')[attrs.metadata.describe.byline ? 'removeClass' : 'addClass']('hidden');
                }

                __dw.vis.chart().attributes(attrs);
                __dw.old_attrs = $.extend(true, {}, attrs);
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
                function heightChanged(el, html) {
                    var oldHeight = el.height();
                    el.html(dw.utils.purifyHtml(html));
                    return el.height() !== oldHeight;
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
