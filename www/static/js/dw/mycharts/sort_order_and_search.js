define(function(require) {
    var $ = require('jquery'),
        twig = require('./twig_globals'),
        qstring_parser = require('./qstring_parser');

    function set_active() {
        $('.sort-menu li')
            .removeAttr('class')
            .each(function(idx, el) {
                var je = $(el);

                if (qstring_parser(je.find('a').attr('href'), 'sort') == twig.globals.current.sort)
                    je.addClass('active');
            });
    }

    function attatch_functions() {
        $('ul.sort-menu li a')
            .on('click', function(evt) {
                evt.preventDefault();
                var path = window.location.pathname+$(evt.target).attr('href');

                twig.globals.current.sort = qstring_parser(path, 'sort');
                $('.mycharts-chart-list')
                    .load(path+'&xhr=1', set_active);
                window.history.replaceState({}, '', path);
            });

    var q = $('.search-query')
        .on('keyup', _.throttle(function() {
            var path = window.location.pathname+'?q='+q.val().trim();
            $('.mycharts-chart-list').load(path+'&xhr=1');
        }, 1000));
    }

    return function() {
        attatch_functions();
        set_active();
    };
});
