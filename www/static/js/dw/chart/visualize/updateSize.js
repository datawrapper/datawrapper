

define(function() {

    return function(_w, _h) {
        var maxW = $('#iframe-wrapper').parent().parent().width()-22,
            w = _w || $('#resize-w').val() || 580,
            h = _h || $('#resize-h').val() || 400,
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
                'margin-left': (maxW - realW) * 0.5
            }, 400, 'easeOutExpo');

            console.log('updateSize', (+h)+115);
            $('.visconfig').css('min-height', (+h)+115);

            chart.set('metadata.publish.embed-width', w);
            chart.set('metadata.publish.embed-height', h);
        }
    };

});
