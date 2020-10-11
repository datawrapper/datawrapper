define(function (require) {
    var $ = require('jquery'),
        handler = require('./handler'),
        twig = require('./twig_globals'),
        no_reload_folder_change = require('./no_reload_folder_change'),
        buildLink = require('./buildLink'),
        cft;

    return function () {
        cft = window['ChartFolderTree'];

        function cleanResponse(folder) {
            delete folder.user;
            delete folder.type;
            folder.sub = false;
            folder.charts = 0;
            return folder;
        }

        $('.add-folder').click(function (e) {
            var nuname,
                id = cft.getCurrentFolder();

            e.preventDefault();
            nuname = prompt(twig.globals.strings.enter_folder_name);
            if (!nuname) return;

            $.ajax({
                url: '/api/2/folders',
                type: 'POST',
                processData: false,
                contentType: 'application/json',
                data: JSON.stringify({
                    name: nuname,
                    parent: id.folder,
                    organization: id.organization
                }),
                dataType: 'JSON'
            })
                .done(function (res) {
                    if (res.status == 'error') {
                        alert(res.message);
                    } else if (res.status == 'ok') {
                        cft.addFolder(cleanResponse(res.data));
                        no_reload_folder_change.repaintSubfolders();
                        cft.reRenderTree();
                        no_reload_folder_change.reenableClicks();
                    }
                })
                .fail(handler.fail);
        });

        $('#rename-folder').click(function (e) {
            // fancier inline editing!
            var id = cft.getCurrentFolder(),
                folder_name = cft.getFolderNameById(id.folder),
                curname = $('#current-folder-name')
                    .attr('contenteditable', true)
                    .on('focus', function (evt) {
                        // select all on focus
                        var div = evt.target;
                        window.setTimeout(function () {
                            var sel, range;
                            if (window.getSelection && document.createRange) {
                                range = document.createRange();
                                range.selectNodeContents(div);
                                sel = window.getSelection();
                                sel.removeAllRanges();
                                sel.addRange(range);
                            } else if (document.body.createTextRange) {
                                range = document.body.createTextRange();
                                range.moveToElementText(div);
                                range.select();
                            }
                        }, 1);
                    })
                    .on('keypress', function (evt) {
                        if (evt.which == 13) {
                            // return
                            done();
                            evt.preventDefault();
                        } else if (evt.keyCode == 27) {
                            // esc
                            curname.text(folder_name).attr('contenteditable', null);
                            curname.off('focus keypress blur');
                        }
                    })
                    .on('blur', done)
                    .focus();

            function done() {
                var new_name = curname.attr('contenteditable', null).text().trim();

                curname.text(new_name);

                if (new_name != folder_name && new_name) {
                    folder_name = new_name;
                    $.ajax({
                        url: '/api/2/folders/' + id.folder,
                        type: 'PUT',
                        processData: false,
                        contentType: 'application/json',
                        data: JSON.stringify({ name: new_name }),
                        dataType: 'JSON'
                    })
                        .done(function (res) {
                            if (res.status == 'error') {
                                alert(res.message);
                                curname.text(folder_name);
                            } else if (res.status == 'ok') {
                                $('.folders li.active a span').text(res.data.name);
                                cft.setFolderName(id.folder, res.data.name);
                            }
                        })
                        .fail(function (err) {
                            alert('API Error');
                            console.error(err);
                            curname.text(folder_name);
                        });
                }
                curname.off('focus keypress blur');
            }

            e.preventDefault();
        });

        $('#delete-folder').click(function (e) {
            var id = cft.getCurrentFolder();

            e.preventDefault();
            $.ajax({
                url: '/api/2/folders/' + id.folder,
                type: 'DELETE',
                contentType: 'application/json',
                dataType: 'JSON'
            })
                .done(function (res) {
                    if (res.status == 'error') {
                        alert(res.message);
                    } else if (res.status == 'ok') {
                        var parent_link = buildLink(cft.getParentFolder(id));
                        cft.deleteFolder(id);
                        no_reload_folder_change.reloadLink(parent_link);
                        cft.reRenderTree();
                        no_reload_folder_change.reenableClicks();
                    }
                })
                .fail(handler.fail);
        });

        cft.setCurrentFolderFuncs(function () {
            var cur = cft.getCurrentFolder(),
                ren = $('#rename-folder'),
                del = $('#delete-folder');

            if (cur.folder) {
                if (cft.hasSubFolders(cur.folder)) del.hide();
                else del.show();
                ren.show();
            } else {
                ren.hide();
                del.hide();
            }
        });
        cft.updateCurrentFolderFuncs();
    };
});
