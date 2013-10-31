
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
    };

});