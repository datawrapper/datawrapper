define(function() {
    _.templateSettings = { interpolate: /\[\[(.+?)\]\]/g };
    var chartDetailTpl = _.template($('#mycharts-modal').html());

    return function showChartModal(chart) {
        // open modal
        var meta = chart.metadata,
            bg = meta.publish && meta.publish.background ? meta.publish.background : '#fff',
            chart_w = Math.max(350, Math.min(650, chart.metadata.publish['embed-width'])),
            date_fmt = function(d) {
                d = new Date(d.split(' ')[0]);
                return Globalize.format(d, 'ddd') + ', ' + Globalize.format(d, 'd');
            },
            data = {
                chartID: chart.id,
                namespace:
                    (chart.type == 'd3-maps-choropleth' || chart.type == 'd3-maps-symbols') && chart.metadata.visualize['map-type-set']
                        ? 'map'
                        : 'chart',
                chartUrl: location.protocol + '//' + dw.backend.__domain + '/chart/' + chart.id + '/preview',
                publicUrl: chart.publicUrl,
                src: 'src',
                iframeW: chart_w,
                iframeH: chart.metadata.publish['embed-height'],
                iframeBg: bg,
                wrapperW: chart_w + 260,
                author: chart.author.email ? chart.author.email : chart.author.name,
                createdAt: date_fmt(chart.createdAt),
                publishedAt: chart.publishedAt ? date_fmt(chart.publishedAt) : '—',
                forkedFrom: chart.forkedFrom ? chart.forkedFrom : false
            },
            wrapper = $(chartDetailTpl(data)),
            userId = wrapper.data('is-writable'),
            isGfxEd = wrapper.data('is-gfxed'),
            overlay = wrapper.overlay({
                mask: {
                    opacity: 0.8,
                    color: '#222'
                }
            });
        $('iframe', wrapper).attr('src', data.chartUrl);
        $('.close', wrapper).click(function(e) {
            e.preventDefault();
            overlay.close();
        });

        // update form action for duplicate button
        $('.action-duplicate form', wrapper)
            .attr('action', '/api/charts/' + chart.id + '/copy')
            .on('submit', function() {
                require(['dw/mycharts/no_reload_folder_change'], function(api) {
                    api.reloadLink(location.pathname);
                    overlay.close();
                });
            });

        $('.btn-edit', wrapper).removeClass('hidden');
        if (!chart.publishedAt) $('.published', wrapper).remove();
        else {
            var embedCodes = chart.metadata.publish['embed-codes'] || {};
            Object.keys(embedCodes).forEach(function(key) {
                var n = dw.backend.__messages.core[key.replace('embed-method-', 'publish / embed / ')] || key;
                $('ul.embed-codes', wrapper).append('<li><a href="" data-embed-method="' + key + '">' + n + '</a></li>');
            });
            $('ul.embed-codes li a', wrapper).click(function(evt) {
                var key = $(this).data('embed-method');
                var textarea = $('.embed-code-copy', wrapper).val(chart.metadata.publish['embed-codes'][key]);
                textarea.get(0).select();
                var ok = document.execCommand('copy');
                if (ok) {
                    $('.copy-success', wrapper).removeClass('hidden');
                    setTimeout(function() {
                        $('.copy-success', wrapper).addClass('hidden');
                    }, 3000);
                }
                event.preventDefault();
            });
        }
        if (!chart.forkedFrom) $('.forked', wrapper).remove();
        else {
            $('.forked a', wrapper).click(function(e) {
                // navigate to source chart
                e.preventDefault();
                $.getJSON('/api/2/charts/' + chart.forkedFrom, function(res) {
                    showChartModal(res.data);
                });
            });
        }
        overlay.open();
    };
});
