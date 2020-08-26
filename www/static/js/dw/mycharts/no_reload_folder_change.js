define(function (require) {
    var $ = require('jquery'),
        twig = require('./twig_globals'),
        multiselection = require('./multiselection'),
        generic_chart_functions = require('./generic-chart-functions'),
        cft;

    function link_reader(link) {
        var parsed = link.split('?')[0].slice(1).split('/'),
            id = {
                org: false,
                folder: false
            };

        switch (parsed[0]) {
            case 'mycharts':
                id.folder = parsed.length > 1 ? parsed[1] : false;
                break;
            case 'team':
                id.org = parsed[1];
                id.folder = parsed.length > 2 ? parsed[2] : false;
                break;
            default:
                return false;
        }

        return id;
    }

    function build_thumbnail(folder, org_id) {
        var li = document.createElement('li'),
            a = document.createElement('a'),
            i = document.createElement('i'),
            span = document.createElement('span');

        li.classList.add('span2');
        li.setAttribute('folder-id', folder.id);
        a.classList.add('thumbnail');
        a.setAttribute(
            'href',
            org_id ? '/team/' + org_id + '/' + folder.id : '/mycharts/' + folder.id
        );
        i.classList.add('im');
        i.classList.add('im-folder');
        i.classList.add('im-fw');
        span.innerText = ' ' + folder.name;
        a.appendChild(i);
        a.appendChild(span);
        li.appendChild(a);
        return li;
    }

    function repaint_subfolders() {
        var id = cft.getCurrentFolder(),
            subfolders = $('ul.subfolders');

        $('ul.subfolders li.span2').not('.add-button').remove();

        if (id.folder) {
            cft.getSubFolders(id.folder).forEach(function (folder) {
                subfolders.prepend(build_thumbnail(folder, id.organization));
            });
        } else {
            cft.getRootSubFolders(id.organization).forEach(function (folder) {
                subfolders.prepend(build_thumbnail(folder, id.organization));
            });
        }
        set_click('ul.subfolders a:not(.add-folder)');
    }

    function repaint_breadcrumb() {
        var id = cft.getCurrentFolder(),
            line = $('#folder-sequence'),
            sep = '<span class="sep">›</span>',
            cur_org_name = cft.getOrgNameById(id.organization);

        line.empty();
        $('#current-folder-name').empty();
        $('#current-root').attr(
            'href',
            id.organization ? '/team/' + id.organization : twig.globals.strings.mycharts_base
        );
        $('#current-root').text(cur_org_name ? cur_org_name : twig.globals.strings.mycharts_trans);

        if (!id.folder) return;
        cft.getIdsToFolder(id.folder).forEach(function (id) {
            var a = document.createElement('a'),
                folder = cft.getFolderById(id);

            a.innerText = dw.utils.purifyHtml(folder.name, '');
            a.setAttribute(
                'href',
                folder.organization
                    ? '/team/' + folder.organization + '/' + folder.id
                    : twig.globals.strings.mycharts_base + '/' + folder.id
            );
            line.append(sep, a);
        });
        line.append(sep);
        $('#current-folder-name').html(dw.utils.purifyHtml(cft.getFolderNameById(id.folder), ''));
        set_click('#folder-sequence a');
    }

    function searchSpecialRender() {
        $('#sort-dropdown').attr('disabled', 'true');
        $('#sort-dropdown').removeAttr('data-toggle');
        $('ul.subfolders').hide();
        $('.gallery hr').hide();
        $('#current-folder > *').not('#current-folder-name').hide();
        $('ul.folders-left li.active').removeClass('active');
        $('#current-folder-name').text(twig.globals.strings.search);
    }

    function normalRepaint() {
        $('#sort-dropdown').removeAttr('disabled');
        $('#sort-dropdown').attr('data-toggle', 'dropdown');
        $('input.search-query').val('');
        $('ul.subfolders').show();
        $('.gallery hr').show();
        $('#current-folder > *').not('#current-folder-name').show();
        repaint_breadcrumb();
        repaint_subfolders();
    }

    function reloadLink(path) {
        var url,
            params,
            sort = cft.getCurrentSort();

        path = path.split('?');
        url = new URL(location.origin + (path.length > 1 ? '?' + path[1] : ''));
        path = path[0];
        params = url.searchParams;

        if (sort && !cft.isSearchActive()) params.set('sort', sort);

        params.set('xhr', 1);
        if (sort != 'type') params.set('no_plugins', '1');

        if (!params.entries().next().done) path += '?' + params.toString();

        var chart_list = $('.mycharts-chart-list')
            .addClass('reloading')
            .load(path, function () {
                var id = link_reader(path);

                window.history.pushState(null, '', path.slice(0, path.lastIndexOf('xhr=1') - 1));

                if (id) cft.setCurrentFolder(id.folder, id.org);

                if (cft.isSearchActive()) searchSpecialRender();
                else normalRepaint();

                set_click('div.pagination li a');
                set_click('.mycharts-chart-list h3:not(.no-charts) a');

                multiselection.init();
                generic_chart_functions();
                cft.updateCurrentFolderFuncs();
                chart_list.removeClass('reloading');
                cft.dndcallback();
            });
    }

    function set_click(selector) {
        $(selector).on('click', function (evt) {
            var path = $(evt.currentTarget).attr('href');
            evt.preventDefault();
            if (!$(evt.currentTarget).hasClass('pagination')) cft.setSearchDisabled();
            reloadLink(path);
        });
    }

    function getId(el) {
        if ($(el).attr('folder-id')) {
            return $(el).attr('folder-id');
        } else {
            return $(el).attr('id');
        }
    }

    function getOrganizationId(el) {
        if ($(el).hasClass('root-folder')) {
            return $(el).attr('id') == 'user-root'
                ? false
                : $(el).attr('id').replace('org-root-', '');
        } else {
            return getOrganizationId($(el).closest('ul').prev());
        }
    }

    function isCollapsed(el) {
        if (window.localStorage.getItem('chart-folder-' + getId(el)) == 'collapsed') {
            return true;
        }

        if (window.localStorage.getItem('chart-folder-' + getId(el)) == 'expanded') {
            return false;
        }

        var orgId = getOrganizationId(el);

        if (!orgId) {
            return false;
        }

        if (window.organizationFolderDefault[orgId] === 'collapsed') {
            return true;
        }

        return false;
    }

    function toggleSubtree() {
        $('li.has-subtree, .root-folder').each(function (index, el) {
            if (isCollapsed(el)) {
                $(this).addClass('subtree-collapsed');
            }
        });

        $('.folders-left li a > .im,.folders-left li .collapse-toggle').click(function (evt) {
            var li = $(evt.currentTarget).parents('li');
            if (li.is('.has-subtree,.root-folder')) {
                evt.preventDefault();
                evt.stopPropagation();
                li.toggleClass('subtree-collapsed');

                var folderId = getId($(this).parent()),
                    isCollapsed = $(this).parent().hasClass('subtree-collapsed');

                window.localStorage.setItem(
                    'chart-folder-' + folderId,
                    isCollapsed ? 'collapsed' : 'expanded'
                );
            }
        });
    }

    function init() {
        cft = window['ChartFolderTree'];
        set_click('#current-root');
        set_click('ul.folders-left li a');
        set_click('#folder-sequence a');
        set_click('ul.subfolders a:not(.add-folder)');
        set_click('div.pagination li a');
        toggleSubtree();
    }

    function reenableClicks() {
        set_click('ul.folders-left li:not(.root-folder) a');
        set_click('#folder-sequence a');
        set_click('ul.subfolders a:not(.add-folder)');
        set_click('div.pagination li a');
        toggleSubtree();
    }

    return {
        init: init,
        enable_for_selector: set_click,
        reloadLink: reloadLink,
        reenableClicks: reenableClicks,
        repaintBreadcrumb: repaint_breadcrumb,
        repaintSubfolders: repaint_subfolders,
        searchSpecialRender: searchSpecialRender
    };
});
