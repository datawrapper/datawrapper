/* global $, define, location */

define(function (require) {
    var httpReq = require('./httpReq');

    /**
     * Activate the language links in main navbar
     */
    return function () {
        $('a[href|=#lang]').click(function (evt) {
            evt.preventDefault();
            httpReq
                .put('/api/account/lang', {
                    payload: { lang: $(evt.target).attr('href').substr(6) }
                })
                .then(function (data) {
                    location.reload();
                });
        });
    };
});
