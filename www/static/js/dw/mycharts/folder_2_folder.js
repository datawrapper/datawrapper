define(function(require) {
    var $ = require('jquery'),
        twig = require('./twig_globals'),
        handler = require('./handler');

    function move_to_folder_helper(folder_id, org_id) {
        return function(e) {
            var current_folder = $('#current-folder').data('folder_id');
            e.preventDefault();

            $.ajax({
                url: '/api/folders/' + current_folder,
                type: 'PUT',
                processData: false,
                contentType: "application/json",
                data: JSON.stringify({ parent: folder_id, organization: org_id }),
                dataType: 'JSON'
            }).done(function(res) {
                if (res.status == 'error') {
                    alert(res.message);
                } else if (res.status == 'ok') {
                    // page reload would be an error - follow new path
                    location.assign((org_id) ? '/organization/' + org_id + '/' + current_folder : twig.globals.strings.mycharts_base + '/' + current_folder);
                }
            }).fail(handler.fail);
        }
    }

    return function(flat_list, org_id) {
        var source_path = $('#current-folder').data('fullpath'),
            source_parent = '',
            move_menu = '';

        if (typeof(source_path) === 'undefined') return;
        source_parent = source_path.slice(0, source_path.lastIndexOf('/'));
        if (source_parent == '') source_parent = '/';

        if (org_id) {
            $('#current-folder').find(".dropdown-menu .move-root").append("\
                <li class=\"dropdown-submenu\">\n\
                    <a class=\"move-to-folder\" tabindex=\"-1\" href=\"#\"><i class=\"fa fa-folder-open\"></i> " + org_id + "</a>\n\
                    <ul class=\"dropdown-menu move-links move-org\"></ul>\n\
                </li>\n\
            ");
            move_menu = $('#current-folder').find(".dropdown-menu .move-org").last();
        } else {
            move_menu = $('#current-folder').find(".dropdown-menu .move-root");
        }

        flat_list.forEach(function(folder) {
            var l = document.createElement('li'),
                a = document.createElement('a');

            // Do not create links for subfolders of this path
            if ($('#current-folder').data('organization') == org_id && (
                folder.path == source_parent ||
                folder.path.startsWith(source_path)
            )) return;

            a.innerText = folder.path;
            a.setAttribute('href', '#');
            $(a).click(move_to_folder_helper(folder.id, org_id));
            l.appendChild(a);
            move_menu.append(l);
        });
    };
});
