define(function(require) {

    var $ = require('jquery'),
        chart_functions = require('./mycharts/generic-chart-functions'),
        treeyfy = require('./mycharts/treeyfy'),
        multiselection = require('./mycharts/multiselection'),
        handler = require('./mycharts/handler')
        build_folder_2_folder_movelinks = require('./mycharts/folder_2_folder'),
        add_chart_move = require('./mycharts/add_chart_move'),
        add_folder_helper = require('./mycharts/add_folder'),
        treelist = require('./mycharts/treelist');

    function do_it(twig) {
        chart_functions(twig.globals.user2);



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
                walked_tree.push(treelist(folder_obj));
            });
            add_chart_move();
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
