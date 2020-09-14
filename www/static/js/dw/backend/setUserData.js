define(function (require) {
    var httpReq = require('./httpReq');

    return function (data) {
        var payload = Object.assign({}, data);
        delete payload.updatedAt;
        httpReq
            .patch('/v3/me/data', {
                payload: payload
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
