define(function(require) {
    var $ = require('jquery'),
        twig = require('./twig_globals'),
        handler = require('./handler');

    return function(folder_id, org_id) {
        return function(e) {
            var nuname;

            e.preventDefault();
            nuname = prompt(twig.globals.strings.enter_folder_name);

            $.ajax({
                url: '/api/folders',
                type: 'POST',
                processData: false,
                contentType: "application/json",
                data: JSON.stringify({
                    name: nuname,
                    parent: folder_id,
                    organization: org_id
                }),
                dataType: 'JSON'
            }).done(handler.done).fail(handler.fail);
        }
    }
});
