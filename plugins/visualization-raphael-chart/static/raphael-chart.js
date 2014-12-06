(function(){

    // Base class for Raphael charts
    // -----------------------------

    dw.visualization.register('raphael-chart', {

        init: function() {
            this.__elements = {};
            this.__labels = {};
        },

        update: function(row) {
            console.warn('vis.update(): override me!', row);
        },

        setRoot: function(el) {
            var me = this;
            me.__root = el;
            el.css({
                position: 'relative'
            });
            el.addClass(me.chart().get('type'));
        },

        getSize: function() {
            return [this.__w, this.__h];
        },

        /*
         * initializes the Raphael canvas and some other stuff
         *
         * @param canvas  hash of custom settings
         * @param w_sub   reduces the width of the chart area
         * @param h_sub   reduces the height of the chart area
         */
        initCanvas: function(canvas, w_sub, h_sub) {
            var me = this,
                el = me.__root,
                size = me.size(),
                theme = me.theme();
            canvas = _.extend({
                w: size[0] - (w_sub || 0),
                h: size[1] - (h_sub || 0),
                rpad: theme.padding.right,
                lpad: theme.padding.left,
                bpad: theme.padding.bottom,
                tpad: theme.padding.top
            }, canvas);

            if (size[0] <= 100) {
                // no padding if generating thumbnail
                canvas.bpad = canvas.tpad = canvas.lpad = canvas.rpad = 5;
                canvas.bpad = canvas.tpad = 15;
            }

            canvas.root = el;
            canvas.paper = Raphael(el[0], canvas.w, canvas.h+2);
            el.height(canvas.h);
            $('.tooltip').hide();
            me.__canvas = canvas;

            // add some nice easing
            Raphael.easing_formulas.expoInOut = function (n, time, beg, diff, dur) {
                dur = 1000;
                time = n*1000;
                beg = 0;
                diff = 1;
                if (time===0) return beg;
                if (time==dur) return beg+diff;
                if ((time/=dur/2) < 1) return diff/2 * Math.pow(2, 10 * (time - 1)) + beg;
                return diff/2 * (-Math.pow(2, -10 * --time) + 2) + beg;
            };
            $.extend(jQuery.easing, {
                expoIn: function (x, t, b, c, d) {
                    return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
                },
                expoOut: function (x, t, b, c, d) {
                    return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
                },
                expoInOut: function (x, t, b, c, d) {
                    if (t==0) return b;
                    if (t==d) return b+c;
                    if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
                    return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
                }
            });
            return canvas;
        },

        onMouseMove: function(e) {
            var me = this,
                x = e.pageX,
                y = e.pageY,
                hovered_key = this.getKeyByPoint(x, y, e),
                row = this.getDataRowByPoint(x, y),
                theme = me.theme(),
                hoveredNode = hovered_key !== null;

            if (!hovered_key) hovered_key = me.getKeyByLabel();

            if (!hovered_key) {
                // nothing hovered
                clearTimeout(me.__mouseOverTimer);
                me.__mouseOutTimer = setTimeout(function() {
                    clearTimeout(me.__mouseOverTimer);
                    clearTimeout(me.__mouseOutTimer);
                    if (theme.hover) me.hover();
                    if (theme.tooltip) me.hideTooltip();
                }, 200);
            } else {
                if (me.__mouseOutTimer) clearTimeout(me.__mouseOutTimer);
                me.__mouseOverTimer = setTimeout(function() {
                    clearTimeout(me.__mouseOverTimer);
                    clearTimeout(me.__mouseOutTimer);
                    if (theme.hover) me.hover(hovered_key);
                    //if (theme.tooltip && hoveredNode) me.showTooltip(series, row, x, y);
                }, 100);
            }
        },

        /*
         * registers an element under the specified key
         */
        registerElement: function(el, key, row) {
            el.data('key', key);
            if (_.isNumber(row)) el.data('row', row);
            if (!this.__elements[key]) {
                this.__elements[key] = [];
            }
            this.__elements[key].push(el);
            return el;
        },

        /*
         * register a label under the specified key
         */
        registerLabel: function(lbl, key, column, row) {
            var me = this;

            lbl.data('key', key);
            if (column && !_.isUndefined(row)) {
                lbl.el.attr('data-column', column);
                lbl.el.attr('data-row', row);
            }

            if (!me.__labels[key]) {
                me.__labels[key] = [];
            }

            me.__labels[key].push(lbl);
            lbl.on('mouseenter', function(e) {
                me.__hoveredLabel = e.target;
                clearTimeout(me.__mouseLeaveTimer);
            });
            lbl.on('mouseleave', function() {
                me.__mouseLeaveTimer = setTimeout(function() {
                    me.__hoveredLabel = null;
                }, 100);
            });

            return lbl;
        },

        getLabels: function(key) {
            return this.__labels[key] || [];
        },

        hover: function(hover_key) {
            var keyElements = this.__elements;
            _.each(keyElements, function(elements, key) {
                var h = !hover_key || key == hover_key;
                _.each(elements, function(el) {
                    el.animate({ opacity: h ? 1 : 0.5 }, 80);
                });
            });

            var keyLabels = this.__labels;
            _.each(keyLabels, function(labels, key) {
                var h = !hover_key || key == hover_key;
                _.each(labels, function(lbl) {
                    //lbl.el.css({ opacity: h ? 1 : 0.5 });
                    if (key == hover_key) lbl.addClass('highlighted');
                    else lbl.removeClass('highlighted');
                });
            });
        },

        path: function(pathdata, className) {
            var p = this.__canvas.paper.path(pathdata);
            if (className && Raphael.svg) {
                $(p.node).attr('class', className);
            }
            return p;
        },

        /**
         * Creates a HTML label. This is used extensively by all visualizations
         * based on raphael-chart. Using HTML instead of SVG has several benefits.
         */
        label: function(x, y, txt, _attrs) {

            var me = this,
                lbl,  // $(<div class="label" />)
                attrs = {  // default attributes
                    root: this.__canvas.root,
                    align: 'left',
                    valign: 'middle',
                    cl: '',
                    rotate: 0,
                    css: {
                        position: 'absolute',
                        width: _attrs.w ? _attrs.w : 'auto'
                    },
                    x: x,
                    y: y,
                    txt: txt
                };

            $.extend(true, attrs, _attrs || {});

            lbl = $('<div class="label'+(attrs.cl ? ' '+attrs.cl : '')+'"><span>'+txt+'</span></div>');
            lbl.css(attrs.css);
            lbl.css({ 'text-align': attrs.align });
            attrs.root.append(lbl);

            // compute the label position according to text and align
            function position() {
                var w = attrs.w || me.labelWidth(attrs.txt, attrs.cl, attrs.size),
                    h = attrs.h || lbl.height(),
                    x = attrs.x,
                    y = attrs.y,
                    rot_w = 100;
                var css = attrs.rotate == -90 ? {
                    // rotated
                    left: x - rot_w * 0.5,
                    top: attrs.valign == 'top' ? y + rot_w * 0.5 : y - rot_w * 0.5,
                    width: rot_w,
                    height: 20,
                    'text-align': attrs.valign == 'top' ? 'right' : 'left'
                } : {
                    // not rotated
                    left: attrs.align == 'left' ? x : attrs.align == 'center' ? x - w * 0.5 : x - w,
                    top: y - h * (attrs.valign == 'top' ? 0 : attrs.valign == 'middle' ? 0.5 : 1),
                    width: w,
                    height: h
                };
                if (attrs.size) {
                    css['font-size'] = attrs.size;
                }
                return css;
            }

            // create label DIV element
            lbl.css($.extend({}, attrs.css, position()));

            if (attrs.rotate == -90) {
                lbl.css({
                    '-moz-transform': 'rotate(-90deg)',
                    '-webkit-transform': 'rotate(-90deg)',
                    '-ms-transform': 'rotate(-90deg)',
                    '-o-transform': 'rotate(-90deg)',
                    'filter': 'progid:DXImageTransform.Microsoft.BasicImage(rotation=3)'
                });
            }
            var label = { el: lbl };
            // update label text
            label.text = function(txt) {
                if (arguments.length) {
                    $('span', lbl).html(txt);
                    return label;
                }
                return $('span', lbl).html();
            };
            // animate label attributes
            label.animate = function(_attrs, duration, easing) {
                //
                if (_attrs.align != attrs.align) {
                    setTimeout(function() {
                        lbl.css({ 'text-align': _attrs.align });
                    }, duration ? duration * 0.5 : 10);
                }
                if (attrs.rotate && _attrs.valign != attrs.valign) {
                    setTimeout(function() {
                        lbl.css({ 'text-align': _attrs.valign == 'top' ? 'right' : 'left' });
                    }, duration ? duration * 0.5 : 10);
                }
                if (_attrs.txt != attrs.txt) label.text(_attrs.txt);
                $.extend(attrs, _attrs);
                var _css = $.extend({}, attrs.css, position());
                return duration ? lbl.stop().animate(_css, duration, easing) : lbl.css(_css);
            };
            label.attr = label.animate;
            // wrap lbl.data
            label.data = function() { return lbl.data.apply(lbl, arguments); };
            label.hide = function() { return lbl.hide.apply(lbl, arguments); };
            label.show = function() { return lbl.show.apply(lbl, arguments); };
            label.width = function() { return lbl.width.apply(lbl, arguments); };
            label.height = function() { return lbl.height.apply(lbl, arguments); };
            label.left = function() { return lbl.offset().left; };
            label.top = function() { return lbl.offset().top; };
            label.on = function() { return lbl.on.apply(lbl, arguments); };
            label.hasClass = function() { return lbl.hasClass.apply(lbl, arguments); };
            label.addClass = function() { return lbl.addClass.apply(lbl, arguments); };
            label.removeClass = function() { return lbl.removeClass.apply(lbl, arguments); };
            label.remove = function() { return lbl.remove.apply(lbl, arguments); };

            lbl.data('label', label);

            return label;
        },

        labelWidth: function(txt, className, fontSize) { // lazy evaluation
            var lbl,
                span,
                $span,
                ow,
                root = this.__root.get(0);

            lbl = document.createElement('div');
            lbl.style.position = 'absolute';
            lbl.style.left = '-10000px';
            span = document.createElement('span');
            lbl.appendChild(span);
            $span = $(span);

            root.appendChild(lbl);

            ow = !_.isUndefined(span.offsetWidth) ?
                function() { return span.offsetWidth; } :
                function() { return $span.outerWidth(); };

            function labelWidth(txt, className, fontSize) {
                // returns the width of a label
                lbl.setAttribute('class', 'label '+(className ? ' '+className : ''));
                span.style.fontSize = fontSize ? fontSize : null;
                span.innerHTML = txt;
                return ow();
            }
            this.labelWidth = labelWidth;
            return labelWidth(txt, className, fontSize);
        },

        labelHeight: function(txt, className, width, fontSize) {
            var lbl,
                span,
                $span,
                oh,
                root = this.__root.get(0);

            lbl = document.createElement('div');
            lbl.style.position = 'absolute';
            lbl.style.left = '-10000px';
            span = document.createElement('span');
            lbl.appendChild(span);
            $span = $(span);

            root.appendChild(lbl);

            oh = !_.isUndefined(span.offsetHeight) ?
                function() { return span.offsetHeight; } :
                function() { return $span.height(); };

            function labelHeight(txt, className, width, fontSize) {
                // returns the width of a label
                lbl.setAttribute('class', 'label '+(className ? ' '+className : ''));
                lbl.style.width = width+'px';
                span.style.fontSize = fontSize ? fontSize : null;
                span.innerHTML = txt;
                return oh();
            }
            this.labelHeight = labelHeight;
            return labelHeight(txt, className, width, fontSize);
        },

        orderSeriesElements: function() {
            // put highlighted lines on top
            var me = this;
            _.each(me.dataset.columns(), function(column) {
                if (me.chart().isHighlighted(column)) {
                    _.each(me.__elements[column.name()], function(el) {
                        el.toFront();
                    });
                }
            });
        },

        getKeyByPoint: function(x, y, evt) {
            var me = this,
                el = me.__canvas.paper.getElementByPoint(x, y);
            if (!el) {
                el = $(evt.target);
                if (!el.hasClass('label')) el = el.parents('.label');
            }
            if (el && el.data('key')) return el.data('key');
            return null;
        },

        getKeyByLabel: function() {
            var me = this;
            if (me.__hoveredLabel) {
                lbl = $(me.__hoveredLabel);
                if (me.__hoveredLabel.nodeName.toLowerCase() == 'span') lbl = lbl.parent();
                if (lbl.data('key')) return lbl.data('key');
            }
            return null;
        },

        getDataRowByPoint: function(x, y) {
            // needs to be implemented by each visualization
            throw 'getDataRowByPoint() needs to be implemented by each visualization';
        },

        _baseColor: function() {
            var me = this,
                base = me.get('base-color', 0),
                palette = me.theme().colors.palette,
                fromPalette = !_.isString(base);
            return fromPalette ? palette[base] : base;
        },

        _getColor: function(series, row, opts) {
            var me = this,
                key = opts.key;

            if (!key && series) {
                key = series.name();
            }

            if (key) {
                // check if user has selected a custom color for this key
                var customColors = me.get('custom-colors', {});
                if (customColors[key]) return customColors[key];
            }

            // check if we have a color scale
            if (opts.byValue && series) {
                return opts.byValue(series.val(row));
            }

            // eventually the visualization has requested colors
            if (series && me.__colors && me.__colors[key]) {
                return me.__colors[key];
            }

            // cycle through palette opts.usePalette is true
            var palette = me.theme().colors.palette,
                baseColor = me._baseColor();

            if (opts.usePalette) {
                return palette[(Math.max(0, palette.indexOf(baseColor)) + row) % palette.length];
            }

            // opts.varyLightness for each row
            if (opts.varyLightness) {
                var lab = chroma.color(baseColor).lab(),
                    minL = Math.min(lab[0], 50),
                    maxL = 91,
                    f = row / (me.dataset.numRows()-1);
                return chroma.lab(minL + f * (maxL - minL), lab[1], lab[2]).hex();
            }

            // otherwise just return the base color
            return baseColor;
        },

        getColor: function(series, row, opts) {
            var me = this,
                chart = me.chart(),
                color = me._getColor(series, row, opts);

            // modify colors to indicate highlighting
            if (series && chart.hasHighlight() && !chart.isHighlighted(series)) {
                // mix color with background
                return chroma.interpolate(color, me.theme().colors.background, 0.65, 'rgb').hex();
            }
            return color;
        },

        getKeyColor: function(_key, _value, _useNegativeColor, _colorful) {
            var me = this,
                palette = me.theme().colors.palette,
                colorByRow = me.meta['color-by'] == 'row',
                colorCache = {};

            function keyColor(key, value, useNegativeColor, colorful) {
                var color;

                key = String(key);

                var userCustomColors = me.get('custom-colors', {});

                // user has defined a colors for this key
                if (userCustomColors[key]) {
                    color = userCustomColors[key];

                } else if (value && useNegativeColor) {
                    // if requested we display negative values in different color
                    color = me.theme().colors[value < 0 ? 'negative' : 'positive'];
                } else {
                    // if the visualization has defined custom series colors, let's use them
                    if (key && me.__customColors && me.__customColors[key])
                        color = me.__customColors[key];
                    // use base color
                    else color = me._baseColor();
                }

                var key_color = chroma.hex(color),
                    bg_color = chroma.hex(me.theme().colors.background),
                    bg_lch = bg_color.lch();

                if (key && !me.chart().isHighlighted(key)) {
                    if (!colorCache[color+'-hl']) {
                        colorCache[color+'-hl'] = chroma.interpolate(key_color, bg_color, bg_lch[0] < 60 ? 0.7 : 0.63);
                    }
                    return colorCache[color+'-hl'];
                }
                return color;
            }

            me.getKeyColor = keyColor;
            return keyColor(_key, _value, _useNegativeColor, _colorful);
        },

        setKeyColor: function(key, color) {
            var me = this;
            if (!me.__customColors) me.__customColors = {};
            me.__customColors[key] = color;
        },

        getYTicks: function(yscale, h, noDomain, useLogScale) {
            var me = this,
                domain = yscale.domain(),
                ticks = useLogScale ? dw.utils.logTicks(domain[0], domain[1]) : yscale.ticks(h / 80),
                bt = yscale(ticks[0]),
                tt = yscale(ticks[ticks.length-1]);

            if (!noDomain) {
                if (Math.abs(yscale(domain[0]) - bt) < 30) ticks.shift();
                if (Math.abs(tt - yscale(domain[1])) < 30) ticks.pop();

                ticks.unshift(domain[0]);
                ticks.push(domain[1]);
            }
            return ticks;
        },

        /**
         * checks whether a label needs to be inverted depending
         * on a given label background color (col) and the theme background.
         *
         * returns true if a label needs to be inverted
         */
        invertLabel: function(col) {
            var c = chroma.color(col),
                bg = chroma.color(this.theme().colors.background);
            return bg.lab()[0] > 60 ?  // check if background is whitish
                c.lab()[0] < 80 :  //
                c.lab()[0] > 60;
        },

        /**
         * returns a signature for this visualization which will be used
         * to test correct rendering of the chart in different browsers.
         */
        signature: function() {
            var me = this,
                sig = { type: 'raphael-chart', el: {} };
            $.each(me.__elements, function(key, elements) {
                sig.el[key] = elements.length;
            });
            return sig;
        },

        addLegend: function(items, container) {
            // add legend
            var me = this,
                l = $('<div class="legend"></div>'),
                xo = me.__canvas.lpad;

            _.each(items, function(item) {
                div = $('<div></div>');
                div.css({
                    background: item.color,
                    width: 12,
                    height: 12,
                    position: 'absolute',
                    left: xo,
                    top: 1
                });
                l.append(div);
                lbl = me.label(xo + 15, 0, item.label, {
                    valign: 'left',
                    root: l
                });
                xo += me.labelWidth(item.label)+30;
            });
            l.css({
                position: 'relative'
            });
            container.append(l);
        },


        optimizeLabelPositions: function(labels, pad, valign) {
            if (!labels.length) return;
            var i = 1,
                c = valign == 'top' ? 0 : valign == 'middle' ? 0.5 : 1,
                min_y = labels[0].el.parent().offset().top,
                max_y = min_y + labels[0].el.parent().height();

            labels = _.filter(labels, function(lbl) { return lbl.el.is(":visible"); });
            if (!labels.length) return;
            _.each(labels, function(lbl) {
                lbl.__noverlap = {
                    otop: lbl.top(),
                    top: lbl.top(),
                    dy: 0
                };
                lbl.height('auto');
            });
            (function loop() {
                var overlap = false;
                _.each(labels, function(lbl0, p) {
                    _.each(labels, function(lbl1, q) {
                        if (q > p) {
                            var l0 = lbl0.left(), l1 = lbl1.left(),
                                r0 = l0 + lbl0.width(), r1 = l1 + lbl1.width(),
                                t0 = lbl0.__noverlap.top - pad, t1 = lbl1.__noverlap.top - pad,
                                b0 = t0 + lbl0.height() + pad * 2, b1 = t1 + lbl1.height() + pad * 2,
                                dy, l0up;
                            if (!(l1 > r0 || r1 < l0 || t1 > b0 || b1 < t0)) {
                                overlap = true;
                                dy = Math.min(b0, b1) - Math.max(t0, t1);
                                l0up = t0 + (b0 - t0) * c < t1 + (b1 - t1) * c;
                                lbl0.__noverlap.dy += dy * 0.5 * (l0up ? -1 : 1);
                                lbl1.__noverlap.dy += dy * 0.5 * (l0up ? 1 : -1);
                            }
                        }
                    });
                });
                if (overlap) {
                    _.each(labels, function(lbl) {
                        lbl.__noverlap.top = Math.max(min_y, lbl.__noverlap.top + lbl.__noverlap.dy);
                        lbl.__noverlap.dy = 0;
                    });
                }
                if (overlap && ++i < 10) loop();
            })();  // end loop()
            _.each(labels, function(lbl) {
                lbl.el.css({ top: lbl.__noverlap.top - lbl.el.parent().offset().top });  // apply new label pos
            });
        },

        checkBrowserCompatibility: function(){
            return window['Raphael'] && Raphael.type;
        },

        clear: function() {
            var me = this;
            _.each(me.__elements, function(elements) {
                _.each(elements, function(el) { el.remove(); });
            });
            _.each(me.__labels, function(elements) {
                _.each(elements, function(el) { el.remove(); });
            });
            me.__elements = {};
            me.__labels = {};
        },

        _svgCanvas: function() {
            return this.__canvas.paper.canvas;
        }

    });


}).call(this);


// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller
// fixes from Paul Irish and Tino Zijdel

(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] ||
                                    window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());
