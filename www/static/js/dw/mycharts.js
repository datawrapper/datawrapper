define(function(require) {

    var $ = require('jquery'),
        chart_functions = require('./mycharts/generic-chart-functions'),
        treeyfy = require('./mycharts/treeyfy'),
        multiselection = require('./mycharts/multiselection'),
        handler = require('./mycharts/handler')
        build_folder_2_folder_movelinks = require('./mycharts/folder_2_folder'),
        add_folder_helper = require('./mycharts/add_folder');

    function do_it(twig) {
        chart_functions(twig.globals.user2);

        function folder_menu(folder, org_id, path) {
            $('.add-folder').click(add_folder_helper(folder.id, org_id));
            $('.move-to-folder').show();

            $('#rename-folder').click(function(e) {
                var nuname;

                e.preventDefault();
                nuname = prompt(twig.globals.strings.enter_folder_name, folder.name);

                $.ajax({
                    url: '/api/folders/' + folder.id,
                    type: 'PUT',
                    processData: false,
                    contentType: "application/json",
                    data: JSON.stringify({ name: nuname }),
                    dataType: 'JSON'
                }).done(handler.done).fail(handler.fail);
            });

            // can't delete root or folders with subfolders
            if (!(typeof(path) === 'undefined' || folder.sub != false)) {
                $('#delete-folder').click(function(e) {
                    e.preventDefault();
                    $.ajax({
                        url: '/api/folders/' + folder.id,
                        type: 'DELETE',
                        contentType: "application/json",
                        dataType: 'JSON'
                    }).done(handler.done).fail(handler.fail);
                });
            }
        }

        function change_root_folder(org) {
            var root_folder = $('#current-root');
            root_folder.attr('href', '/organization/' + org.id);
            root_folder.text(org.name);
        }

        function build_line(org, path, tree) {
            var cwd, mypath,
                line = $('#folder-sequence'),
                sep = '<span class="sep">›</span>';

            mypath = Array.from(path);
            cwd = mypath.pop();

            mypath.forEach(function(dir) {
                var a = document.createElement('a'),
                    folder;

                a.innerText = dw.utils.purifyHtml(dir, '');
                folder = tree.reduce(function(old, cur) {
                    return (!old && cur.name === dir) ? cur : old;
                }, false);
                a.setAttribute('href', (org) ? '/organization/' + org.id + '/' + folder.id : twig.globals.strings.mycharts_base + '/' + folder.id);
                line.append(sep, a);
                tree = folder.sub
            });
            line.append(sep);
            $('#current-folder-name').html(dw.utils.purifyHtml(cwd, ''));
        };

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

        function add_chart_move_function() {
            $('.chart .folder-list a').click(function(e) {
                var tar = $(e.target),
                    id = tar.parents('.chart').data('id'),
                    payload = tar.data();

                e.preventDefault();

                if (Object.keys(multiselection.selected).length > 1) {
                    // multi-select move
                    console.log('MULTI-SELECT', payload);
                    $.ajax({
                        url: '/api/folders/' + (payload.inFolder ?
                            payload.inFolder : 'root' + ( payload.organizationId ?
                                '/'+payload.organizationId : '')),
                        type: 'PUT',
                        processData: false,
                        contentType: "application/json",
                        data: JSON.stringify({
                            add: Object.keys(multiselection.selected)
                        }),
                        dataType: 'JSON'
                    }).done(handler.done).fail(handler.fail);
                    return;
                }

                if (payload.organizationId === false) payload.organizationId = null;

                $.ajax({
                    url: '/api/charts/' + id,
                    type: 'PUT',
                    processData: false,
                    contentType: "application/json",
                    data: JSON.stringify(payload),
                    dataType: 'JSON'
                }).done(handler.done).fail(handler.fail);
            });
        };

        function treelist_wrapper(folder_obj) {
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

        function remove_empty_folder_move_targets() {
            $('#current-folder .move-org').each(function(idx, move_org){
                var list = $(move_org);
                if (!list.find('li').length)
                    list.parent().remove();
            });
        }

        function add_to_root_helper() {
            if (isNaN(parseInt(location.pathname.slice(location.pathname.lastIndexOf('/') + 1)))) {
                var splitted = location.pathname.split('/');
                if (splitted[1] === 'mycharts') {
                    $('.add-folder').click(add_folder_helper(null, false));
                } else {
                    $('.add-folder').click(add_folder_helper(null, decodeURIComponent(splitted[2])));
                }
            }
        }

        function get_folders(tree) {
            var walked_tree = [],
                cleaned_tree;

            cleaned_tree = treeyfy(tree);

            cleaned_tree.forEach(function(folder_obj) {
                walked_tree.push(treelist_wrapper(folder_obj));
            });
            add_chart_move_function();
            cleaned_tree.forEach(function(folder_obj, idx) {
                build_folder_2_folder_movelinks(walked_tree[idx], (folder_obj.organization) ? folder_obj.organization.id : false);
            });
            remove_empty_folder_move_targets();
            add_to_root_helper();
        }

        multiselection.init();

        $('document').ready(function() {
            get_folders(twig.globals.preload);
        });
    }

    return function(obj) {
        var twig = require('./mycharts/twig_globals');
        twig.init(obj);
        do_it(twig);
    }
});
