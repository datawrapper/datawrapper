/*
 * backend
 */

define([
    './backend/checkPassword',
    './backend/cmsMode',
    './backend/httpReq',
    './backend/initLanguageLinks',
    './backend/initializeLogout',
    './backend/initializeSignUp',
    './backend/notification',
    './backend/setUserData',
    './backend/syncChart'
], function (
    checkPassword,
    cmsMode,
    httpReq,
    initLanguageLinks,
    initializeLogout,
    initializeSignUp,
    notification,
    setUserData,
    syncChart
) {
    var backend = {};

    _.extend(
        backend,
        {
            init: function () {
                // syncChart(dw.backend.currentChart);
                initializeSignUp();
                initLanguageLinks();
                initializeLogout();

                this.cmsMode.init();

                $('a[data-toggle=modal]').click(function (e) {
                    var a = $(e.target),
                        tgt = $(a.data('target'));
                    tgt.modal();
                });
            },

            checkPassword: checkPassword,
            cmsMode: cmsMode,
            httpReq: httpReq,
            setUserData: setUserData,
            syncChart: syncChart
        },
        notification
    );

    return backend;
});
