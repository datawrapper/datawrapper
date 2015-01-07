
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
                var render = false;
                if (changed('type') || changed('theme') || changed('metadata.data.transpose') || changed('metadata.axes') || changed('language')) {
                    needReload = true;
                    return;
                }
                // check if we need to update chart
                if (changed('metadata.visualize')) {
                    __dw.vis.chart().attributes(attrs);
                    render = true;
                }
                if (changed('title')) {
                    var $title = $$('.chart-title'),
                        $h1 = $title.parent();
                    if (attrs.title) {
                        if (!$title.length) needReload = true; // no title found, reload chart
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
                        if (!$desc.length) needReload = true; // no title found, reload chart
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
                __dw.vis.chart().attributes(attrs);
                __dw.old_attrs = $.extend(true, {}, attrs);

                if (render) __dw.render();

                function changed(key) {
                    var p0 = __dw.old_attrs,
                        p1 = attrs;
                    key = key.split('.');
                    _.each(key, function(k) {
                        p0 = p0[k] || {};
                        p1 = p1[k] || {};
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