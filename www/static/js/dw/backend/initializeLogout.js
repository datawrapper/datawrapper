/* global $, define */

define(function (require) {
    var httpReq = require('./httpReq');

    /**
     * Initialize logout links
     */
    return function () {
        $('a[href=#logout]').click(function () {
            httpReq.post('/v3/auth/logout').then(function (data) {
                // sometimes it's a good idea to redirect
                window.location.href = '/';
            });
            return false;
        });

        $('a[href=#team-activate]').click(function (e) {
            e.preventDefault();
            httpReq.put('/team/' + $(e.target).data('id') + '/activate').then(function () {
                window.location.reload();
            });
        });
    };
});
