
define(function() {

    /*
     * display an alert block
     */
    function logMessage(msg, parent, type) {
        if (!_.isFunction(parent.prepend)) parent = $(parent);
        $('.alert', parent).remove();
        if (type === undefined) type = 'success';
        var alert = $('<div class="alert alert-'+type+'" />');
        alert.append('<a class="close" data-dismiss="alert" href="#">&times;</a>');
        alert.append('<div>'+msg+'</div>');
        parent.prepend(alert);
        $(".alert").alert();
    }

    function logError(msg, parent) {
        logMessage(msg, parent, 'error');
    }

    function clearAlerts() {
        $('.alert').remove();
        $('.error').removeClass('error');
    }

    var alertOpen = false,
        messageQueue = [],
        lastMessage = false;

    function customAlert(msg) {
        if (msg == lastMessage) return;
        if (!alertOpen) {
            $('#alertModal .message').html(msg);
            $('#alertModal').modal();
            alertOpen = true;
            lastMessage = msg;
        } else {
            messageQueue.push(msg);
        }
        $('#alertModal').off('hidden').on('hidden', function() {
            alertOpen = false;
            if (messageQueue.length) {
                setTimeout(function() {
                    customAlert(messageQueue.pop());
                }, 500);
            }
        });
    }

    var notify = (function() {
        $.fn.fadeOutAndRemove = function() {
            var me = $(this);
            // remove from DOM
            me.fadeOut(400, function() {
               me.unbind().remove();
            });
        };
        return function(msg) {
            // search for previous similar notification and return it if found
            var $notifications = $('#notifications .notification');
            for(var i=0; i<$notifications.length; i++) {
                var $notification = $($notifications.get(i));
                if($notification.find('.message').html() == msg) {
                    return $notification;
                }
            }
            var $container = $('<div />');
            // add the notification
            $container.addClass('notification')
                .html('<div class="action close">✕</div><div class="bg">'+$('#alertModal .bg').html()+'</div><div class="message">'+msg+'</div>')
                .appendTo('#notifications')
                .hide()
                .fadeIn(400);
            // bind event on close button click
            $container.find(".action.close").click(function(){$container.fadeOutAndRemove();});
            return $container;
        };
    })();

    return {
        notify: notify,
        logMessage: logMessage,
        logError: logError,
        clearAlerts: clearAlerts,
        alert: customAlert
    };

});