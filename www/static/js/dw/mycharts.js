define(function(require) {

    var $ = require('jquery'),
        _ = require('underscore'),
        chart_functions = require('./mycharts/generic-chart-functions'),
        chartFolderTree = require('./mycharts/chartFolderTree'),
        multiselection = require('./mycharts/multiselection'),
        handler = require('./mycharts/handler'),
        build_folder_2_folder_movelinks = require('./mycharts/folder_2_folder'),
        add_chart_move = require('./mycharts/add_chart_move'),
        add_folder_helper = require('./mycharts/add_folder'),
        treelist = require('./mycharts/treelist'),
        sort_order_and_search = require('./mycharts/sort_order_and_search'),
        no_reload_folder_change = require('./mycharts/no_reload_folder_change'),
        drag_n_drop = require('./mycharts/drag_n_drop');

    function do_it(twig) {
        chart_functions(twig.globals.user2);

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

        function get_folders(raw_folders) {
            var cft, cleaned_tree,
                walked_tree = [];

            // most likely this will move back to the template without require → make it global
            window['ChartFolderTree'] = new chartFolderTree(raw_folders);
            cft = window['ChartFolderTree'];

            cleaned_tree = cft.getLegacyTree();
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
            sort_order_and_search();
            no_reload_folder_change.init();
            drag_n_drop();
        });
    }

    return function(obj) {
        var twig = require('./mycharts/twig_globals');
        twig.init(obj);
        do_it(twig);
    };
});
