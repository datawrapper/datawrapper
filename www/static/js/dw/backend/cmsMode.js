define(function () {
    var cmsMode = false,
        cmsConfig = {};

    return {
        isCmsMode: function () {
            return cmsMode;
        },
        getCmsConfig: function () {
            return cmsConfig;
        },
        init: function () {
            if (window.top == window.self) return;

            $('body').addClass('cms-mode');

            window.parent.postMessage(
                {
                    datawrapperIsListening: 1
                },
                '*'
            );

            $(window).on('message', function (e) {
                var data = e.originalEvent.data;

                if (data.datawrapperCMSMode) {
                    cmsMode = true;
                    cmsConfig = data.datawrapperCMSMode;
                    $('body').addClass('cms-mode');
                    dw.backend.fire('cmsModeActivated');
                }
            });
        }
    };
});
