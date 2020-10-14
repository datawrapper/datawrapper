define(function () {
    /*
     * activate the language links in main navbar
     */
    return function () {
        $('a[href|=#lang]').click(function (evt) {
            evt.preventDefault();

            dw.backend.httpReq
                .patch('/v3/me', {
                    payload: { language: $(evt.target).attr('href').substr(6) }
                })
                .then(function () {
                    location.reload();
                });
        });
    };
});
