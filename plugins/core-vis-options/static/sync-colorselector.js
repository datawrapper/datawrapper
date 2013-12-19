$(function() {

    // column select
    dw.backend.on('sync-option:base-color', sync);


    function sync(args) {

        var chart = args.chart,
            vis = args.vis,
            theme_id = chart.get('theme'),
            labels = vis.keys(),
            $el = $('#'+args.key),
            $picker = $('.base-color-picker', $el);

        if (dw.theme(theme_id)) themesAreReady();
        else dw.backend.one('theme-loaded', themesAreReady);

        function themesAreReady() {

            var theme = dw.theme(theme_id);

            if (!args.option.hideBaseColorPicker) initBaseColorPicker();
            if (!args.option.hideCustomColorSelector) initCustomColorSelector();

            /*
             * initializes the base color dropdown
             */
            function initBaseColorPicker() {
                var curColor = chart.get('metadata.visualize.base-color', 0);
                if (!_.isString(curColor)) curColor = theme.colors.palette[curColor];
                // update base color picker
                $picker
                    .css('background', curColor)
                    .click(function() {
                        $picker.colorselector({
                            color: curColor,
                            palette: [].concat(theme.colors.palette, theme.colors.secondary),
                            change: baseColorChanged
                        });
                    });

                function baseColorChanged(color) {
                    $picker.css('background', color);
                    var palIndex = theme.colors.palette.join(',')
                        .toLowerCase()
                        .split(',')
                        .indexOf(color);
                    chart.set(
                        'metadata.visualize.base-color',
                        palIndex < 0 ? color : palIndex
                    );
                    curColor = color;
                }
            }

            /*
             * initializes the custom color dialog
             */
            function initCustomColorSelector() {
                var labels = vis.keys(),
                    sel = chart.get('metadata.visualize.custom-colors', {}),
                    $head = $('.custom-color-selector-head', $el),
                    $body = $('.custom-color-selector-body', $el),
                    $customColorBtn = $('.custom', $head),
                    $labelUl = $('.dataseries', $body),
                    $resetAll = $('.reset-all-colors', $body);

                if (_.isEmpty(labels)) {
                    $head.hide();
                    return;
                }
                $head.show();

                $customColorBtn.click(function(e) {
                    e.preventDefault();
                    $body.toggle();
                    $customColorBtn.toggleClass('active');
                });

                $resetAll.click(resetAllColors);

                // populate custom color selector
                $.each(labels, addLabelToList);

                $('.select-all', $body).click(function() {
                    $('li', $labelUl).addClass('selected');
                    customColorSelectSeries();
                });
                $('.select-none', $body).click(function() {
                    $('li', $labelUl).removeClass('selected');
                    customColorSelectSeries();
                });
                $('.select-invert', $body).click(function() {
                    $('li', $labelUl).toggleClass('selected');
                    customColorSelectSeries();
                });

                function addLabelToList(i, lbl) {
                    var s = lbl;
                    if (_.isArray(lbl)) {
                        s = lbl[0];
                        lbl = lbl[1];
                    }
                    var li = $('<li data-series="'+s+'"></li>')
                        .append('<div class="color">×</div><label>'+lbl+'</label>')
                        .appendTo($labelUl)
                        .click(click);
                    if (sel[s]) {
                        $('.color', li).html('').css('background', sel[s]);
                        li.data('color', sel[s]);
                    }

                    function click(e) {
                        if (!e.shiftKey) $('li', $labelUl).removeClass('selected');
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
                }

                // called whenever the user selects a new series
                function customColorSelectSeries() {
                    var li = $('li.selected', $labelUl),
                        $colPicker = $('.color-picker', $body),
                        $reset = $('.reset-color', $body);

                    if (li.length > 0) {
                        $('.info', $body).hide();
                        $('.select', $body).show();
                        $colPicker.click(function() {
                            $colPicker.colorselector({
                                color: li.data('color'),
                                palette: [].concat(theme.colors.palette, theme.colors.secondary),
                                change: function(color) {
                                    $colPicker.css('background', color);
                                    update(color);
                                }
                            });
                        }).css('background', li.data('color') || '#fff');
                        $reset.off('click').on('click', reset);
                    } else {
                        $('.info', $body).show();
                        $('.select', $body).hide();
                    }

                    // set a new color and save
                    function update(color) {
                        var sel = $.extend({}, chart.get('metadata.visualize.custom-colors', {}));
                        $('.color', li)
                            .css('background', color)
                            .html('');
                        li.data('color', color);
                        li.each(function(i, el) {
                            sel[$(el).data('series')] = color;
                        });
                        chart.set('metadata.visualize.custom-colors', sel);
                    }

                    // reset selected colors and save
                    function reset() {
                        var sel = $.extend({}, chart.get('metadata.visualize.custom-colors', {}));
                        li.data('color', undefined);
                        $('.color', li)
                            .css('background', '')
                            .html('×');
                        li.each(function(i, li) {
                            sel[$(li).data('series')] = '';
                        });
                        chart.set('metadata.visualize.custom-colors', sel);
                        $colPicker.css('background', '#fff');
                    }
                }

                function resetAllColors() {
                    $('li .color', $labelUl).html('×').css('background', '');
                    $('li', $labelUl).data('color', undefined);
                    $('.color-picker', $body).css('background', '#fff');
                    chart.set('metadata.visualize.custom-colors', {});
                }
            }
        }

    }



});
