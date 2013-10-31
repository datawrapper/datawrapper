
define(function() {

    return function(chart_id, preview) {

        $.getJSON('/api/charts/'+chart_id, function(res) {
            if (res.status == "ok") {
                var chart = res.data,
                    chartUrl = preview ? location.protocol + '//' + dw.backend.__domain + '/chart/' + chart.id + '/preview' :
                        location.protocol + '//' + dw.backend.__chartCacheDomain + '/' + chart.id + '/index.html';
                    chartIframe = $('<iframe src="'+chartUrl+'" allowfullscreen webkitallowfullscreen mozallowfullscreen oallowfullscreen msallowfullscreen></iframe>'),
                    wrapper = $('<div></div>'),
                    overlay = wrapper.overlay({
                        onClose: function() { location.hash = ''; }
                    });
                wrapper.append('<a class="close close-button">&#9747;</a>');
                wrapper.append(chartIframe);

                chartIframe.css({
                    width: chart.metadata.publish['embed-width'],
                    height: chart.metadata.publish['embed-height'],
                    background: (chart.metadata.publish['background'] || '#fff'),
                    border: '10px solid '+(chart.metadata.publish['background'] || '#fff'),
                    'border-radius': 10
                });

                overlay.open();
                if (location.hash != '#/' + chart.id) {
                    location.hash = '#/' + chart.id;
                }
            }
        });
    };

});