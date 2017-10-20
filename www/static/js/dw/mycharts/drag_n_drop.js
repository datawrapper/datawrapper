define(function(require) {
    var $ = require('jquery'),
        multiselection = require('./multiselection'),
        twig = require('./twig_globals'),
        no_reload_folder_change = require('./no_reload_folder_change'),
        handler = require('./handler'),
        cft,
        drag_data;

    function enableChartDrag() {
        var charts = $('div.mycharts-chart-list ul.thumbnails li.chart'),
            dragImage;

        charts.find('*').attr('draggable', 'false');
        charts.attr('draggable', 'true');

        charts.on('dragstart', function(e) {
            var chart_ids = [e.target.getAttribute('data-id')],
                ev = e.originalEvent;
            if (multiselection.selected.has(chart_ids[0])) {
                chart_ids = multiselection.selected.values();
            } else {
                multiselection.selectNone();
            }
            drag_data = {
                type: 'charts',
                charts: chart_ids
            };
            ev.dataTransfer.setData('application/json', JSON.stringify(drag_data));
            dragImage = chart_ids.length == 1 ? e.target : getMultiDragImage(chart_ids);
            ev.dataTransfer.setDragImage(dragImage, 0,0);
            ev.dataTransfer.dropEffect = "move";
        });

        charts.on('dragend', function() {
            $('.chart-move-message').remove();
            $('ul.folders-left li').removeClass('dragtar');
            $('.custom-drag-image').remove();
        });
    }

    function enableFolderDragForJQO(folders) {
        folders.find('*').attr('draggable', 'false');
        folders.attr('draggable', 'true');
        folders.on('dragstart', function(e) {
            var ev = e.originalEvent,
                tar = e.currentTarget,
                folder_id = parseInt($(tar).attr('folder-id'));

            drag_data = {
                type: 'folder',
                id: folder_id
            };
            ev.dataTransfer.setData('application/json', JSON.stringify(drag_data));
            ev.dataTransfer.setDragImage(tar, 0,0);
            ev.dataTransfer.dropEffect = "move";
        });

        folders.on('dragend', function() {
            $('.chart-move-message').remove();
            $('ul.folders-left li').removeClass('dragtar');
        });
    }

    function enableFolderDrag() {
        enableFolderDragForJQO($('ul.folders-left li').add('ul.subfolders li.span2').not('.add-button,.root-folder'));
        // FIXME: We should disable some more things likely to be dragged, that we don't want to be dragged
        $('li.root-folder').find('*').attr('draggable', false);
    }

    function enableDrag() {
        enableChartDrag();
        enableFolderDragForJQO($('ul.subfolders li.span2').not('.add-button'));
    }

    function moveCharts(charts, target, id) {
        $.ajax({
            url: '/api/folders/' + target,
            type: 'PUT',
            processData: false,
            contentType: "application/json",
            data: JSON.stringify({
                add: charts
            }),
            dataType: 'JSON'
        }).done(function() {
            no_reload_folder_change.reloadLink(location.href);
            cft.moveNChartsTo(charts, id);
        }).fail(handler.fail);
    }

    function moveFolder(folder, target, id) {
        $.ajax({
            url: '/api/folders/' + folder,
            type: 'PUT',
            processData: false,
            contentType: "application/json",
            data: JSON.stringify(target),
            dataType: 'JSON'
        }).done(function(res) {
            if (res.status == 'error') {
                alert(res.message);
            } else if (res.status == 'ok') {
                cft.moveFolderToFolder(folder, id);
                no_reload_folder_change.repaintBreadcrumb();
                no_reload_folder_change.repaintSubfolders();
                cft.reRenderTree();
                no_reload_folder_change.reenableClicks();
            }
        }).fail(handler.fail);
    }

    function prepareChartTarget(id) {
        if (id.folder) return id.folder;
        else if (id.organization) return 'root/' + id.organization;
        else return 'root';
    }

    function prepareFolderTarget(id) {
        return {
            parent: id.folder,
            organization: id.organization
        };
    }

    function identifyTarget(target) {
        var id = {};

        id.folder = parseInt(target.attr('folder-id'));

        if (id.folder) {
            id.organization = cft.getFolderOrgById(id.folder);
            return id;
        } else {
            var parsed = target.find('a').attr('href').slice(1).split('/');
            id.folder = false;
            id.organization = (parsed[0] == 'mycharts') ? false : parsed[1];
            return id;
        }
    }

    function enableDrop() {
        var drop_targets = $('ul.folders-left li');

        $('ul.folders-left li.root-folder').off();

        function getTrans(e) {
            var trans;
            try {
                trans = JSON.parse(e.originalEvent.dataTransfer.getData('application/json'));
            } catch(err) {
                trans = false;
            }
            return trans;
        }

        function isValidDrop(e) {
            if (drag_data.type === 'folder') {
                var target = identifyTarget($(e.currentTarget));
                return !(cft.isSubfolderOf(drag_data.id, target.folder) || 
                    cft.isParentFolder(drag_data.id, {id: target.folder, organization: target.organization}));
            }
            // else is chart
            return true;
        }

        function isUserToOrgMove(e) {
            var target = identifyTarget($(e.currentTarget));
            return cft.isUserToOrgMove(drag_data, target);
        }

        function isOrgToUserMove(e) {
            var target = identifyTarget($(e.currentTarget));
            return cft.isOrgToUserMove(drag_data, target);
        }

        drop_targets.on('dragenter', function(e) {
            e.preventDefault();
            drop_targets.removeClass('dragtar');
            $('.chart-move-message').remove();

            if (isValidDrop(e)) {
                e.currentTarget.classList.add('dragtar');
                e.originalEvent.dataTransfer.dropEffect = 'move';
                if (isUserToOrgMove(e)) {
                    $('<div class="chart-move-message" />')
                        .appendTo('body')
                        .html(twig.globals.strings[
                                drag_data.type == 'folder' ? 'confirm_move_folder_to_org' : 'confirm_move_chart_to_org'
                            ].replace('%s', cft.getOrgNameById(identifyTarget($(e.currentTarget)).organization))
                        );
                } else if (isOrgToUserMove(e)) {
                    $('<div class="chart-move-message" />')
                        .appendTo('body')
                        .html(twig.globals.strings[
                            drag_data.type == 'folder' ? 'confirm_move_folder_to_user' : 'confirm_move_chart_to_user'
                        ]);
                }
            } else {
                e.originalEvent.dataTransfer.dropEffect = 'none';
            }
        });

        drop_targets.on('dragover', function(e) {
            e.preventDefault();
        });

        drop_targets.on('drop', function(e) {
            var trans,
                id = identifyTarget($(e.currentTarget));
            e.preventDefault();
            drop_targets.removeClass('dragtar');
            trans = getTrans(e);
            if(!trans || typeof(trans.type) === 'undefined') {
                alert("You may drop this here, but I can't work with it");
                return;
            }
            switch (trans.type) {
                case 'charts':
                    moveCharts(trans.charts, prepareChartTarget(id), id);
                    break;
                case 'folder':
                    if (!isValidDrop(e)) {
                        alert(twig.globals.strings.move_prohibited_alert);
                        break;
                    }
                    moveFolder(trans.id, prepareFolderTarget(id), id);
                    break;
                default:
                    console.error("We don't have this type.");
            }
        });
    }

    function getMultiDragImage(chart_ids) {
        var l = chart_ids.length + 5,
            offset = 10,
            div = $('<div class="custom-drag-image" />')
                .css({
                    position: 'absolute',
                    top:-1000,
                    left: -1000,
                })
                .appendTo('ul.thumbnails');
        chart_ids.forEach(function(id, i) {
            $('.thumbnails li.chart[data-id="'+id+'"]')
                .clone(false)
                .css({
                    position: 'absolute',
                    zIndex: l-i,
                    top: (offset*i)+'px',
                    left: (offset*i)+'px',
                    opacity: 1 - (i*0.1)
                })
                .appendTo(div);
        });
        return div.get(0);
    }

    return function() {
        enableChartDrag();
        enableFolderDrag();
        enableDrop();
        no_reload_folder_change.setDragNDropCallback(enableDrag);
        cft = window['ChartFolderTree'];
        cft.setDropCallback(function(){
            enableDrop();
            enableFolderDrag();
        });
    };
});
