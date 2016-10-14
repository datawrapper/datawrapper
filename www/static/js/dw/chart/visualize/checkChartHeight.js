

define(['./updateSize'], function(updateSize) {

    window.addEventListener('message', function(e) {
        var message = e.data;

        if (typeof message['datawrapper-height'] != "undefined") {
            var h;

            for (var chartId in message['datawrapper-height']) {
                h = message['datawrapper-height'][chartId];
            }

            if (!$('#iframe-vis').hasClass('resizing')) {
                $('#resize-h').val(h);
                updateSize();
            }
        }
    });

    return function() {};

});
