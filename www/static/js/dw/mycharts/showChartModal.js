define(function() {
    _.templateSettings = { interpolate: /\[\[(.+?)\]\]/g };
    var chartDetailTpl = _.template($('#mycharts-modal').html());

    return function showChartModal(chart) {
        // open modal
        var chartUrl = '/preview/' + chart.id;
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
                chartUrl: location.protocol + '//' + dw.backend.__domain + chartUrl,
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
        $('.action-duplicate .duplicate', wrapper)
            .click(function() {
                $.ajax({
                    type: "POST",
                    url: window.location.protocol + '//' + window.dw.backend.__api_domain + '/v3/charts/'+chart.id+'/copy',
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function(data) {
                        window.open('/chart/' + data.id + '/visualize', '_blank');

                        require(['dw/mycharts/no_reload_folder_change'], function(api) {
                            api.reloadLink(location.pathname);
                            overlay.close();
                        });
                    },
                    dataType: 'json'
                });
            });

        $('.embed', wrapper).click(function(e) {
            e.preventDefault();
            $('.embed-code', wrapper).toggleClass('hidden');
            $('.embed', wrapper).toggleClass('embed-shown');
        });
        $('.btn-edit', wrapper).removeClass('hidden');
        if (!chart.publishedAt) $('.published', wrapper).remove();
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
