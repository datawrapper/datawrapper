define(function() {
    /*
     * initialize logout links
     */
    return function() {
        $('a[href=#logout]').click(function() {
            $.ajax({
                url: '/api/auth/logout',
                type: 'POST',
                success: function(data) {
                    // sometimes it's a good idea to redirect
                    location.href = '/';
                }
            });
            return false;
        });

        $('a[href=#organization-activate]').click(function(e) {
            e.preventDefault();
            $.ajax({
                url: '/team/' + $(e.target).data('id') + '/activate',
                method: 'PUT',
                dataType: 'json'
            }).done(function(res) {
                if (res.status == 'ok') {
                    location.reload();
                }
            });
        });
    };
});
