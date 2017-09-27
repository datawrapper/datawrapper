define(function(require) {
    var $ = require('jquery'),
        twig = require('./twig_globals'),
        charts,
        chart_data;

    function gen_sort_func() {
        switch (twig.globals.current.sort) {
            case 'modified_at':
                return function(a, b) {
                    console.log(a, b);
                };
            case 'title':
                return function(a, b) {
                    return chart_data[$(a).data('id')].title.localeCompare(chart_data[$(b).data('id')].title);
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
