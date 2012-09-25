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

        setRoot: function(el) {
            this.__root = el;
            el.css({
                position: 'relative'
            });
        },

        initCanvas: function(canvas) {
            var me = this, el = me.__root, w = $(document).width();
            canvas = _.extend({
                w: w,
                h: me.getMaxChartHeight(el),
                rpad: me.theme.padding.right,
                lpad: me.theme.padding.left,
                bpad: me.theme.padding.bottom,
                tpad: me.theme.padding.top
            }, canvas);

            if (w <= 300) {
                canvas.bpad = canvas.tpad = canvas.lpad = canvas.rpad = 5;
            }

            canvas.root = el;
            canvas.paper = Raphael(el[0], canvas.w, canvas.h+2);
            //console.log(w, w-canvas.lpad-canvas.rpad);
            //canvas.paper.rect(canvas.lpad, canvas.tpad, canvas.w - canvas.lpad - canvas.rpad, canvas.h - canvas.tpad - canvas.bpad);
            el.height(canvas.h);
            $('.tooltip').hide();
            me.__canvas = canvas;
            return canvas;
        },

        onMouseMove: function(e) {
            var me = this,
                x = e.pageX,
                y = e.pageY,
                series = this.getSeriesByPoint(x, y),
                row = this.getDataRowByPoint(x, y);

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
                    if (me.theme.tooltip) me.showTooltip(series, row, x, y);
                }, 100);
            }
        },

        registerSeriesElement: function(el, series) {
            el.data('series', series);
            if (!this.__seriesElements[series.name]) {
                this.__seriesElements[series.name] = [];
            }
            this.__seriesElements[series.name].push(el);
        },

        registerSeriesLabel: function(lbl, series) {
            lbl.data('series', series);
            if (!this.__seriesLabels[series.name]) {
                this.__seriesLabels[series.name] = [];
            }
            this.__seriesLabels[series.name].push(lbl);
        },

        hoverSeries: function(series) {
            var seriesElements = this.__seriesElements;
            _.each(seriesElements, function(elements, key) {
                var h = !series || key == series.name;
                _.each(elements, function(el) {
                    el.attr({ opacity: h ? 1 : 0.1 });
                });
            });

            var seriesLabels = this.__seriesLabels;
            _.each(seriesLabels, function(labels, key) {
                var h = !series || key == series.name;
                _.each(labels, function(lbl) {
                    lbl.css({ opacity: h ? 1 : 0.1 });
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
            var l, w, align, h, va;
            if (attrs === undefined) attrs = {};
            if (attrs.rotate == -90) {
                l = $('<div class="label'+(attrs.cl ? ' '+attrs.cl : '')+'"><span>'+txt+'</span></div>');
                w = 60;
                l.css({
                    position: 'absolute',
                    left: (x-w*0.5)+'px',
                    top: (y+12),
                    width: w,
                    height: 20,
                    'text-align': 'right'
                });
                l.css({
                    '-moz-transform': 'rotate(-90deg)',
                    '-webkit-transform': 'rotate(-90deg)',
                    '-ms-transform': 'rotate(-90deg)',
                    '-o-transform': 'rotate(-90deg)',
                    'filter': 'progid:DXImageTransform.Microsoft.BasicImage(rotation=3)'
                });
                this.__canvas.root.append(l);
            } else {
                va = attrs.valign;
                l = $('<div class="label'+(attrs.cl ? ' '+attrs.cl : '')+'"><span>'+txt+'</span></div>');
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
                this.__canvas.root.append(l);
                h = attrs.h ? attrs.h : l.height();
                if (!va) va = 'middle';
                l.css({
                    top: (y-h*(va == 'top' ? 0 : va == 'middle' ? 0.5 : 1))+'px'
                });
            }
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

        getSeriesByPoint: function(x, y) {
            var el = this.__canvas.paper.getElementByPoint(x, y);
            return el && el.data('series') ? el.data('series') : null;
        },

        getDataRowByPoint: function(x, y) {
            // needs to be implemented by each visualization
            throw 'getDataRowByPoint() needs to be implemented by each visualization';
        },

        getSeriesColor: function(series, row, useNegativeColor) {
            var me = this,
                main = useNegativeColor && series.data[row] < 0 ? 'negative' : 'main',
                highlight = useNegativeColor && series.data[row] < 0 ? 'highlight-negative' : 'highlight';
            if (!me.chart.hasHighlight()) return me.theme.colors[main];
            return me.theme.colors[me.chart.isHighlighted(series) ? highlight : main];
        },

        getYTicks: function(h) {
            var me = this,
                yscale = me.__scales.y,
                ticks = yscale.ticks(h / 80),
                domain = me.__domain,
                bt = yscale(ticks[0]),
                tt = yscale(ticks[ticks.length-1]);

            if (Math.abs(yscale(domain[0]) - bt) < 30) ticks.shift();
            if (Math.abs(tt - yscale(domain[1])) < 30) ticks.pop();

            ticks.unshift(domain[0]);
            ticks.push(domain[1]);

            return ticks;
        }

    });

}).call(this);