define(function(require) {
    var $ = require('jquery'),
        twig = require('./twig_globals'),
        multiselection = require('./multiselection'),
        drag_n_drop = require('./drag_n_drop'),
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
        if (tar.attr('id') == 'current-root') {
            var id = link_reader(tar.attr('href')),
                org_tag = (id.org) ? '-' + id.org.replace(' ','-').replace(/[^a-zA-Z0-9-]/g,'') : false;
            if (org_tag) {
                $('#org-root' + org_tag).parent().addClass('active');
            } else {
                $('#user-root').parent().addClass('active');
            }
            return;
        }
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
        var id = link_reader(tar.attr('href')),
            line = $('#folder-sequence'),
            sep = '<span class="sep">›</span>',
            cur_org_name = cft.getOrgNameById(id.org);

        line.empty();
        $('#current-folder-name').empty();
        $('#current-root').attr('href', (id.org) ? '/organization/' + id.org : twig.globals.strings.mycharts_base);
        $('#current-root').text((cur_org_name) ? cur_org_name : twig.globals.strings.mycharts_trans);

        if (!id.folder) return;
        cft.getIdsToFolder(id.folder).forEach(function(id) {
            var a = document.createElement('a'),
                folder = cft.getFolderById(id);

            a.innerText = dw.utils.purifyHtml(folder.name, '');
            a.setAttribute('href', (folder.organization) ? '/organization/' + folder.organization + '/' + folder.id : twig.globals.strings.mycharts_base + '/' + folder.id);
            line.append(sep, a);
        });
        line.append(sep);
        $('#current-folder-name').html(dw.utils.purifyHtml(cft.getFolderById(id.folder).name, ''));
    }

    function reloadLink(path) {
        path += (twig.globals.current.sort) ? '?sort=' + twig.globals.current.sort + '&xhr=1' : '?xhr=1';

        $('.mycharts-chart-list')
            .load(path, function() {
                var tar = $(evt.currentTarget);
                window.history.pushState(null, '', path.slice(0, path.lastIndexOf('xhr=1') - 1));
                set_active_folder(tar);

                repaint_subfolders(tar);
                set_click('ul.subfolders a');

                repaint_breadcrumb(tar);
                set_click('#folder-sequence a');

                multiselection.init();
                drag_n_drop();
            });
    }

    function set_click(selector) {
        $(selector)
            .on('click', function(evt) {
                var path = $(evt.currentTarget).attr('href');
                evt.preventDefault();
                reloadLink(path);
            });
    }

    function init() {
        cft = window['ChartFolderTree'];
        set_click('#current-root');
        set_click('ul.folders-left li a');
        set_click('#folder-sequence a');
        set_click('ul.subfolders a');
    }

    return {
        init: init,
        enable_for_selector: set_click
    };
});
