define(function(require) {
    var $ = require('jquery'),
        twig = require('./twig_globals'),
        multiselection = require('./multiselection'),
        no_reload_folder_change = require('./no_reload_folder_change'),
        generic_chart_functions = require('./generic-chart-functions'),
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
    }

    function link_reader(link) {
        var parsed = link.slice(1).split('/'),
            id = {
                org: false,
                folder: false
            };

        if (parsed[0] == 'mycharts')
            id.folder = (parsed.length > 1) ? parsed[1] : false;
        else {
            id.org = parsed[1];
            id.folder = (parsed.length > 2) ? parsed[2] : false;
        }

        return id;
    }

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
                var path = window.location.pathname + $(evt.target).attr('href');

                cft.setCurrentSort(qstring_parser(path, 'sort'));
                var chart_list = $('.mycharts-chart-list')
                    .addClass('reloading')
                    .load(path+'&xhr=1', function(){
                        set_active();
                        no_reload_folder_change.enable_for_selector('div.pagination li a');

                        var id = link_reader(path);

                        cft.setCurrentFolder(id.folder, id.org);

                        multiselection.init();
                        generic_chart_functions();
                        cft.updateCurrentFolderFuncs();

                        chart_list.removeClass('reloading');
                    });
                window.history.replaceState({}, '', path);
            });

    var q = $('.search-query')
        .on('keyup', _.throttle(function() {
            var path = window.location.pathname+'?q='+q.val().trim();
            var chart_list = $('.mycharts-chart-list')
                .addClass('reloading')
                .load(path+'&xhr=1', function() {
                    set_active();
                    no_reload_folder_change.enable_for_selector('.mycharts-chart-list h3 a');
                    no_reload_folder_change.enable_for_selector('div.pagination li a');

                    var id = link_reader(path);

                    cft.setCurrentFolder(id.folder, id.org);

                    multiselection.init();
                    generic_chart_functions();
                    cft.updateCurrentFolderFuncs();

                    chart_list.removeClass('reloading');
                });
        }, 1000));
    }

    return function() {
        cft = window['ChartFolderTree'];
        attatch_functions();
        set_active();
    };
});
