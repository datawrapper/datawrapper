(function(){

    // Base class for Raphael charts
    // -----------------------------

    var RaphaelChart = Datawrapper.Visualizations.RaphaelChart = function() {};

    _.extend(RaphaelChart.prototype, Datawrapper.Visualizations.Base, {

        init: function() {
            this.__seriesElements = {};
            this.__seriesLabels = {};

            $('body').append('<div id="tooltip" class="tooltip"><div class="content"><b><span class="xval"></span></b><br /><span class="yval"></span></div></div>');
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
            el.addClass(me.chart.get('type'));
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
            var me = this, el = me.__root, size = me.getSize();
            canvas = _.extend({
                w: size[0] - (w_sub || 0),
                h: size[1] - (h_sub || 0),
                rpad: me.theme.padding.right,
                lpad: me.theme.padding.left,
                bpad: me.theme.padding.bottom,
                tpad: me.theme.padding.top
            }, canvas);

            if (size[0] <= 400) {
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
            Raphael.easing_formulas['expoInOut'] = function (n, time, beg, diff, dur) {
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
                series = this.getSeriesByPoint(x, y, e),
                row = this.getDataRowByPoint(x, y),
                hoveredNode = series !== null;

            if (!series) series = me.getSeriesByLabel();

            if (!series) {
                // nothing hovered
                clearTimeout(me.__mouseOverTimer);
                me.__mouseOutTimer = setTimeout(function() {
                    clearTimeout(me.__mouseOverTimer);
                    clearTimeout(me.__mouseOutTimer);
                    if (me.theme.hover) me.hoverSeries();
                    if (me.theme.tooltip) me.hideTooltip();
                }, 200);
            } else {
                if (me.__mouseOutTimer) clearTimeout(me.__mouseOutTimer);
                me.__mouseOverTimer = setTimeout(function() {
                    clearTimeout(me.__mouseOverTimer);
                    clearTimeout(me.__mouseOutTimer);
                    if (me.theme.hover) me.hoverSeries(series);
                    if (me.theme.tooltip && hoveredNode) me.showTooltip(series, row, x, y);
                }, 100);
            }
        },

        registerSeriesElement: function(el, series, row) {
            el.data('series', series);
            el.data('row', row);
            if (!this.__seriesElements[series.name]) {
                this.__seriesElements[series.name] = [];
            }
            this.__seriesElements[series.name].push(el);
            return el;
        },

        registerSeriesLabel: function(lbl, series) {
            var me = this;
            lbl.data('series', series);

            if (!this.__seriesLabels[series.name]) {
                this.__seriesLabels[series.name] = [];
            }

            this.__seriesLabels[series.name].push(lbl);
            lbl.on('mouseenter', function(e) {
                me.__hoveredSeriesLabel = e.target;
                clearTimeout(me.__mouseLeaveTimer);
            });
            lbl.on('mouseleave', function() {
                me.__mouseLeaveTimer = setTimeout(function() {
                    me.__hoveredSeriesLabel = null;
                }, 100);
            });

            return lbl;
        },

        hoverSeries: function(series) {
            var seriesElements = this.__seriesElements;
            _.each(seriesElements, function(elements, key) {
                var h = !series || key == series.name;
                _.each(elements, function(el) {
                    el.attr({ opacity: h ? 1 : 0.5 });
                });
            });

            var seriesLabels = this.__seriesLabels;
            _.each(seriesLabels, function(labels, key) {
                var h = !series || key == series.name;
                _.each(labels, function(lbl) {
                    lbl.css({ opacity: h ? 1 : 0.5 });
                    if (h) lbl.addClass('highlighted');
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
                        position: 'absolute'
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
                    rot_w = 60;
                var css = attrs.rotate == -90 ? {
                    // rotated
                    left: x - rot_w * 0.5,
                    top: y + 12,
                    width: rot_w,
                    height: 20,
                    'text-align': 'right'
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
                $('span', lbl).html(txt);
                return label;
            };
            // animate label attributes
            label.animate = function(_attrs, duration, easing) {
                //
                if (_attrs.align != attrs.align) {
                    setTimeout(function() {
                        lbl.css({ 'text-align': _attrs.align });
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
            label.on = function() { return lbl.on.apply(lbl, arguments); };
            label.hasClass = function() { return lbl.hasClass.apply(lbl, arguments); };
            label.addClass = function() { return lbl.addClass.apply(lbl, arguments); };
            label.removeClass = function() { return lbl.removeClass.apply(lbl, arguments); };
            label.remove = function() { return lbl.remove.apply(lbl, arguments); };

            lbl.data('label', label);

            return label;
        },

        labelWidth: function(txt, className, fontSize) {
            // returns the width of a label
            var l = $('<div class="label'+(className ? ' '+className : '')+'"><span>'+txt+'</span></div>');
            if (fontSize) $('span', l).css('font-size', fontSize);
            this.__root.append(l);
            var w = $('span', l).outerWidth();
            l.remove();
            return w;
        },

        labelHeight: function(txt, className, width, fontSize) {
            // returns the width of a label
            var l = $('<div class="label'+(className ? ' '+className : '')+'"><span>'+txt+'</span></div>');
            if (fontSize) $('span', l).css('font-size', fontSize);
            l.width(width);
            this.__root.append(l);
            var w = $('span', l).height();
            l.remove();
            return w;
        },

        orderSeriesElements: function() {
            // put highlighted lines on top
            var me = this;
            _.each(me.chart.dataSeries(), function(series) {
                if (me.chart.isHighlighted(series)) {
                    _.each(me.__seriesElements[series.name], function(el) {
                        el.toFront();
                    });
                }
            });
        },

        getSeriesByPoint: function(x, y, evt) {
            var me = this,
                el = me.__canvas.paper.getElementByPoint(x, y);
            if (!el) {
                el = $(evt.target);
                if (!el.hasClass('label')) el = el.parents('.label');
            }
            if (el && el.data('series')) return el.data('series');
            return null;
        },

        getSeriesByLabel: function() {
            var me = this;
            if (me.__hoveredSeriesLabel) {
                lbl = $(me.__hoveredSeriesLabel);
                if (me.__hoveredSeriesLabel.nodeName.toLowerCase() == 'span') lbl = lbl.parent();
                if (lbl.data('series')) return lbl.data('series');
            }
            return null;
        },

        getDataRowByPoint: function(x, y) {
            // needs to be implemented by each visualization
            throw 'getDataRowByPoint() needs to be implemented by each visualization';
        },

        _getColor: function(series, row, opts) {
            var me = this,
                key = opts.key;

            if (!key) {
                if (me.meta['color-by'] == 'row') {
                    key = me.chart.rowLabels()[row];
                } else {
                    key = series.name;
                }
            }
            // check if user has selected a custom color for this key
            var customColors = me.get('custom-colors', {});
            if (customColors[key]) return customColors[key];

            // check if we have a color scale
            if (opts.byValue) {
                return opts.byValue(series.data[row]);
            }

            // eventually the visualization has requested colors
            if (series && me.__colors && me.__colors[key]) {
                return me.__colors[key];
            }

            // cycle through palette opts.usePalette is true
            var palette = me.theme.colors.palette;
            if (opts.usePalette) {
                return palette[(Math.min(me.get('base-color', 0), palette.length-1) + row) % palette.length];
            }

            var baseColor = palette[Math.min(me.get('base-color', 0), palette.length-1)];

            // opts.varyLightness for each row
            if (opts.varyLightness) {
                var lab = chroma.color(baseColor).lab(),
                    minL = Math.min(lab[0], 50),
                    maxL = 91,
                    f = row / (me.chart.numRows()-1);
                return chroma.lab(minL + f * (maxL - minL), lab[1], lab[2]).hex();
            }

            // otherwise just return the base color
            return baseColor;
        },

        getColor: function(series, row, opts) {
            var me = this,
                color = me._getColor(series, row, opts);

            // modify colors to indicate highlighting
            if (series && me.chart.hasHighlight() && !me.chart.isHighlighted(series)) {
                // mix color with background
                return chroma.interpolate(color, me.theme.colors.background, 0.65, 'rgb').hex();
            }
            return color;
        },

        getSeriesColor: function(series, row, useNegativeColor, colorful) {
            var me = this,
                palette = me.theme.colors.palette,
                color,
                colorByRow = me.meta['color-by'] == 'row',
                colorKey = colorByRow ? me.chart.rowLabels()[row] : series.name;

            var userCustomColors = me.get('custom-colors', {});

            // user has defined a colors for this key
            if (userCustomColors[colorKey]) {
                color = userCustomColors[colorKey];

            } else if (series && useNegativeColor) {
                // if requested we display negative values in different color
                color = me.theme.colors[series.data[row] < 0 ? 'negative' : 'positive'];
            } else {
                // if the visualization has defined custom series colors, let's use them
                if (series && me.__customSeriesColors && me.__customSeriesColors[series.name])
                    color = me.__customSeriesColors[series.name];
                else if (colorByRow && colorful)
                    color = palette[(Math.min(me.get('base-color', 0), palette.length-1) + row) % palette.length];
                else if (me.__customRowColors && me.__customRowColors[row])
                    color = me.__customRowColors[row];

                else color = palette[Math.min(me.get('base-color', 0), palette.length-1)];
            }

            var hsl = d3.hsl(color),
                lch = d3.cie.lch(d3.rgb(color)),
                bg = d3.rgb(me.theme.colors.background),
                bglch = d3.cie.lch(bg);
            if (series && !me.chart.isHighlighted(series)) {
                // dim color
                // hsl.s = 0.2;
                // hsl.l = Math.min(0.85, hsl.l * 1.5);
                // lch.c *= 0.3;
                // lch.l = 90;// Math.min(90, lch.l * 1.5);
                lch = d3.interpolateRgb(d3.rgb(color), bg)(bglch.l < 60 ? 0.7 : 0.63);
                //lch.l = Math.min(1.5, lch.l * 1.5);
            } else if (series && me.chart.hasHighlight() && me.chart.isHighlighted(series)) {
                //lch.l *= bglch.l < 60 ? 1 : 0.8;
            }
            //color = hsl.toString();
            color = lch.toString();

            return color;
            //return me.theme.colors[me.chart.isHighlighted(series) ? highlight : main];
        },

        setSeriesColor: function(series, color) {
            var me = this;
            if (!me.__customSeriesColors) me.__customSeriesColors = {};
            me.__customSeriesColors[series.name] = color;
        },

        setRowColor: function(row, color) {
            var me = this;
            if (!me.__customRowColors) me.__customRowColors = {};
            me.__customRowColors[row] = color;
        },

        getYTicks: function(h, noDomain) {
            var me = this,
                yscale = me.__scales.y,
                ticks = yscale.ticks(h / 80),
                domain = me.__domain,
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

        invertLabel: function(col) {
            var c = chroma.color(col),
                bg = chroma.color(this.theme.colors.background);
            return bg.lab()[0] > 60 ?  // check if background is whitish
                c.lab()[0] < 80 :  //
                c.lab()[0] > 60;
        },

        getFilterUI: function(active, callback) {
            var vis = this,
                rowLabels = vis.chart.rowLabels(),
                sumChars = 0;
            // remove any existing filter-ui
            $('.filter-ui').remove();
            _.each(rowLabels, function(t) { sumChars += t ? t.length : 0; });
            function update(cur) {
                vis.update(cur);
                if (callback) callback();
            }
            if (rowLabels.length == 1) return null;
            if (sumChars > 30) {
                // use <select>
                var select = $('<select />');
                _.each(rowLabels, function(lbl, i) {
                    select.append('<option value="'+i+'">'+lbl+'</option>');
                });
                select.change(function(evt) {
                    var cur = select.val();
                    update(cur);
                });
                select.addClass('filter-ui filter-select');
                return select;
            } else {
                // use links
                var div = $('<div />');
                div.addClass('filter-ui filter-links');
                _.each(rowLabels, function(lbl, i) {
                    var a = $('<a href="#'+i+'"'+(i == active ? ' class="active" ': '')+'>'+lbl+'</a>').data('row', i);
                    div.append(a);
                });
                $('a', div).click(function(e) {
                    var a = $(e.target);
                    e.preventDefault();
                    if (a.hasClass('active')) return;
                    $('a', div).removeClass('active');
                    a.addClass('active');
                    update(a.data('row'));
                });
                return div;
            }
            return null;
        },

        /**
         * returns a signature for this visualization which will be used
         * to test correct rendering of the chart in different browsers.
         */
        signature: function() {
            var me = this,
                sig = { type: 'raphael-chart', el: {} };
            $.each(me.__seriesElements, function(key, elements) {
                sig.el[key] = elements.length;
            });
            return sig;
        },

        addLegend: function(items, container) {
            // add legend
            var me = this,
                l = $('<div class="legend"></div>'),
                xo = 0;

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
