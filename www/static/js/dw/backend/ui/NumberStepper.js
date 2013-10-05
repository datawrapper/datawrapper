
define(function() {

    return function() {

        $.fn.numberstepper = function(opts) {

            var ct = $(this), options;

            if (ct.data('number-stepper-options')) {
                // already initialized
                var o = $.extend(ct.data('number-stepper-options'), opts);
                change(o.value);
                $('input', ct).val(o.value);

            } else {
                // init
                options = $.extend({
                    min: ct.data('min') || 0,
                    max: ct.data('max') || 10,
                    value: ct.data('value') || 5
                }, opts);
                ct.data('number-stepper-options', options);
                initUI();
            }

            function initUI() {
                ct.html(''); // clean ui

                // construct ui
                var bg = $('<div />').addClass('btn-group number-stepper').appendTo(ct),
                    minus = $('<button />').addClass('btn btn-minus').text('-').appendTo(bg),
                    tf = $('<input type="text" />').addClass('input-small').val(options.value).appendTo(bg),
                    plus = $('<button />').addClass('btn btn-plus').text('+').appendTo(bg);

                // add events
                minus.click(function() { change(options.value-1); });
                tf.change(function() { change(+tf.val()); });
                plus.click(function() { change(options.value+1); });
            }

            function change(new_value) {
                var options = ct.data('number-stepper-options'),
                    newv = Math.min(options.max, Math.max(options.min, new_value)),
                    tf = $('input', ct);
                if (newv != options.value) {
                    tf.val(newv);
                    options.value = newv;
                    if ($.isFunction(options.changed)) {
                        _.defer(options.changed, newv);
                    }
                }
            }
        };
    };

});