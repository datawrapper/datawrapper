define(function(require) {

    var $ = require('jquery'),
        _ = require('underscore'),
        chartFolderTree = require('./mycharts/chartFolderTree'),
        handler = require('./mycharts/handler'),
        chart_functions = require('./mycharts/generic-chart-functions'),
        renderTree = require('./mycharts/renderTree'),
        multiselection = require('./mycharts/multiselection'),
        sort_order_and_search = require('./mycharts/sort_order_and_search'),
        no_reload_folder_change = require('./mycharts/no_reload_folder_change'),
        drag_n_drop = require('./mycharts/drag_n_drop');
        // add_folder_helper = require('./mycharts/add_folder'),
        // build_folder_2_folder_movelinks = require('./mycharts/folder_2_folder'),
        // add_chart_move = require('./mycharts/add_chart_move'),
        // treelist = require('./mycharts/treelist'),

/*    function do_it(twig) {

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

        function get_folders(twig_globals) {
            var cft, cleaned_tree,
                walked_tree = [];


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
    }*/

    return function(obj) {
        var twig = require('./mycharts/twig_globals');
        twig.init(obj);
        // do_it(twig);

        $('document').ready(function() {
            window['ChartFolderTree'] = new chartFolderTree(twig.globals.preload, twig.globals.current);
            delete twig.globals.preload;
            delete twig.globals.current;
            cft = window['ChartFolderTree'];
            renderTree();
            chart_functions(twig.globals.user2);
            multiselection.init();
            sort_order_and_search();
            no_reload_folder_change.init();
            drag_n_drop();
        });
    };
});
