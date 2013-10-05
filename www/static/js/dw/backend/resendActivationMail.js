
define(function() {

    return function(msgElement) {
        var req = $.ajax({
            url: '/api/account/resend-activation',
            type: 'POST',
            dataType: 'json'
        });
        if (msgElement) {
            req.done(function(res) {
                if (res.status == 'ok') {
                    logMessage(res.data, msgElement);
                } else {
                    logError(res.message, msgElement);
                }
            });
        }
        return req;
    };

});