

define(function() {

    return function(_w, _h) {
        var maxW = $('#iframe-wrapper').parent().parent().width()-22,
            w = _w || $('#resize-w').val() || 580,
            h = Math.min((_h || $('#resize-h').val() || 400), 600),
            chart = dw.backend.currentChart;

        if (Number(w) > maxW) {
            w = maxW;
        }

        var m = String(w).match(/^(\d+(?:\.\d+)?)%$/),
            realW = m ? (+m[1]/100)*maxW : w;

        if ($('#resize-w').val() != w) $('#resize-w').val(w);
        if ($('#resize-h').val() != h) $('#resize-h').val(h);

        if (!$('#iframe-wrapper').is(':animated')) {
            $('#iframe-wrapper').animate({
                width: w,
                height: h,
                'margin-left': (maxW - realW) * 0.5,
            }, {
                duration: 400,
                easing: 'easeOutExpo',
                step: function() {
                    $(this).css('overflow', 'visible');
                }
            });

            $('.visconfig').css('min-height', (+h)+115);

            if (!$('.size-presets .preset.manual').hasClass('selected')) {
                $('.size-presets .preset').removeClass('selected');

                if (w == 280) {
                    $('.size-presets .preset.mobile-s').addClass('selected');
                } else if (w == 370) {
                    $('.size-presets .preset.mobile-l').addClass('selected');
                } else {
                    $('.size-presets .preset.desktop').addClass('selected');
                } 
            } 

            chart.set('metadata.publish.embed-width', w);
            chart.set('metadata.publish.embed-height', h);
        }
    };

});
