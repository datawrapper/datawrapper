/* global chart */

define(function (require) {
    var httpReq = require('../backend/httpReq');

    function init(chartUrl) {
        $('.chart-actions .action-duplicate a').click(function (e) {
            e.preventDefault();
            var id = chart.get('id');

            httpReq.post('/v3/charts/' + id + '/copy').then(function (data) {
                window.location.href = '/chart/' + data.id + '/visualize';
            });
        });
    }

    return {
        init: init
    };
});
