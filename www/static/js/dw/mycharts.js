define(function(require) {

    var $ = require('jquery'),
        chart_functions = require('./mycharts/generic-chart-functions'),
        treeyfy = require('./mycharts/treeyfy'),
        multiselection = require('./mycharts/multiselection'),
        handler = require('./mycharts/handler'),
        build_folder_2_folder_movelinks = require('./mycharts/folder_2_folder'),
        add_chart_move = require('./mycharts/add_chart_move'),
        add_folder_helper = require('./mycharts/add_folder'),
        treelist = require('./mycharts/treelist'),
        set_active_order = require('./mycharts/set_active_order');

    function do_it(twig) {
        chart_functions(twig.globals.user2);

        $('ul.sort-menu li a')
            .on('click', function(evt) {
                evt.preventDefault();
                $('.mycharts-chart-list')
                    .load(location.pathname+$(evt.target).attr('href')+'&xhr=1');
            });

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
            get_folders(twig.globals.preload.folders);
            set_active_order();
        });
    }

    return function(obj) {
        var twig = require('./mycharts/twig_globals');
        twig.init(obj);
        do_it(twig);
    };
});
