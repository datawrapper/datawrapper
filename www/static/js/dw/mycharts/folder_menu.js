/* global alert, define, prompt, location */

define(function (require) {
    var $ = require('jquery');
    var httpReq = require('./httpReq');
    var twig = require('./twig_globals');
    var noReloadFolderChange = require('./no_reload_folder_change');
    var buildLink = require('./buildLink');
    var cft;

    return function () {
        cft = window.ChartFolderTree;

        function cleanResponse(folder) {
            delete folder.user;
            delete folder.type;
            folder.sub = false;
            folder.charts = 0;
            return folder;
        }

        $('.add-folder').click(function (e) {
            var nuname;
            var id = cft.getCurrentFolder();

            e.preventDefault();
            nuname = prompt(twig.globals.strings.enter_folder_name);
            if (!nuname) return;

            httpReq
                .post('/api/2/folders', {
                    payload: {
                        name: nuname,
                        parent: id.folder,
                        organization: id.organization
                    }
                })
                .then(function (data) {
                    cft.addFolder(cleanResponse(data));
                    noReloadFolderChange.repaintSubfolders();
                    cft.reRenderTree();
                    noReloadFolderChange.reenableClicks();
                })
                .catch(function (err) {
                    alert('API Error');
                    console.error(err.message);
                    location.reload();
                });
        });

        $('#rename-folder').click(function (e) {
            // fancier inline editing!
            var id = cft.getCurrentFolder();
            var folderName = cft.getFolderNameById(id.folder);
            var curname = $('#current-folder-name')
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
                    if (evt.which === 13) {
                        // return
                        done();
                        evt.preventDefault();
                    } else if (evt.keyCode === 27) {
                        // esc
                        curname.text(folderName).attr('contenteditable', null);
                        curname.off('focus keypress blur');
                    }
                })
                .on('blur', done)
                .focus();

            function done() {
                var newName = curname.attr('contenteditable', null).text().trim();

                curname.text(newName);

                if (newName !== folderName && newName) {
                    folderName = newName;
                    httpReq
                        .put('/api/2/folders/' + id.folder, {
                            payload: { name: newName }
                        })
                        .then(function (data) {
                            $('.folders li.active a span').text(data.name);
                            cft.setFolderName(id.folder, data.name);
                        })
                        .catch(function (err) {
                            alert('API Error');
                            console.error(err.message);
                            curname.text(folderName);
                        });
                }
                curname.off('focus keypress blur');
            }

            e.preventDefault();
        });

        $('#delete-folder').click(function (e) {
            var id = cft.getCurrentFolder();

            e.preventDefault();
            httpReq
                .delete('/api/2/folders/' + id.folder)
                .then(function () {
                    var parentLink = buildLink(cft.getParentFolder(id));
                    cft.deleteFolder(id);
                    noReloadFolderChange.reloadLink(parentLink);
                    cft.reRenderTree();
                    noReloadFolderChange.reenableClicks();
                })
                .catch(function (err) {
                    alert('API Error');
                    console.error(err.message);
                    location.reload();
                });
        });

        cft.setCurrentFolderFuncs(function () {
            var cur = cft.getCurrentFolder();
            var ren = $('#rename-folder');
            var del = $('#delete-folder');

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
