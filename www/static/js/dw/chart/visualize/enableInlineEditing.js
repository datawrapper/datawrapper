
define(function() {

    $.fn.initInlineEditing = function() {
        return $(this)
        .attr('contenteditable', true)
        .off('focus').on('focus', function(evt) {
            $(evt.target).data('old-value', $(evt.target).html());
        })
        .off('keydown').on('keydown', function(evt) {
            if (evt.keyCode == 27) {
                $(evt.target).html($(evt.target).data('old-value')).blur();
                return;
            }
            if (evt.keyCode == 13) {
                $(evt.target).blur();
                evt.preventDefault();
            }
        });
    };

    return function(iframe, chart) {
        var doc = iframe.get(0).contentDocument,
            lastNotification;

        $('.label[data-column][data-row] span', doc)
            .initInlineEditing()
            .off('blur').on('blur', function(evt) {
                var span = $(evt.target),
                    val = $.trim(span.html()),
                    label = span.parent(),
                    transpose = chart.get('metadata.data.transpose', false),
                    dataset = chart.dataset(),
                    column = String(label.data('column')),
                    row = label.data('row'),
                    c = !transpose ? dataset.indexOf(column) : 0,
                    r = !transpose ? row+1 : dataset.indexOf(column);

                if (val !== '' && val != $.trim($(evt.target).data('old-value'))) {
                    var changes = chart.get('metadata.data.changes', []).slice(0),
                        change = { row: r, column: c, value: val };
                    changes.push(change);
                    chart.set('metadata.data.changes', changes);
                    if (!lastNotification) lastNotification = dw.backend.notify(dw.backend.messages.liveEditSuccess.replace('[', '<a href="describe">').replace(']', '</a>'));
                }
            });

        $('.chart-title', doc)
            .initInlineEditing()
            .off('blur').on('blur', function() {
                var new_val = $('.chart-title', doc).html();
                chart.set('title', new_val);
                $('#text-title').val(new_val);
            });

        $('.chart-intro', doc)
            .initInlineEditing()
            .off('blur').on('blur', function() {
                chart.set('metadata.describe.intro', $('.chart-intro', doc).html());
                $('#text-intro').val($('.chart-intro', doc).html());
            });
    };

});