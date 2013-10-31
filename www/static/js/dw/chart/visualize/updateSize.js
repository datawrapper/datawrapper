

define(function() {

    return function(_w, _h) {
        var maxW = $('#iframe-wrapper').parent().parent().width()-22,
            w = _w || Math.min(Number($('#resize-w').val()) || 580, maxW),
            h = _h || Number($('#resize-h').val()) || 400,
            chart = dw.backend.currentChart;
        $('#resize-w').val(w);
        $('#resize-h').val(h);
        $('#iframe-wrapper').animate({
            width: w,
            height: h,
            'margin-left': (maxW - w) * 0.5
        }, 400, 'easeOutExpo');

        chart.set('metadata.publish.embed-width', w);
        chart.set('metadata.publish.embed-height', h);
    };

});