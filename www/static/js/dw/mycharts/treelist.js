define(function(require) {
    var $ = require('jquery'),
        twig = require('./twig_globals'),
        build_line = require('./build_line'),
        folder_menu = require('./folder_menu');

    function build_tree_list(branch, parent, org, flatter, path, pathstring, tree) {
        var current_folder = twig.globals.current.folder,
            folder_icon_open = '<i class="fa fa-folder-open fa-fw"></i>',
            folder_icon_closed = '<i class="fa fa-folder fa-fw"></i>',
            nu_path,
            seper = $('.folder-list-separator'),
            org_id = (org) ? org.id : false,
            org_tag = (org_id) ? '-' + org_id.replace(' ','-').replace(/[^a-zA-Z0-9-]/g,'') : '';

        // first pass, initialize data
        if (typeof(path) === 'undefined') {
            path = [];
            pathstring = '';
            tree = branch;
        }

        branch.forEach(function(folder) {
            var l1 = document.createElement('li'),
                a1 = document.createElement('a'),
                l2 = document.createElement('li'),
                a2 = document.createElement('a'),
                org_snipplet = (org_id) ? '/organization/' + org_id : '';

            var html = (current_folder && current_folder == folder.id ? folder_icon_open : folder_icon_closed) + ' <span>' + dw.utils.purifyHtml(folder.name, '');
            if (folder.charts > 0) {
                html += '<span class="chart-count">(' + folder.charts + ')</span>';
            }
            html += '</span>';
            a1.innerHTML = html;
            a1.setAttribute('href', (org_id) ? '/organization/' + org_id + '/' + folder.id : twig.globals.strings.mycharts_base + '/' + folder.id);

            nu_path = path.concat(folder.name);
            nu_pstr = pathstring + '/' + folder.name;
            flatter({
                path: nu_pstr,
                id: folder.id
            });

            l1.appendChild(a1);
            parent.append(l1);

            // beware! this a string compare! '' == false && '<num>' == <num>
            if (current_folder && current_folder == folder.id) {
                l1.classList.add('active');
                var curfol_elem = $('#current-folder');
                // hijack this pass to build active folder line
                build_line(org, nu_path, tree);
                folder_menu(folder, org_id, nu_pstr); //last param evaluates to bool
                curfol_elem.find('#delete-folder, #rename-folder').show();
                curfol_elem.data({
                    fullpath: nu_pstr,
                    folder_id: folder.id,
                    organization: org_id
                });
            } else {
                // or append this folder to the MoveTo submenu
                a2.innerHTML = nu_pstr;
                a2.setAttribute('href', '#');
                a2.setAttribute('tabindex', '-1');
                $.data(a2, {
                    inFolder: folder.id,
                    organizationId: org_id
                });
                l2.appendChild(a2);

                if (org_id) {
                    $('.dropdown-menu .folder-list .folder-list' + org_tag).append(l2);
                } else {
                    $(l2).insertBefore(seper);
                }
            }

            if (folder.sub) {
                var nu_par = document.createElement('ul');
                parent.append(nu_par);
                build_tree_list(folder.sub, $(nu_par), org, flatter, nu_path, nu_pstr, tree);
            }
        });
    };

    return function treelist_wrapper(folder_obj) {
        // prepare move to root
        var flatened_tree = [{
                path: '/',
                id: false
            }],
            entrypoint = '#dynamic-tree',
            org = (folder_obj.organization) ? folder_obj.organization : false,
            current_org = twig.globals.current.organization,
            root_link,
            move_to_root = $('<li><a href="#" tabindex=-1>/</a></li>');

        // create move to root links, because root is not a real folder
        if (org) {
            var org_tag = '-' + org.id.replace(' ','-').replace(/[^a-zA-Z0-9-]/g,'');
            entrypoint += org_tag;
            move_to_root.find('a').data({
                inFolder: null,
                organizationId: org.id
            });
            $('.dropdown-menu .folder-list .folder-list' + org_tag).append(move_to_root);
            root_link = $('#org-root' + org_tag+' > span');
        } else {
            move_to_root.find('a').data({
                inFolder: null,
                organizationId: null
            });
            move_to_root.insertBefore($('.folder-list-separator'));
            root_link = $('#user-root > span');
        }

        // root_link contains a link to the root folder on the left side. don't mix up these two
        if (folder_obj.charts > 0) root_link.html(root_link.html() + '<span class="chart-count">(' + folder_obj.charts + ')</span>');

        if (current_org == org.id) change_root_folder(org);

        build_tree_list(folder_obj.folders, $(entrypoint), org, function(path) {
            flatened_tree.push(path);
        });

        return flatened_tree;
    };
});
