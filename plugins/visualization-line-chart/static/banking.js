
$(function() {

    function syncBankingButton(args) {
        var el = $('#' + args.key);
        el.on('click', function(argument) {
            var iframe =  $('#iframe-vis'),
                chart_window = iframe.get(0).contentWindow,
                chart_body = iframe.get(0).contentDocument,
                chart_cont = $('#chart', chart_body),
                __dw = chart_window.__dw,
                ratio = __dw.vis.computeAspectRatio(),
                h = Math.min(700, Math.max(100, chart_cont.width() / ratio)),
                hdiff = h - chart_cont.height(),
                f_h = Math.round(args.chart.get('metadata.publish.embed-height')+hdiff);
            $('#resize-h').val(f_h).trigger('change');
        });
    }

    // column select
    dw.backend.on('sync-option:linechart-banking', syncBankingButton);

});

