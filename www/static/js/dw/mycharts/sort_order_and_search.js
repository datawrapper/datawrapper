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
            var base_url = new URL(location.origin + location.pathname + location.search),
                search_url = new URL(location.origin + '/search' + location.search),
                query = q.val().trim();

            if (query !== '') {
                cft.setSearchActive(base_url, query);
                set_active(cft.getCurrentSort());
                search_url.searchParams.delete('sort');
                search_url.searchParams.set('q', query);
                no_reload_folder_change.reloadLink(search_url.toString());
            } else if (cft.isSearchActive()) {
                base_url = cft.getSearchParams().base_url.toString();
                cft.setSearchDisabled()
                no_reload_folder_change.reloadLink(base_url.slice(location.origin.length));
            }
        }, 1000));
    }

    return function() {
        cft = window['ChartFolderTree'];
        if (location.pathname.startsWith('/search'))
            no_reload_folder_change.searchSpecialRender();
        attatch_functions();
        set_active();
    };
});
