
define(function() {

    /*
     * initialize the custom color dialog
     */
    function initCustomColors(chart) {
        var customColors = $('#customColors'),
            sel = chart.get('metadata.visualize.custom-colors', {});
            labels = dw.backend.currentVis.keys();

        if (_.isEmpty(labels)) {
            $('a[href=#customColors]').hide();
            return;
        }
        $('a[href=#customColors]').show();

        // populate custom color selector
        $.each(labels, addLabelToList);

        $('#customColors .dataseries li').click(dataseriesClick);
        $('#reset-color-choice').click(resetColorChoice);
        $('a[href=#customColors]').click(customColorsClick);
        $('#reset-all-colors').click(resetAllColors);
        var usercolor = $('#user-color').keyup(userColorKeyUp);

        function addLabelToList(i, lbl) {
            var s = lbl;
            if (_.isArray(lbl)) {
                s = lbl[0];
                lbl = lbl[1];
            }
            var li = $('<li data-series="'+s+'"></li>');
            li.append('<div class="color">×</div><label>'+lbl+'</label>');
            if (sel[s]) {
                $('.color', li).html('').css('background', sel[s]);
                li.data('color', sel[s]);
            }
            $('#customColors .dataseries').append(li);
        }

        function dataseriesClick(e) {
            var li = e.target.nodeName.toLowerCase() == 'li' ? $(e.target) : $(e.target).parents('li');
            if (!e.shiftKey) $('#customColors .dataseries li').removeClass('selected');
            if (e.shiftKey && li.hasClass('selected')) li.removeClass('selected');
            else li.addClass('selected');
            customColorSelectSeries();

            if (e.shiftKey) { // clear selection
                if (window.getSelection) {
                    if (window.getSelection().empty) {  // Chrome
                        window.getSelection().empty();
                    } else if (window.getSelection().removeAllRanges) {  // Firefox
                        window.getSelection().removeAllRanges();
                    }
                } else if (document.selection) {  // IE?
                    document.selection.empty();
                }
            }
        }

        function userColorKeyUp(e) {
            var col = usercolor.val();
            if (col.trim() == '') {
                usercolor.parent().removeClass('error').removeClass('success');
            } else {
                try {
                    var color = chroma.color(col.trim());
                    usercolor.parent().removeClass('error').addClass('success');
                    setNewColorForCurrentSeries(color.hex());
                } catch (e) {
                    usercolor.parent().removeClass('success').addClass('error');
                }
            }
        }

        function customColorsClick(e) {
            e.preventDefault();
            $('#customColors').modal();
            customColorSelectSeries();
        }

        // called whenever the user selects a new series
        function customColorSelectSeries() {
            var li = $('#customColors .dataseries li.selected');
            var palette = $('#palette-colors').data('colors').split(',');
            if (palette.indexOf(li.data('color')) < 0) $('#user-color').val(li.data('color'));
            else $('#user-color').val('');

            $('#palette-colors')
              .data('color', li.data('color'))
              .colorpicker({
                change: function(color) {
                    $('#user-color').val('');
                    setNewColorForCurrentSeries(color);
                }
            });
        }

        // set a new color and save
        function setNewColorForCurrentSeries(color) {
            var sel = $.extend({}, chart.get('metadata.visualize.custom-colors', {})),
                li = $('#customColors .dataseries li.selected');
            $('.color', li)
                .css('background', color)
                .html('');
            li.data('color', color);
            li.each(function(i, el) {
                sel[$(el).data('series')] = color;
            });
            chart.set('metadata.visualize.custom-colors', sel);
        }

        // action for "reset all colors" button
        function resetColorChoice(e) {
            var li = $('#customColors .dataseries li.selected');
            li.data('color', '');
            $('.color', li)
                .css('background', '')
                .html('×');
            var sel = $.extend({}, chart.get('metadata.visualize.custom-colors', {}));
            li.each(function(i, li) {
                sel[$(li).data('series')] = '';
            });
            chart.set('metadata.visualize.custom-colors', sel);
        }

        function resetAllColors(e) {
            $('#customColors .dataseries li .color').html('×').css('background', '');
            $('#customColors .dataseries li').data('color', '');
            chart.set('metadata.visualize.custom-colors', {});
        }
    }

    return initCustomColors;
});