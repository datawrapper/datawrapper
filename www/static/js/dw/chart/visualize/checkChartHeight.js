

define(['./updateSize'], function(updateSize) {

    return function() {
        var iframe = $('#iframe-vis').contents(),
            vis_h = iframe.height(),
            vis_w = iframe.width(),
            iframe_h = $('#iframe-vis').height(),
            iframe_w = $('#iframe-vis').width(),
            $notification;

        if (vis_h > iframe_h+5 || vis_w > iframe_w) {

            $notification = dw.backend.notify(dw.backend.messages.needMoreSpace.replace('[', '<a href="#" id="resize-iframe">').replace(']', '</a>'));

            $('#resize-iframe').click(function(e) {
                e.preventDefault();
                if (vis_h > iframe_h) $('#resize-h').val(vis_h);
                if (vis_w > iframe_w) $('#resize-w').val(vis_w);
                updateSize();
                if ($notification) $notification.fadeOutAndRemove();
                warningShowed = false;
            });
        } else {
            if ($notification) $notification.fadeOutAndRemove();
        }
    };

});