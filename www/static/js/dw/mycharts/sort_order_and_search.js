define(function(require) {
    var $ = require('jquery'),
        twig = require('./twig_globals'),
        multiselection = require('./multiselection'),
        no_reload_folder_change = require('./no_reload_folder_change'),
        generic_chart_functions = require('./generic-chart-functions'),
        cft;

    function set_active(sort) {
        $('.sort-menu li:not(.divider)')
            .removeAttr('class')
            .each(function(idx, el) {
                var je = $(el),
                    url = new URL(je.find('a')[0].href);

                if (url.searchParams.get('sort') == sort)
                    je.addClass('active');
            });
    }

    function attatch_functions() {
        $('ul.sort-menu li a')
            .on('click', function(evt) {
                evt.preventDefault();
                var path = $(evt.target)[0].href,
                    params = new URL(path).searchParams,
                    sort = params.get('sort');

                cft.setCurrentSort(sort);
                set_active(sort);
                no_reload_folder_change.reloadLink(path);
            });

    var q = $('.search-query')
        .on('keyup', _.throttle(function() {
            var url = new URL(location.origin + location.pathname + location.search);

            url.searchParams.set('q', q.val().trim());
            no_reload_folder_change.reloadLink(url.toString());
        }, 1000));
    }

    return function() {
        cft = window['ChartFolderTree'];
        attatch_functions();
        set_active();
    };
});
