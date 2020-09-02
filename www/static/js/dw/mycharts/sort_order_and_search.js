define(function (require) {
    var $ = require('jquery'),
        no_reload_folder_change = require('./no_reload_folder_change'),
        cft;

    function set_active(sort) {
        var activated = true;
        $('.sort-menu li:not(.divider)').each(function (idx, el) {
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
        $('ul.sort-menu li a').on('click', function (evt) {
            evt.preventDefault();
            var url = new URL($(evt.target)[0].href),
                sort = url.searchParams.get('sort');

            if (set_active(sort)) cft.setCurrentSort(sort);
            else {
                cft.setCurrentSort(false);
                url.searchParams.delete('sort');
            }
            no_reload_folder_change.reloadLink(url.toString());
        });

        var last_query = '';

        $('.mycharts-search-wrapper .im-x-mark-circle').click(function () {
            var base_url = cft.getSearchParams().base_url;
            cft.setSearchDisabled();
            if (!base_url) {
                no_reload_folder_change.reloadLink('/mycharts');
            } else {
                no_reload_folder_change.reloadLink(
                    base_url.toString().slice(location.origin.length)
                );
            }
        });

        var q = $('.search-query').on(
            'keyup',
            _.debounce(function () {
                var base_url = new URL(location.origin + location.pathname + location.search),
                    search_url = new URL(location.origin + '/search' + location.search),
                    query = q.val().trim().toLowerCase();

                if (query == last_query) {
                    // no need to fire enother request!
                    return;
                }
                last_query = query;
                $('body')[query ? 'addClass' : 'removeClass']('mycharts-search-results');

                if (query !== '') {
                    cft.setSearchActive(base_url, query);
                    set_active(cft.getCurrentSort());
                    search_url.searchParams.delete('sort');
                    search_url.searchParams.set('q', query);
                    no_reload_folder_change.reloadLink(search_url.toString());
                } else if (cft.isSearchActive()) {
                    base_url = cft.getSearchParams().base_url.toString();
                    cft.setSearchDisabled();
                    no_reload_folder_change.reloadLink(base_url.slice(location.origin.length));
                }
            }, 600)
        );
    }

    return function () {
        cft = window['ChartFolderTree'];
        if (location.pathname.startsWith('/search')) {
            $('body').addClass('mycharts-search-results');
            no_reload_folder_change.searchSpecialRender();
        }
        attatch_functions();
        set_active();
    };
});
