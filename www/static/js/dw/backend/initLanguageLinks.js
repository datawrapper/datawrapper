
define(function() {

    /*
     * activate the language links in main navbar
     */
    return function() {
        $('a[href|=#lang]').click(function(evt) {
            evt.preventDefault();
            $.ajax({
                url: '/api/account/lang',
                type: 'PUT',
                data: JSON.stringify({ lang: $(evt.target).attr('href').substr(6) }),
                processData: false,
                success: function(data) {
                    location.reload();
                }
            });
        });
    };

});