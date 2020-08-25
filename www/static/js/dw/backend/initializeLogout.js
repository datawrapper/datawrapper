define(function (require) {
    var httpReq = require('./httpReq');

    /**
     * Initialize logout links
     */
    return function () {
        $('a[href=#logout]').click(function () {
            httpReq.post('/v3/auth/logout').then(function () {
                // sometimes it's a good idea to redirect
                window.location.href = '/';
            });
            return false;
        });

        $('a[href=#team-activate]').click(function (e) {
            e.preventDefault();
            $.ajax({
                url: '/team/' + $(e.target).data('id') + '/activate',
                method: 'PUT',
                dataType: 'json',
                crossDomain: true,
                xhrFields: {
                    withCredentials: true
                }
            }).done(function (res) {
                if (res.status === 'ok') {
                    window.location.reload();
                }
            });
        });
    };
});
