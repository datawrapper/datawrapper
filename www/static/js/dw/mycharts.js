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

    return function(obj) {
        var twig = require('./mycharts/twig_globals');
        twig.init(obj);

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
