define(function(require) {
    var $ = require('jquery'),
        twig = require('./twig_globals'),
        qstring_parser = require('./qstring_parser');

    function set_active(type) {
        $('.' + type + '-menu li')
            .removeAttr('class')
            .each(function(idx, el) {
                var je = $(el);

                if (qstring_parser(je.find('a').attr('href'), type) == twig.globals.current[type])
                    je.addClass('active');
            });
    }

    return function() {
        set_active('sort');
        set_active('group');
    };
});
