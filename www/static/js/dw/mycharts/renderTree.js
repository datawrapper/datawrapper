define(function (require) {
    var cft,
        twig = require('./twig_globals');

    function getOrgTag(org_id) {
        return org_id ? '-' + org_id.replace(' ', '-').replace(/[^a-zA-Z0-9-]/g, '') : '';
    }

    function genHref(org_id, folder_id) {
        return (
            (org_id ? '/team/' + org_id + '/' : twig.globals.strings.mycharts_base + '/') +
            folder_id
        );
    }

    function changeChartCount(folder_id, org_id, chart_count) {
        var folder = folder_id
            ? $('ul.folders-left li[folder-id="' + folder_id + '"]')
            : $(org_id ? '#org-root' + getOrgTag(org_id) : '#user-root');

        folder.find('span.chart-count').remove();

        if (chart_count > 0)
            folder.find('span').append('<span class="chart-count">(' + chart_count + ')</span>');
    }

    function changeActiveFolder(folder_id, org_id) {
        $('ul.folders-left li.active').removeClass('active');
        if (folder_id) {
            $('ul.folders-left li[folder-id="' + folder_id + '"]').addClass('active');
        } else {
            var tag = org_id ? '#org-root' + getOrgTag(org_id) : '#user-root';
            $(tag).addClass('active');
        }
    }

    function renderSubtree(org_id, tree) {
        var tag = '#dynamic-tree' + getOrgTag(org_id),
            folder_icon_open = '<i class="im im-folder-open"></i>',
            folder_icon_closed = '<i class="im im-folder"></i>';

        function traverse(parent, subtree) {
            subtree.forEach(function (folder) {
                var li = $(
                    '<li folder-id="' +
                        folder.id +
                        '">\n<div class="collapse-toggle"></div>\n<a href="' +
                        genHref(org_id, folder.id) +
                        '">\n' +
                        folder_icon_open +
                        folder_icon_closed +
                        '\n<span>' +
                        dw.utils.purifyHtml(folder.name, '') +
                        (folder.charts > 0
                            ? '<span class="chart-count">(' + folder.charts + ')</span>'
                            : '') +
                        '</span>\n</a>\n</li>'
                ).appendTo(parent);
                if (folder.sub) {
                    li.addClass('has-subtree');
                    var nu_par = document.createElement('ul');
                    parent.append(nu_par);
                    traverse($(nu_par), folder.sub);
                }
            });
        }
        $(tag).empty();
        traverse($(tag), tree);
    }

    return function () {
        cft = window['ChartFolderTree'];
        cft.setRenderCallbacks({
            changeChartCount: changeChartCount,
            changeActiveFolder: changeActiveFolder,
            renderSubtree: renderSubtree
        });
        cft.reRenderTree();

        console.log('post render tree');
    };
});
