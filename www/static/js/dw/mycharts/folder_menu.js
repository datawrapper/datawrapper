define(function(require) {
	var $ = require('jquery');
    var add_folder_helper = require('./add_folder');

    return function(folder, org_id, path) {
        $('.add-folder').click(add_folder_helper(folder.id, org_id));
        $('.move-to-folder').show();

        $('#rename-folder').click(function(e) {
            var nuname;

            e.preventDefault();
            nuname = prompt(twig.globals.strings.enter_folder_name, folder.name);

            $.ajax({
                url: '/api/folders/' + folder.id,
                type: 'PUT',
                processData: false,
                contentType: "application/json",
                data: JSON.stringify({ name: nuname }),
                dataType: 'JSON'
            }).done(handler.done).fail(handler.fail);
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
    }
});
