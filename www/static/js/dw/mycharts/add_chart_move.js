define(function(require) {
	var $ = require('jquery'),
		handler = require('./handler'),
		multiselection = require('./multiselection');

    return function () {
        $('.chart .folder-list a').click(function(e) {
            var tar = $(e.target),
                id = tar.parents('.chart').data('id'),
                payload = tar.data();

            e.preventDefault();

            if (multiselection.selected.size() > 1) {
                // multi-select move
                console.log('MULTI-SELECT', payload);
                $.ajax({
                    url: '/api/folders/' + (payload.inFolder ?
                        payload.inFolder : 'root' + ( payload.organizationId ?
                            '/'+payload.organizationId : '')),
                    type: 'PUT',
                    processData: false,
                    contentType: "application/json",
                    data: JSON.stringify({
                        add: multiselection.selected.values()
                    }),
                    dataType: 'JSON'
                }).done(handler.done).fail(handler.fail);
                return;
            }

            if (payload.organizationId === false) payload.organizationId = null;

            $.ajax({
                url: '/api/charts/' + id,
                type: 'PUT',
                processData: false,
                contentType: "application/json",
                data: JSON.stringify(payload),
                dataType: 'JSON'
            }).done(handler.done).fail(handler.fail);
        });
    };
});
