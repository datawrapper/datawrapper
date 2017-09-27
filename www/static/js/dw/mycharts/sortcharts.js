define(function(require) {
    var $ = require('jquery'),
        twig = require('./twig_globals'),
        charts,
        chart_data,
        links_dead = false;

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
                if (twig.globals.current.sort !== null)
                    console.error('undefined sorting criterium: ' + twig.globals.current.sort);
                return function() {};
        }
    }

    function sort_charts() {
        charts.each(function(idx, chart_list) {
            $(chart_list).children().sort(gen_sort_func()).appendTo(chart_list);
        });
    }

    function getQueryVariable(href, variable) {
        var vars = href.slice(href.lastIndexOf('?') + 1).split('&');

        return vars.reduce(function(old, cur) {
            if (old)
                return old;
            else {
                var pair = cur.split('=');

                if (decodeURIComponent(pair[0]) == variable) {
                    return(decodeURIComponent(pair[1]));
                }
                return old;
            }
        }, false);
    }

    function no_reload_sort_click(e) {
        var tar = e.target;

        e.preventDefault();
        history.replaceState(null, "Sorted Charts", tar.href);
        twig.globals.current.sort = getQueryVariable(tar.href, 'sort');

        sort_charts();
    }

    return function() {
        charts = $('ul.thumbnails').not('.subfolders');
        chart_data = twig.globals.preload.charts;
        sort_charts();

        if (!links_dead) {
            $('.sort-menu a').click(no_reload_sort_click);
            links_dead = true;
        }
    };
});
