
define(function() {

    return function() {
        /*
         * API-draft:
         *
         * $('button').colorselector({
              color: '#ff0000'  // current selection
         *    palette: ['#fe8843', '#48cd45', ...],  // theme palette
         *    change: function(new_color) { }  // called after user closed popup
         * });
         */
        $.fn.colorselector = function(opts) {
            $('.color-selector').remove();
            var btn = $(this),
                popup = $('<div />')
                    .addClass('color-selector')
                    .css({
                        left: btn.offset().left - 70,
                        top: btn.offset().top - 40 // 30px = body.padding-top
                    })
                    .appendTo('body'),
                palette = $('<div />').addClass('palette').appendTo(popup),
                lightness = $('<div />').addClass('color-axis lightness').appendTo(popup),
                saturation = $('<div />').addClass('color-axis saturation').appendTo(popup),
                hue = $('<div />').addClass('color-axis hue').appendTo(popup),
                bottom = $('<div />').addClass('footer').appendTo(popup),
                hexTf = $('<input type="text" />').addClass('hex').appendTo(bottom),
                okBtn = $('<button />').html('<i class="icon-ok"></i>').addClass('btn btn-small ok').appendTo(bottom);

            addcol(opts.color, bottom);

            // initialize palette colors
            $.each(opts.palette, function(i, color) {
                addcol(color, palette);
            });

            setColor(opts.color);

            function closePopup() {
                popup.remove();
                if (_.isFunction(opts.change)) opts.change(opts.color);
            }

            hexTf.change(function() { setColor(hexTf.val()); });
            okBtn.click(closePopup);

            setTimeout(function() {
                $('body').one('click', body_click);
            }, 300);

            function setColor(hex, cont) {
                var lch = chroma.color(hex).lch(),
                    center = [60, 50, lch[2]],
                    spread_ = [55, 50, 70],
                    steps = [7, 7, 7],
                    steps2 = [6, 6, 6];

                opts.color = hex;
                _.each([lightness, saturation, hue], function(cnt, i) {
                    if (cont != cnt || cont == hue) {
                        cnt.html('');
                        var values = spread(center[i], spread_[i], steps[i], steps2[i]);
                        // shift center to match color
                        center[i] += lch[i] - dw.utils.nearest(values, lch[i]);
                        _.each(spread(center[i], spread_[i], steps[i], steps2[i]), function(x) {
                            var lch_ = lch.slice(0);
                            lch_[i] = x;
                            addcol(chroma.lch(lch_).hex(), cnt);
                        });
                    }
                });
                hexTf.val(hex).css({
                    background: hex,
                    'border-color': chroma.color(hex).darker().hex(),
                    color: chroma.luminance(hex) > 0.45 ? '#000' : '#fff'
                });
                $('.color', popup).removeClass('selected').removeClass('inverted');
                $('.color', popup)
                    .filter(function(i,e) { return $(e).data('color') == hex; })
                    .addClass('selected');
                if ($('.color.selected', hue).length > 2) {
                    $('.color.selected', hue).removeClass('selected');
                }
                $('.color.selected', popup)
                    .filter(function(i,e) {
                        return chroma.luminance($(e).data('color')) < 0.05;
                    }).addClass('inverted');
            }

            function spread(center, width, num, num2, exp) {
                var r = [center], s = width / num, a = 0;
                num2 = _.isUndefined(num2) ? num : num2;
                exp = exp || 1;
                while (num-- > 0) {
                    a += s;
                    r.unshift(center - a);
                    if (num2-- > 0) r.push(center + a);
                }
                return r;
            }

            function addcol(color, cont) {
                $('<div />')
                    .addClass('color')
                    .data('color', color)
                    .css('background', color)
                    .click(function(evt) {
                        var c = $(evt.target);
                        setColor(c.data('color'), cont);
                        // stop propagation so body.click won't fire
                        evt.stopPropagation();
                    })
                    .dblclick(function(evt) {
                        var c = $(evt.target);
                        opts.color = c.data('color');
                        closePopup();
                    })
                    .appendTo(cont);
            }

            function body_click(evt) {
                var el = $(evt.target);
                if (!el.is('.color-selector') && el.parents('.color-selector').length === 0) {
                    popup.remove();
                } else {
                    $('body').one('click', body_click);
                }
            }
        };
    };

});