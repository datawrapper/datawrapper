/* globals define, $ */
define(function() {

    $.fn.initInlineEditing = function() {
        return $(this)
        .attr('contenteditable', true)
        .off('focus').on('focus', function(evt) {
            var tgt = $(evt.target);
            if (tgt.is('.headline-block .block-inner')) {
                var txt = tgt.text();
                if (txt.substr(0,2) == '[ ' && txt.substr(txt.length-2) == ' ]') {
                    evt.target.ownerDocument.execCommand('selectAll',false,null);
                }
            }
            tgt.data('old-value', tgt.html());
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

        $('.label[data-column][data-row] span,.dw-editable[data-column][data-row] span', doc)
            .initInlineEditing()
            .off('blur').on('blur', function(evt) {
                var span = $(evt.target),
                    val = $.trim(span.html()),
                    label = span.parent(),
                    transpose = chart.get('metadata.data.transpose', false),
                    dataset = chart.dataset(),
                    column = String(label.data('column')),
                    row = String(label.data('row')).split(','),
                    c = !transpose ? dataset.indexOf(column) : 0,
                    r = row.map(function(row) {
                        return !transpose ? (+row)+1 : dataset.indexOf(column);
                    });

                if (val !== '' && val != $.trim($(evt.target).data('old-value'))) {
                    var changes = chart.get('metadata.data.changes', []).slice(0);
                    r.forEach(function(r) {
                        var change = { row: r, column: c, value: val };
                        changes.push(change);
                    });
                    chart.set('metadata.data.changes', clone(changes));
                    if (!lastNotification) lastNotification = dw.backend.notify(dw.backend.messages.liveEditSuccess.replace('[', '<a href="describe">').replace(']', '</a>'));
                }
            });

        $('.headline-block .block-inner', doc)
            .initInlineEditing()
            .off('blur').on('blur', function() {
                var new_val = $('.headline-block .block-inner', doc).html();
                chart.set('title', new_val);
                $('#text-title').val(new_val);
            });

        $('.description-block .block-inner', doc)
            .initInlineEditing()
            .off('blur').on('blur', function() {
                chart.set('metadata.describe.intro', $('.description-block .block-inner', doc).html());
                $('#text-intro').val($('.description-block .block-inner', doc).html());
            });

        $('.notes-block .block-inner', doc)
            .initInlineEditing()
            .off('blur').on('blur', function() {
                chart.set('metadata.annotate.notes', $('.notes-block .block-inner', doc).html());
                $('#text-notes').val($('.notes-block .block-inner', doc).html());
            });

        $('.label[data-key] span', doc)
            .initInlineEditing()
            .off('blur').on('blur', function() {
                var span = $(this),
                    lbl = span.parent('.label'),
                    key = lbl.data('key');
                chart.set(key, span.text());
                $('input[data-key="'+key+'"]').val(span.text());
            });
    };

    function clone(o) {
        return JSON.parse(JSON.stringify(o));
    }

});
