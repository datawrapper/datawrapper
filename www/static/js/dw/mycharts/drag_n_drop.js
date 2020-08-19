/* global alert, define, location */

define(function (require) {
    var $ = require('jquery');
    var httpReq = require('./httpReq');
    var multiselection = require('./multiselection');
    var twig = require('./twig_globals');
    var noReloadFolderChange = require('./no_reload_folder_change');
    var cft;
    var dragData;

    function getMultiDragImage(chartIds) {
        var l = chartIds.length + 5;
        var offset = 10;
        var div = $('<div class="custom-drag-image" />')
            .css({
                position: 'absolute',
                top: -1000,
                left: -1000
            })
            .appendTo('ul.thumbnails');
        chartIds.forEach(function (id, i) {
            $('.thumbnails li.chart[data-id="' + id + '"]')
                .clone(false)
                .css({
                    position: 'absolute',
                    zIndex: l - i,
                    top: offset * i + 'px',
                    left: offset * i + 'px',
                    opacity: 1 - i * 0.1
                })
                .addClass('drag-image')
                .appendTo(div);
        });
        return div.get(0);
    }

    function enableChartDrag() {
        var charts = $('div.mycharts-chart-list ul.thumbnails li.chart');
        var dragImage;

        charts.find('*').attr('draggable', 'false');
        charts.attr('draggable', 'true');

        charts.on('dragstart', function (e) {
            var chartIds = [e.target.getAttribute('data-id')];
            var ev = e.originalEvent;
            if (multiselection.selected.has(chartIds[0])) {
                chartIds = multiselection.selected.values();
            } else {
                multiselection.selectNone();
            }
            dragData = {
                type: 'charts',
                charts: chartIds
            };
            ev.dataTransfer.setData('application/json', JSON.stringify(dragData));
            dragImage = chartIds.length === 1 ? e.target : getMultiDragImage(chartIds);
            ev.dataTransfer.setDragImage(dragImage, 0, 0);
            ev.dataTransfer.dropEffect = 'move';
        });

        charts.on('dragend', function () {
            $('.chart-move-message').remove();
            $('ul.folders-left li').removeClass('dragtar');
            $('.custom-drag-image').remove();
        });
    }

    function enableFolderDrag() {
        var folders = $('ul.folders-left li')
            .add('ul.subfolders li.span2')
            .not('.add-button,.root-folder');
        // FIXME: We should disable some more things likely to be dragged, that we don't want to be dragged

        folders.find('*').attr('draggable', 'false');
        folders.attr('draggable', 'true');
        folders.on('dragstart', function (e) {
            var ev = e.originalEvent;
            var tar = e.currentTarget;
            var folderId = parseInt($(tar).attr('folder-id'));

            dragData = {
                type: 'folder',
                id: folderId
            };
            ev.dataTransfer.setData('application/json', JSON.stringify(dragData));
            ev.dataTransfer.setDragImage(tar, 0, 0);
            ev.dataTransfer.dropEffect = 'move';
        });

        folders.on('dragend', function () {
            $('.chart-move-message').remove();
            $('ul.folders-left li').removeClass('dragtar');
        });
        $('li.root-folder').find('*').attr('draggable', false);
    }

    function moveCharts(charts, target, id) {
        httpReq
            .put('/api/2/folders/' + target, {
                payload: {
                    add: charts
                }
            })
            .then(function () {
                cft.moveNChartsTo(charts, id);
                noReloadFolderChange.reloadLink(location.href);
            })
            .catch(function (err) {
                alert('API Error');
                console.error(err.message);
                location.reload();
            });
        $('.mycharts-chart-list ul.thumbnails li.span2.chart')
            .not('.drag-image')
            .each(function (idx, chart) {
                if (
                    charts.filter(function (ele) {
                        if (ele === $(chart).data('id')) return true;
                        return false;
                    }).length > 0
                ) {
                    chart.remove();
                }
            });
    }

    function moveFolder(folder, target, id) {
        httpReq
            .put('/api/2/folders/' + folder, {
                payload: target
            })
            .then(function (res) {
                cft.moveFolderToFolder(folder, id);
                noReloadFolderChange.repaintBreadcrumb();
                noReloadFolderChange.repaintSubfolders();
                cft.reRenderTree();
                noReloadFolderChange.reenableClicks();
            })
            .catch(function (err) {
                alert('API Error');
                console.error(err.message);
                location.reload();
            });
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
            id.organization = parsed[0] === 'mycharts' ? false : parsed[1];
            return id;
        }
    }

    function enableDrop() {
        var dropTargets = $('ul.folders-left li').add('ul.subfolders li.span2').not('.add-button');

        dropTargets.off();

        function getTrans(e) {
            var trans;
            try {
                trans = JSON.parse(e.originalEvent.dataTransfer.getData('application/json'));
            } catch (err) {
                trans = false;
            }
            return trans;
        }

        function isValidDrop(e) {
            if (dragData.type === 'folder') {
                var target = identifyTarget($(e.currentTarget));
                return !(
                    cft.isSubfolderOf(dragData.id, target.folder) ||
                    cft.isParentFolder(dragData.id, {
                        id: target.folder,
                        organization: target.organization
                    })
                );
            }
            // else is chart
            return true;
        }

        function isUserToOrgMove(e) {
            var target = identifyTarget($(e.currentTarget));
            return cft.isUserToOrgMove(dragData, target);
        }

        function isOrgToUserMove(e) {
            var target = identifyTarget($(e.currentTarget));
            return cft.isOrgToUserMove(dragData, target);
        }

        dropTargets.on('dragenter', function (e) {
            e.preventDefault();
            dropTargets.removeClass('dragtar');
            $('.chart-move-message').remove();

            if (isValidDrop(e)) {
                e.currentTarget.classList.add('dragtar');
                e.originalEvent.dataTransfer.dropEffect = 'move';
                if (isUserToOrgMove(e)) {
                    $('<div class="chart-move-message" />')
                        .appendTo('body')
                        .html(
                            twig.globals.strings[
                                dragData.type === 'folder'
                                    ? 'confirm_move_folder_to_org'
                                    : 'confirm_move_chart_to_org'
                            ].replace(
                                '%s',
                                cft.getOrgNameById(identifyTarget($(e.currentTarget)).organization)
                            )
                        );
                } else if (isOrgToUserMove(e)) {
                    $('<div class="chart-move-message" />')
                        .appendTo('body')
                        .html(
                            twig.globals.strings[
                                dragData.type === 'folder'
                                    ? 'confirm_move_folder_to_user'
                                    : 'confirm_move_chart_to_user'
                            ]
                        );
                }
            } else {
                e.originalEvent.dataTransfer.dropEffect = 'none';
            }
        });

        dropTargets.on('dragover', function (e) {
            e.preventDefault();
        });

        dropTargets.on('drop', function (e) {
            var trans;
            var id = identifyTarget($(e.currentTarget));
            e.preventDefault();
            dropTargets.removeClass('dragtar');
            trans = getTrans(e);
            if (!trans || typeof trans.type === 'undefined') {
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

    function enableDnD() {
        enableDrop();
        enableChartDrag();
        enableFolderDrag();
    }

    return function () {
        enableDnD();
        cft = window.ChartFolderTree;
        cft.setDnDCallback(enableDnD);
    };
});
