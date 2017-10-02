define(function(require) {
    var $ = require('jquery'),
        twig = require('./twig_globals'),
        cft;

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

    function build_thumbnail(folder, org_id) {
        var li = document.createElement('li'),
            a = document.createElement('a'),
            i = document.createElement('i'),
            span = document.createElement('span');

        li.classList.add('span2');
        a.classList.add('thumbnail');
        a.setAttribute('href', (org_id) ? '/organization/' + org_id + '/' + folder.id : '/mycharts/' + folder.id);
        i.classList.add('im');
        i.classList.add('im-folder');
        i.classList.add('im-fw');
        span.innerText = ' ' + folder.name;
        a.appendChild(i);
        a.appendChild(span);
        li.appendChild(a);
        return li;
    }

    function set_active_folder(tar) {
        $('ul.folders-left li.active').removeAttr('class');
        tar.parent().addClass('active');
    }

    function repaint_subfolders(tar) {
        var id = link_reader(tar.attr('href'));

        $('ul.subfolders li.span2').not('.add-button').remove();
        subfolders = $('ul.subfolders');

        if (id.folder) {
            cft.getSubFolders(id.folder).forEach(function(folder) {
                subfolders.prepend(build_thumbnail(folder, id.org));
            });
        } else {
            cft.getRootSubFolders(id.org).forEach(function(folder) {
                subfolders.prepend(build_thumbnail(folder, id.org));
            });
        }

    }

    function repaint_breadcrumb(tar) {
        console.log('repaint_breadcrumb_stub');
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
        cft = window['ChartFolderTree'];
        set_click();
    }
});
