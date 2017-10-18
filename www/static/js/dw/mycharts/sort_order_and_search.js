define(function(require) {
    var $ = require('jquery'),
        twig = require('./twig_globals'),
        multiselection = require('./multiselection'),
        no_reload_folder_change = require('./no_reload_folder_change'),
        generic_chart_functions = require('./generic-chart-functions'),
        cft;

    function set_active(sort) {
        var activated = true;
        $('.sort-menu li:not(.divider)')
            .each(function(idx, el) {
                var je = $(el),
                    url = new URL(je.find('a')[0].href);

                if (url.searchParams.get('sort') == sort) {
                    if (je.hasClass('active')) {
                        je.removeAttr('class');
                        activated = false;
                    } else {
                        je.addClass('active');
                    }
                } else {
                    je.removeAttr('class');
                }
            });
        return activated;
    }

    function attatch_functions() {
        $('ul.sort-menu li a')
            .on('click', function(evt) {
                evt.preventDefault();
                var url = new URL($(evt.target)[0].href),
                    sort = url.searchParams.get('sort');

                if (set_active(sort))
                    cft.setCurrentSort(sort);
                else {
                    cft.setCurrentSort(false);
                    url.searchParams.delete('sort');
                }
                no_reload_folder_change.reloadLink(url.toString());
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
