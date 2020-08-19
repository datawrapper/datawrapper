/* global $, define, dw, location */

define(function (require) {
    var httpReq = require('./httpReq');

    return function (chartId, preview, closeCb) {
        httpReq.get('/api/charts/' + chartId).then(function (chart) {
            var chartUrl = preview
                ? location.protocol +
                  '//' +
                  dw.backend.__domain +
                  '/preview/' +
                  chart.id +
                  '?innersvg=1'
                : chart.publicUrl ||
                  location.protocol +
                      '//' +
                      dw.backend.__chartCacheDomain +
                      '/' +
                      chart.id +
                      '/index.html';
            var chartIframe = $(
                '<iframe src="' +
                    chartUrl +
                    '" allowfullscreen webkitallowfullscreen mozallowfullscreen oallowfullscreen msallowfullscreen></iframe>'
            );
            var wrapper = $('<div></div>');
            var overlay = wrapper.overlay({
                onClose: function () {
                    if ($.isFunction(closeCb)) closeCb();
                }
            });
            wrapper.append('<a class="close close-button">&#9747;</a>');
            wrapper.append(chartIframe);

            chartIframe.css({
                width: chart.metadata.publish['embed-width'],
                height: chart.metadata.publish['embed-height'],
                background: chart.metadata.publish.background || '#fff',
                border: '10px solid ' + (chart.metadata.publish.background || '#fff'),
                'border-radius': 10
            });

            overlay.open();
        });
    };
});
