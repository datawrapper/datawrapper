/* globals $, _, dw, define */
define(function () {
    return function (data) {
        $.ajax({
            url: window.location.protocol + '//' + window.dw.backend.__api_domain + '/v3/me/data',
            type: 'PATCH',
            data: JSON.stringify(data),
            contentType: 'application/json',
            context: this,
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
            success: function (res) {
                _.each(data, function (value, key) {
                    // update client data
                    dw.backend.__userData[key] = value;
                });
            }
        });
        return true;
    };
});
