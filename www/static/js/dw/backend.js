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
    './backend/popupChart',
    './backend/setUserData',
    './backend/syncChart',
    './backend/ui/ColorSelector',
    './backend/ui/NumberStepper'
], function (
    checkPassword,
    cmsMode,
    httpReq,
    initLanguageLinks,
    initializeLogout,
    initializeSignUp,
    notification,
    popupChart,
    setUserData,
    syncChart,
    ColorSelector,
    NumberStepper
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

                // init custom jquery ui
                ColorSelector();
                NumberStepper();

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
            popupChart: popupChart,
            setUserData: setUserData,
            syncChart: syncChart
        },
        notification
    );

    return backend;
});
