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
                easeInExpo: function (x, t, b, c, d) {
                    return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
                },
                easeOutExpo: function (x, t, b, c, d) {
                    return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
                },
                easeInOutExpo: function (x, t, b, c, d) {
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
                series = this.getSeriesByPoint(x, y),
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

        label: function(x, y, txt, attrs) {

            var me = this;

            function lblcss(lbl, x, y) {
                var w, align, h, va;

                attrs = lbl.data('attrs');

                if (attrs.rotate == -90) {

                } else {
                    w = attrs.w ? attrs.w : me.labelWidth(txt, attrs.cl);
                    align = attrs.align ? attrs.align : 'left';
                    x = align == 'left' ? x : align == 'center' ? x - w * 0.5 : x - w;
                    h = attrs.h ? attrs.h : lbl.height();
                    va = attrs.valign || 'middle';
                    y = (y-h*(va == 'top' ? 0 : va == 'middle' ? 0.5 : 1));
                }
                return _.extend(attrs.css || {}, {
                    left: x,
                    top: y,
                    width: w,
                    height: h,
                    position: 'absolute',
                    'text-align': align
                });
            }

            var l, w, align, h, va;
            if (attrs === undefined) attrs = {};
            if (attrs.root === undefined) attrs.root = this.__canvas.root;
            // create label DIV element
            l = $('<div class="label'+(attrs.cl ? ' '+attrs.cl : '')+'"><span>'+txt+'</span></div>');
            if (attrs.css) l.css(attrs.css);
            l.data('attrs', attrs);
            if (attrs.rotate == -90) {
                w = 60;
                l.css({
                    position: 'absolute',
                    left: (x-w*0.5)+'px',
                    top: (y+12),
                    width: w,
                    height: 20,
                    'text-align': 'right'
                }).css({
                    '-moz-transform': 'rotate(-90deg)',
                    '-webkit-transform': 'rotate(-90deg)',
                    '-ms-transform': 'rotate(-90deg)',
                    '-o-transform': 'rotate(-90deg)',
                    'filter': 'progid:DXImageTransform.Microsoft.BasicImage(rotation=3)'
                });
                attrs.root.append(l);
            } else {
                /* va = attrs.valign;
                w = attrs.w ? attrs.w : this.labelWidth(txt, attrs.cl);
                align = attrs.align ? attrs.align : 'left';
                x = align == 'left' ? x : align == 'center' ? x - w * 0.5 : x - w;
                l.css({
                    position: 'absolute',
                    left: x+'px',
                    'text-align': align
                });
                if (attrs.w) {
                    l.css({ width: w+'px' });
                }
                attrs.root.append(l);
                h = attrs.h ? attrs.h : l.height();
                if (!va) va = 'middle';
                l.css({
                    top: (y-h*(va == 'top' ? 0 : va == 'middle' ? 0.5 : 1))+'px'
                });*/
                attrs.root.append(l);
                l.css(lblcss(l, x, y));
            }
            l.data('lblcss', lblcss); // store css function for later reuse
            return l;
        },

        labelWidth: function(txt, className) {
            // returns the width of a label
            var l = $('<div class="label'+(className ? ' '+className : '')+'"><span>'+txt+'</span></div>');
            this.__root.append(l);
            var w = $('span', l).width();
            l.remove();
            return w;
        },

        labelHeight: function(txt, className, width) {
            // returns the width of a label
            var l = $('<div class="label'+(className ? ' '+className : '')+'"><span>'+txt+'</span></div>');
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

        getSeriesColor: function(series, row, useNegativeColor, colorful) {
            var me = this,
                palette = me.theme.colors.palette,
                color,
                colorByRow = me.meta['color-by-row'] === true,
                colorKey = colorByRow ? me.chart.rowLabels()[row] : series.name;

            var userCustomColors = me.get('custom-colors', {});
            if (series && userCustomColors[colorKey]) {
                // highest priority for user-defined series colors
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
            var c = d3.cie.lch(d3.rgb(col)),
                bg = d3.cie.lch(d3.rgb(this.theme.colors.background));
            return bg.l > 60 ? c.l < 70 : c.l > 60;
        },

        getFilterUI: function(active, callback) {
            var vis = this,
                rowLabels = vis.chart.rowLabels(),
                sumChars = 0;
            _.each(rowLabels, function(t) { sumChars += t.length; });
            function update(cur) {
                vis.update(cur);
                if (callback) callback();
            }
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
            } else if (rowLabels.length > 1) {
                // use links
                var div = $('<div />');
                div.addClass('filter-ui filter-links');
                _.each(rowLabels, function(lbl, i) {
                    div.append('<a href="#'+i+'"'+(i == active ? ' class="active" ': '')+'>'+lbl+'</option>');
                });
                $('a', div).click(function(e) {
                    var a = $(e.target);
                    e.preventDefault();
                    if (a.hasClass('active')) return;
                    $('a', div).removeClass('active');
                    a.addClass('active');
                    update(a.attr('href').substr(1));
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
