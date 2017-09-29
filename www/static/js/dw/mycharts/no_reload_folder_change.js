define(function(require) {
    var $ = require('jquery'),
        twig = require('./twig_globals');

    function set_click() {
        $('ul.folders-left li a')
            .on('click', function(evt) {
                var path = $(evt.currentTarget).attr('href');
                evt.preventDefault();

                console.log(evt);

                path += (twig.globals.current.sort) ? '?sort=' + twig.globals.current.sort + '&xhr=1' : '?xhr=1';

                $('.mycharts-chart-list')
                    .load(path);

                window.history.pushState(null, '', path.slice(0, path.lastIndexOf('xhr=1') - 1));
            });
    }

    return function() {
        set_click();
    }
});