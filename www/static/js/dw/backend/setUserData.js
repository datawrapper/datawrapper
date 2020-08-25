define(function (require) {
    var httpReq = require('./httpReq');

    return function (data) {
        httpReq
            .patch('/v3/me/data', {
                payload: data
            })
            .then(function (data) {
                _.each(data, function (value, key) {
                    // update client data
                    dw.backend.__userData[key] = value;
                });
            });
        return true;
    };
});
