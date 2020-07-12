/* globals define, dw, $ */
define(function() {
    /*
     * initialize logout links
     */
    return function() {
        $('a[href=#logout]').click(function() {
            $.ajax({
                url: '//' + dw.backend.__api_domain + '/v3/auth/logout',
                type: 'POST',
                // dataType: "json",
                crossDomain: true,
                xhrFields: {
                    withCredentials: true
                },
                success: function(data) {
                    // sometimes it's a good idea to redirect
                    window.location.href = '/';
                }
            });
            return false;
        });

        $('a[href=#team-activate]').click(function(e) {
            e.preventDefault();
            $.ajax({
                url: '/team/' + $(e.target).data('id') + '/activate',
                method: 'PUT',
                dataType: 'json',
                crossDomain: true,
                xhrFields: {
                    withCredentials: true
                }
            }).done(function(res) {
                if (res.status === 'ok') {
                    window.location.reload();
                }
            });
        });
    };
});
