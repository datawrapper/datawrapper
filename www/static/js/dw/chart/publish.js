/* global chart */

define(function () {
    function init(chartUrl) {
        $('.chart-actions .action-duplicate a').click(function (e) {
            e.preventDefault();
            var id = chart.get('id');

            $.ajax({
                type: 'POST',
                url:
                    window.location.protocol +
                    '//' +
                    dw.backend.__api_domain +
                    '/v3/charts/' +
                    id +
                    '/copy',
                xhrFields: {
                    withCredentials: true
                },
                success: function (data) {
                    window.location.href = '/chart/' + data.id + '/visualize';
                },
                dataType: 'json'
            });
        });
    }

    return {
        init: init
    };
});
