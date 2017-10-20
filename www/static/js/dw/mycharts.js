define(function(require) {

    var $ = require('jquery'),
        _ = require('underscore'),
        twig = require('./mycharts/twig_globals'),
        chartFolderTree = require('./mycharts/chartFolderTree'),
        handler = require('./mycharts/handler'),
        chart_functions = require('./mycharts/generic-chart-functions'),
        renderTree = require('./mycharts/renderTree'),
        no_reload_folder_change = require('./mycharts/no_reload_folder_change'),
        folder_menu = require('./mycharts/folder_menu'),
        multiselection = require('./mycharts/multiselection'),
        sort_order_and_search = require('./mycharts/sort_order_and_search'),
        drag_n_drop = require('./mycharts/drag_n_drop');

    return function(obj) {
        twig.init(obj);

        $('document').ready(function() {
            window['ChartFolderTree'] = new chartFolderTree(twig.globals.preload, twig.globals.current, twig.globals.charts);
            delete twig.globals.preload;
            delete twig.globals.current;
            delete twig.globals.charts;
            cft = window['ChartFolderTree'];
            renderTree();
            no_reload_folder_change.init();
            no_reload_folder_change.repaintBreadcrumb();
            chart_functions();
            folder_menu();
            multiselection.init();
            sort_order_and_search();
            drag_n_drop();
        });
    };
});
