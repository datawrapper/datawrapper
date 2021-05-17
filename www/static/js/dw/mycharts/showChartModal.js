/* global organizationEmbedSettings */

define(function (require) {
    var httpReq = require('../backend/httpReq');

    _.templateSettings = { interpolate: /\[\[(.+?)\]\]/g };
    var chartDetailTpl = _.template($('#mycharts-modal').html());

    return function showChartModal(chart) {
        // open modal
        var chartUrl = '/preview/' + chart.id;
        var meta = chart.metadata,
            bg = meta.publish && meta.publish.background ? meta.publish.background : '#fff',
            chart_w = Math.max(350, Math.min(650, chart.metadata.publish['embed-width'])),
            date_fmt = function (d) {
                d = new Date(d.split(' ')[0]);
                return d.toLocaleDateString(dw.backend.__locale);
            },
            data = {
                chartID: chart.id,
                namespace:
                    (chart.type == 'd3-maps-choropleth' || chart.type == 'd3-maps-symbols') &&
                    chart.metadata.visualize['map-type-set']
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
        $('.close', wrapper).click(function (e) {
            e.preventDefault();
            overlay.close();
        });

        // update form action for duplicate button
        $('.action-duplicate .duplicate', wrapper).click(function (e) {
            e.preventDefault();
            httpReq.post('/v3/charts/' + chart.id + '/copy').then(function (data) {
                window.open('/chart/' + data.id + '/visualize', '_blank');

                require(['dw/mycharts/no_reload_folder_change'], function (api) {
                    api.reloadLink(location.pathname);
                    overlay.close();
                });
            });
        });

        $('.embed', wrapper).click(function (e) {
            e.preventDefault();
            $('.embed-code', wrapper).toggleClass('hidden');
            $('.embed', wrapper).toggleClass('embed-shown');
        });
        $('.btn-edit', wrapper).removeClass('hidden');
        if (!chart.publishedAt) $('.published', wrapper).remove();
        else {
            var embedCodes = chart.metadata.publish['embed-codes'] || {};
            var embedSettings = organizationEmbedSettings[chart.organizationId];
            var preferredEmbed = embedSettings
                ? embedSettings.preferred_embed
                : 'embed-method-responsive';
            // preferred embed to top of list
            var embedCodesTypes = Object.keys(embedCodes).sort(function (a, b) {
                return a.replace('embed-method-', '') === preferredEmbed
                    ? -1
                    : b.replace('embed-method-', '') === preferredEmbed
                    ? 1
                    : 0;
            });
            embedCodesTypes.forEach(function (key, i) {
                var n =
                    key === 'embed-method-custom'
                        ? embedSettings.custom_embed.title
                        : dw.backend.__messages.core[
                              key.replace('embed-method-', 'publish / embed / ')
                          ];
                var label =
                    n +
                    (i === 0
                        ? ' <span style="font-size:85%; color:#adadad"> (' +
                          dw.backend.__messages.core['default'] +
                          ') </span>'
                        : '');
                $('ul.embed-codes', wrapper).append(
                    '<li><a name="' +
                        n +
                        '"href="" data-embed-method="' +
                        key +
                        '">' +
                        label +
                        '</a></li>'
                );
            });
            var timeout;
            $('ul.embed-codes li a', wrapper).click(function (evt) {
                clearTimeout(timeout);
                var key = $(this).data('embed-method');
                var textarea = $('.embed-code-copy', wrapper).val(
                    chart.metadata.publish['embed-codes'][key]
                        .replace(/&#60;/gm, '<')
                        .replace(/&#62;/gm, '>')
                );
                textarea.get(0).select();
                var ok = document.execCommand('copy');
                if (ok) {
                    $('.copy-success', wrapper).removeClass('hidden');
                    var message = dw.backend.__messages.core['copy-success'];
                    $('.copy-success', wrapper).html(
                        dw.utils
                            .purifyHtml(message, '')
                            .replace('%embed-code-type%', '<b>' + evt.currentTarget.name + '</b>')
                    );
                    timeout = setTimeout(function () {
                        $('.copy-success', wrapper).addClass('hidden');
                    }, 3000);
                }
                event.preventDefault();
            });
        }
        if (!chart.forkedFrom) $('.forked', wrapper).remove();
        else {
            $('.forked a', wrapper).click(function (e) {
                // navigate to source chart
                e.preventDefault();
                $.getJSON('/api/2/charts/' + chart.forkedFrom, function (res) {
                    showChartModal(res.data);
                });
            });
        }
        overlay.open();
    };
});
