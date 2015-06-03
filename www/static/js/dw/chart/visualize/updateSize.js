

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

        $('#resize-w').val(w);
        $('#resize-h').val(h);

        $('#iframe-wrapper').animate({
            width: w,
            height: h,
            'margin-left': (maxW - realW) * 0.5
        }, 400, 'easeOutExpo');

        chart.set('metadata.publish.embed-width', w);
        chart.set('metadata.publish.embed-height', h);
    };

});