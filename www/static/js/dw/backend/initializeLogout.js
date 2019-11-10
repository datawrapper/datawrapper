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

        $('a[href=#team-activate]').click(function(e) {
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

        $('a[href=#team-leave]').click(function(e) {
            if (
                !window.confirm(
                    'Are you sure you want to leave the team ' +
                        $(e.target).data('title') +
                        '? Leaving a team is permanent and cannot be undone by you. You will lose ' +
                        "access to the team's charts and products."
                )
            )
                return;

            e.preventDefault();
            $.ajax({
                url: '/team/' + $(e.target).data('id') + '/leave',
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
