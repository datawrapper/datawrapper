define(function(require) {
    var $ = require('jquery'),
        twig = require('./twig_globals');

    function set_active_folder(tar) {
        $('ul.folders-left li.active').removeAttr('class');
        tar.parent().addClass('active');
    }

    function repaint_subfolders(tar) {
        console.log('subfolder repaint stub');
    }

    function set_click() {
        $('ul.folders-left li a')
            .on('click', function(evt) {
                var path = $(evt.currentTarget).attr('href');
                evt.preventDefault();

                path += (twig.globals.current.sort) ? '?sort=' + twig.globals.current.sort + '&xhr=1' : '?xhr=1';

                $('.mycharts-chart-list')
                    .load(path, function() {
                        var tar = $(evt.currentTarget);
                        window.history.pushState(null, '', path.slice(0, path.lastIndexOf('xhr=1') - 1));
                        set_active_folder(tar);
                        repaint_subfolders(tar);
                    });
            });
    }

    return function() {
        set_click();
    }
});