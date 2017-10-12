define(function(require) {
    var $ = require('jquery'),
        twig = require('./twig_globals'),
        no_reload_folder_change = require('./no_reload_folder_change'),
        cft;

    function qstring_parser(href, variable) {
        var vars = href.slice(href.lastIndexOf('?') + 1).split('&');

        return vars.reduce(function(old, cur) {
            if (old)
                return old;
            else {
                var pair = cur.split('=');
                return (decodeURIComponent(pair[0]) == variable) ? decodeURIComponent(pair[1]) : old;
            }
        }, false);
    };

    function set_active() {
        $('.sort-menu li:not(.divider)')
            .removeAttr('class')
            .each(function(idx, el) {
                var je = $(el);

                if (qstring_parser(je.find('a').attr('href'), 'sort') == cft.getCurrentSort())
                    je.addClass('active');
            });
    }

    function attatch_functions() {
        $('ul.sort-menu li a')
            .on('click', function(evt) {
                evt.preventDefault();
                var path = window.location.pathname+$(evt.target).attr('href');

                cft.setCurrentSort(qstring_parser(path, 'sort'));
                $('.mycharts-chart-list')
                    .load(path+'&xhr=1', function(){
                        set_active();
                        no_reload_folder_change.enable_for_selector('div.pagination li a');
                    });
                window.history.replaceState({}, '', path);
            });

    var q = $('.search-query')
        .on('keyup', _.throttle(function() {
            var path = window.location.pathname+'?q='+q.val().trim();
            $('.mycharts-chart-list').load(path+'&xhr=1', function() {
                no_reload_folder_change.enable_for_selector('.mycharts-chart-list h3 a');
            });
        }, 1000));
    }

    return function() {
        cft = window['ChartFolderTree'];
        attatch_functions();
        set_active();
    };
});
