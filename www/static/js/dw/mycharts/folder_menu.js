define(function(require) {
    var $ = require('jquery'),
        add_folder_helper = require('./add_folder'),
        handler = require('./handler'),
        twig = require('./twig_globals');

    return function(folder, org_id, path) {
        $('.add-folder').click(add_folder_helper(folder.id, org_id));
        $('.move-to-folder').show();

        $('#rename-folder').click(function(e) {
            // fancier inline editing!
            var curname = $('#current-folder-name')
                .attr('contenteditable', true)
                .on('focus', function(evt) {
                    // select all on focus
                    var div = evt.target;
                    window.setTimeout(function() {
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
                .on('keypress', function(evt) {
                    if (evt.which == 13) { // return
                        done();
                        evt.preventDefault();
                    } else if (evt.keyCode == 27) { // esc
                        curname.text(folder.name)
                            .attr('contenteditable', null);
                    }
                })
                .on('blur', done)
                .focus();

            function done() {
                var new_name = curname
                    .attr('contenteditable', null)
                    .text().trim();

                curname.text(new_name);

                if (new_name != folder.name && new_name) {
                    folder.name = new_name;
                    $.ajax({
                        url: '/api/folders/' + folder.id,
                        type: 'PUT',
                        processData: false,
                        contentType: "application/json",
                        data: JSON.stringify({ name: new_name }),
                        dataType: 'JSON'
                    }).done(function(res) {
                        if (res.status == 'error') {
                            alert(res.message);
                            curname.text(folder.name);
                        }
                    }).fail(function(err) {
                        alert('API Error');
                        console.error(err);
                        curname.text(folder.name);
                    });
                }
            }

            e.preventDefault();
            // nuname = window.prompt(twig.globals.strings.enter_folder_name, folder.name);
        });

        // can't delete root or folders with subfolders
        if (!(typeof(path) === 'undefined' || folder.sub != false)) {
            $('#delete-folder').click(function(e) {
                e.preventDefault();
                $.ajax({
                    url: '/api/folders/' + folder.id,
                    type: 'DELETE',
                    contentType: "application/json",
                    dataType: 'JSON'
                }).done(handler.done).fail(handler.fail);
            });
        }
    };
});
