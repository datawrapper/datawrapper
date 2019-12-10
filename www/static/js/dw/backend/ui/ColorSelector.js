/* globals $, dw, define _ */
define(['chroma'], function(chroma) {
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
            var btn = $(this);
            var popup = $('<div />')
                .addClass('color-selector')
                .css({
                    left: btn.offset().left - 70,
                    top: btn.offset().top - 40 // 30px = body.padding-top
                })
                .appendTo('body');
            var colorAxes = {};
            var colorAxesConfig = {};
            var hexEditable = opts.config && opts.config.controls && opts.config.controls.hexEditable;
            var rowCount = opts.config && opts.config.rowCount ? opts.config.rowCount : false;
            ['hue', 'saturation', 'lightness'].forEach(function(key) {
                if (opts.config) {
                    colorAxesConfig[key] = opts.config.controls[key];
                } else {
                    colorAxesConfig[key] = true;
                }
            });

            var palette = $('<div />')
                .addClass('palette')
                .appendTo(popup);
            if (colorAxesConfig.lightness) {
                var lightness = $('<div />')
                    .addClass('color-axis lightness')
                    .appendTo(popup);
                colorAxes.lightness = lightness;
            }
            if (colorAxesConfig.saturation) {
                var saturation = $('<div />')
                    .addClass('color-axis saturation')
                    .appendTo(popup);
                colorAxes.saturation = saturation;
            }
            if (colorAxesConfig.hue) {
                var hue = $('<div />')
                    .addClass('color-axis hue')
                    .appendTo(popup);
                colorAxes.hue = hue;
            }
            var bottom = $('<div />')
                .addClass('footer')
                .appendTo(popup);
            var hexTf = $("<input class='hex" + (hexEditable ? '' : ' readonly') + "' type='text'" + (hexEditable ? '' : ' readonly') + '/>')
                .addClass('hex')
                .appendTo(bottom);
            var okBtn = $('<button />')
                .html('<i class="icon-ok"></i>')
                .addClass('btn btn-small ok')
                .appendTo(bottom);

            addcol(opts.color, bottom);
            // initialize palette colors
            if (opts.config.groups) {
                $.each(opts.config.groups, function(i, group) {
                    addGroup(group, palette);
                });
            } else {
                $.each(opts.palette, function(i, color) {
                    addcol(color, palette, true);
                });
            }

            setColor(opts.color);

            function closePopup() {
                popup.remove();
                if (_.isFunction(opts.change)) opts.change(opts.color);
            }

            hexTf.change(function() {
                setColor(hexTf.val());
            });
            okBtn.click(closePopup);

            setTimeout(function() {
                $('body').one('click', body_click);
            }, 300);

            function setColor(hex, cont) {
                hex = hex || opts.palette[0];
                var lch = chroma(hex).lch();
                var center = [60, 50, lch[2]];
                var spread_ = [55, 50, 70];
                var steps = [7, 7, 7];
                var steps2 = [6, 6, 6];

                opts.color = hex;

                Object.keys(colorAxes).forEach(function(key, i) {
                    if (cont !== colorAxes[key] || (key === 'hue' && cont === colorAxes.hue)) {
                        colorAxes[key].html('');
                        var values = spread(center[i], spread_[i], steps[i], steps2[i]);
                        // shift center to match color
                        center[i] += lch[i] - dw.utils.nearest(values, lch[i]);
                        _.each(spread(center[i], spread_[i], steps[i], steps2[i]), function(x) {
                            var lch_ = lch.slice(0);
                            lch_[i] = x;
                            addcol(chroma.lch(lch_).hex(), colorAxes[key]);
                        });
                    }
                });
                hexTf.val(hex).css({
                    background: hex,
                    'border-color': chroma(hex)
                        .darker()
                        .hex(),
                    color:
                        chroma(hex).luminance() > 0.45
                            ? 'rgba(0,0,0,' + (hexEditable ? 1 : 0.3) + ')'
                            : 'rgba(255,255,255,' + (hexEditable ? 1 : 0.6) + ')'
                });
                $('.color', popup)
                    .removeClass('selected')
                    .removeClass('inverted');
                $('.color', popup)
                    .filter(function(i, e) {
                        return $(e).data('color') === hex;
                    })
                    .addClass('selected');
                if (colorAxesConfig.hue && $('.color.selected', colorAxes.hue).length > 2) {
                    $('.color.selected', colorAxes.hue).removeClass('selected');
                }
                $('.color.selected', popup)
                    .filter(function(i, e) {
                        return chroma($(e).data('color')).luminance() < 0.05;
                    })
                    .addClass('inverted');
                if (_.isFunction(opts.change)) opts.change(opts.color);
            }

            function spread(center, width, num, num2, exp) {
                var r = [center];
                var s = width / num;
                var a = 0;
                num2 = _.isUndefined(num2) ? num : num2;
                exp = exp || 1;
                while (num-- > 0) {
                    a += s;
                    r.unshift(center - a);
                    if (num2-- > 0) r.push(center + a);
                }
                return r;
            }
            function addGroup(group, cont) {
                var $group = $('<div class="color-group" />');
                $group.appendTo(cont);
                if (group.name) {
                    var $title = $('<div class="name">' + group.name + '</div>');
                    $title.appendTo($group);
                }
                $.each(group.colors, function(i, subgroup) {
                    var $subgroup = $('<div/>');
                    $subgroup.appendTo($group);
                    subgroup.forEach(function(color) {
                        addcol(color, $subgroup, true);
                    });
                });
            }

            function addcol(color, cont, resizeSwatch) {
                var swatchDims = rowCount ? (157 - 2 * rowCount) / rowCount : '';
                var styleString = resizeSwatch && rowCount ? "style='width: " + swatchDims + 'px; height: ' + swatchDims + "px'" : '';
                $('<div ' + styleString + ' />')
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
