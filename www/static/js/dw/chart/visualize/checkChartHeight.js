

define(['./updateSize'], function(updateSize) {

    return function(heightType) {
        var iframe = $('#iframe-vis').contents();
        if (!iframe.get(0)) return; // content not loaded yet

        var vis_h = $(iframe).find('html').outerHeight(true),
            iframe_h = $('#iframe-vis').height(),
            iframe_w = $('#iframe-vis').width();

        if (iframe_w < 300) {
            $('.size-presets .preset').removeClass('selected');
            $('.size-presets .mobile-s').addClass('selected');
        } else if (iframe_w < 400) {
            $('.size-presets .preset').removeClass('selected');
            $('.size-presets .mobile-l').addClass('selected');
        } else {
            $('.size-presets .preset').removeClass('selected');
            $('.size-presets .desktop').addClass('selected');
        }

        if (heightType == "fixed") {
            $('#resize-h').val(vis_h);
            updateSize();
        }
    };

});
