define(function(require) {
    var $ = require('jquery'),
        twig = require('./twig_globals'),
        qstring_parser = require('./qstring_parser');

    function set_active_sort() {
        $('.sort-menu li')
            .removeAttr('class')
            .each(function(idx, el) {
                var je = $(el);

                if (qstring_parser(je.find('a').attr('href'), 'sort') == twig.globals.current.sort)
                    je.addClass('active');
            });
    }

    return function() {
        set_active_sort();
    };
});
