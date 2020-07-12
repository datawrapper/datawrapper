
define(function() {

    function init(chartUrl) {
        $('.chart-actions .action-duplicate a').click(function(e) {
            e.preventDefault();
            var id = chart.get('id');
            $.ajax({
                url: '/api/charts/'+id+'/copy',
                type: 'POST',
                success: function(data) {
                    if (data.status == "ok") {
                        // redirect to copied chart
                        var type = ((dw.backend.currentChart.get('type') == "d3-maps-choropleth" ||
                            dw.backend.currentChart.get('type') == 'd3-maps-symbols') &&
                            dw.backend.currentChart.get('metadata.visualize.map-type-set') !== undefined) ?
                            "map" : "chart";
                        window.location.href = '/' + type + '/'+data.data.id+'/visualize';
                    } else {
                        dw.backend.logMessage(data.message, 'div > .chart-actions', 'warning');
                        console.warn(data);
                    }
                }
            });
        });

    }

    return {
        init: init
    };

});
