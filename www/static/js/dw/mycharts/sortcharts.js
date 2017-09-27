define(function(require) {
    var $ = require('jquery'),
        twig = require('./twig_globals'),
        charts,
        chart_data;

    function date_compare(a, b) {
        var d1 = new Date(a),
            d2 = new Date(b);

        return d1 > d2 ? -1 : d1 < d2 ? 1 : 0;
    }

    function gen_sort_func() {
        switch (twig.globals.current.sort) {
            case 'modified_at':
                return function(a, b) {
                    return date_compare(chart_data[$(a).data('id')].lastModifiedAt, chart_data[$(b).data('id')].lastModifiedAt);
                };
            case 'title':
                return function(a, b) {
                    return chart_data[$(a).data('id')].title.localeCompare(chart_data[$(b).data('id')].title);
                }
            case 'created_at':
                return function(a, b) {
                    return date_compare(chart_data[$(a).data('id')].createdAt, chart_data[$(b).data('id')].createdAt);
                }
            case 'published_at':
                return function(a, b) {
                    return date_compare(chart_data[$(a).data('id')].publishedAt, chart_data[$(b).data('id')].publishedAt);
                }
            default:
                if (twig.globals.current.sort !== '')
                    console.error('undefined sorting criterium: ' + twig.globals.current.sort);
                return function() {};
        }
    }

    return function() {
        charts = $('ul.thumbnails').not('.subfolders');
        chart_data = twig.globals.preload.charts;
        charts.each(function(idx, chart_list) {
            $(chart_list).children().sort(gen_sort_func()).appendTo(chart_list);
        });
    };
});
