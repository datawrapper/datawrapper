
define(function() {

    var chart = dw.backend.currentChart;

    function init(chartUrl, publish, republish) {
        chart.sync('#embed-width', 'metadata.publish.embed-width');
        chart.sync('#embed-height', 'metadata.publish.embed-height');

        $('#embed-width, #embed-height').change(function() {
            var w = $('#embed-width').val(), h = $('#embed-height').val(),
                embedCode = $('#iframe-code').html();
            embedCode = embedCode.replace(/width="\d+"/, 'width="' + w + '"');
            embedCode = embedCode.replace(/height="\d+"/, 'height="' + h + '"');
            $('#iframe-code').html(embedCode);

            resizeIFrame();
        });

        $('.chart-actions .action-duplicate a').click(triggerDuplicate);
        resizeIFrame();

        // send ajax request for re-sending activation email
        $('a[href=#resend]').click(function(e) {
            e.preventDefault();
            dw.backend.resendActivationMail($(e.target).parent().parent().parent());
        });

        // automatically select embed code
        $("textarea").click(function() { $(this).focus().select(); } );

        if (publish) {
            $('.published').hide();

            var checkStatus;
            $.ajax({
                url: '/api/charts/'+chart.get('id')+'/publish',
                type: 'post',
                dataType: 'json',
                success: function(res) {
                    clearInterval(checkStatus);
                    if (res.status == "ok") {
                        $('.publishing').hide();
                        $('.published').fadeIn();
                        $('#iframe-vis').attr('src', chartUrl);
                        window.history.pushState("post_republish", "Datawrapper", "/chart/"+chart.get('id')+"/publish");
                    } else {
                        console.warn(res);
                    }
                }
            });
            var status = 0;
            checkStatus = setInterval(function() {
                $.get('/api/charts/'+chart.get('id')+'/publish/status', function(res) {
                    status = Math.max(status, Number(res));
                    $('.publishing .bar').width(status+'%');
                });
            }, 1000);

            if (republish) {
                setTimeout(function() {
                    $('#chart-url-change-warning').fadeIn();
                }, 1000);
            }
        }

    }

    function triggerDuplicate(e) {
        e.preventDefault();
        var id = chart.get('id');
        $.ajax({
            url: '/api/charts/'+id+'/copy',
            type: 'POST',
            success: function(data) {
                if (data.status == "ok") {
                    // redirect to copied chart
                    location.href = '/chart/'+data.data.id+'/visualize';
                } else {
                    console.warn(data);
                }
            }
        });
    }

    function resizeIFrame() {
        var iframe = $('#iframe-vis'),
            w = iframe.width(),
            h = iframe.height(),
            ow = iframe.parent().width();
            oh = $('div.span4').height();

        iframe.css({ 'margin-left': Math.max(0, (ow - w) * 0.5) + 'px' });
        iframe.css({ 'margin-top':  '10px' });
    }

    return {
        init: init
    };

});