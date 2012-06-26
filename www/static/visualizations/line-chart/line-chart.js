
(function(){

    // Simple perfect line chart
    // -------------------------

    var LineChart = Datawrapper.Visualizations.LineChart = function() {};

    _.extend(LineChart.prototype, Datawrapper.Visualizations.RaphaelChart.prototype, {

        render: function(el) {
            el = $(el);
            $('.tooltip').hide();
            el.css({
                position: 'relative'
            });
            var
            me = this,
            ds = me.dataset,
            scales = me.__scales = {
                x: me.xScale(),
                y: me.yScale()
            },
            c = me.__canvas = {
                root: el,
                w: el.width(),
                h: me.chart.get('metadata.visualize.force-banking') ?
                    el.width() / me.computeAspectRatio() : me.getMaxChartHeight(el),
                rpad: me.chart.dataSeries().length > 1 ? me.theme.rightPadding + me.theme.lineLabelWidth : me.theme.rightPadding,
                lpad: me.theme.leftPadding,
                bpad: me.theme.bottomPadding,
                tpad: 0
            };

            me.init();

            scales.x = scales.x.range([c.lpad, c.w-c.rpad]);
            scales.y = scales.y.range([c.h-c.bpad, 2]);

            c.paper = Raphael(el[0], c.w, c.h+2);

            el.height(c.h);
            // init canvas

            me.yAxis();

            me.xAxis();

            var seriesLines = this.__seriesLines = {};

            // draw series lines
            _.each(me.chart.dataSeries(), function(col) {
                var path = [], x, y, sw;
                _.each(col.data, function(val, i) {
                    x = scales.x(i);
                    y = scales.y(val);
                    path.push([path.length> 0 ? 'L' : 'M', x, y]);
                });
                sw = me.theme.lineWidth[me.chart.isHighlighted(col) ? 'focus' : 'context'];

                me.registerSeriesElement(c.paper.path(path).attr({
                    'stroke-width': sw,
                    'stroke-linecap': 'round',
                    'stroke-linejoin': 'round',
                    'stroke-opacity': 1,
                    'stroke': me.getSeriesColor(col)
                }), col);

                // add invisible line on top to make selection easier
                me.registerSeriesElement(c.paper.path(path).attr({
                    'stroke-width': sw*4,
                    'stroke-opacity': 0
                }), col);

                if (me.chart.dataSeries().length > 1 && me.chart.dataSeries().length < 10) {
                    var lbl = me.label(x+15, y, col.name, { cl: me.chart.isHighlighted(col) ? 'highlighted series' : 'series' });
                    lbl.data('highlighted', me.chart.isHighlighted(col));
                    me.registerSeriesLabel(lbl, col);
                }
            });

            me.orderSeriesElements();

            if (me.theme.lineHoverDotRadius) {
                this.hoverDot = c.paper.circle(0, 0, me.theme.lineHoverDotRadius).hide();
            }

            if (true || me.theme.tooltips) {
                el.mousemove(_.bind(me.onMouseMove, me));
            }

            window.ds = me.dataset;
            window.vis = me;
        },

        getDataRowByPoint: function(x, y) {
            return Math.round(this.__scales.x.invert(x));
        },

        showTooltip: function(series, row, x, y) {
            var me = this,
                xval = me.chart.rowLabel(row),
                yval = series.data[row],
                tt = $('.tooltip'),
                yr = me.__scales.y(yval);

            x = me.__scales.x(row);
            y = Math.min(y, yr + me.__canvas.root.offset().top);

            if (tt) {
                $('.xval', tt).html(xval);
                $('.yval', tt).html(yval);
                if (me.chart.hasRowHeader()) {
                    $('.xlabel', tt).html(me.chart.rowHeader().name);
                }
                $('.ylabel', tt).html(series.name);

                tt.css({
                    position: 'absolute',
                    top: (y -tt.outerHeight()-10)+'px',
                    left: (x - tt.outerWidth()*0.5)+'px'
                });
                tt.show();
            }

            if (me.theme.lineHoverDotRadius) {
                me.hoverDot.attr({
                    cx: x,
                    cy: yr,
                    r: me.theme.lineHoverDotRadius + me.getSeriesLineWidth(series),
                    stroke: me.getSeriesColor(series),
                    'stroke-width': me.getSeriesLineWidth(series),
                    fill: '#fff'
                }).data('series', series).show();
            }
        },

        getSeriesLineWidth: function(series) {
            return this.theme.lineWidth[this.chart.isHighlighted(series) ? 'focus' : 'context'];
        },

        hideTooltip: function() {
            $('.tooltip').hide();
            if (this.theme.lineHoverDotRadius) {
                this.hoverDot.hide();
            }
        },

        computeAspectRatio: function() {
            var me = this, slopes = [], M, Rx, Ry;
            _.each(me.chart.dataSeries(), function(col) {
                var lval;
                _.each(col.data, function(val, i) {
                    if (i > 0 && val != lval) {
                        slopes.push(Math.abs(val-lval));
                    }
                    lval = val;
                });
            });
            M = d3.median(slopes);
            Rx = slopes.length;
            Ry = me.__domain[1] - me.__domain[0];
            return M*Rx/Ry;
        },

        xScale: function() {
            return d3.scale.linear().domain([0, this.dataset.length-1]);
        },

        yScale: function() {
            var me = this, scale,
            // find min/max value of each data series
            domain = [Number.MAX_VALUE, Number.MAX_VALUE * -1];
            _.each(me.chart.dataSeries(), function(col) {
                domain[0] = Math.min(domain[0], col._min());
                domain[1] = Math.max(domain[1], col._max());
            });
            me.__domain = domain;
            if (me.chart.get('metadata.visualize.baseline') == 'zero') {
                domain[0] = 0;
            }
            scale = me.chart.get('metadata.visualize.scale') || 'linear';
            if (scale == 'log' && domain[0] === 0) domain[0] = 0.03;
            return d3.scale[scale]().domain(domain);
        },

        yAxis: function() {
            // draw tick marks and labels
            var yscale = this.__scales.y,
                me = this,
                c = this.__canvas,
                domain = this.__domain,
                styles = this.__styles,
                ticks = yscale.ticks(c.h/50),
                bt = yscale(ticks[0]),
                tt = yscale(ticks[ticks.length-1]);

            if (Math.abs(yscale(domain[0]) - bt) < 30) ticks.shift();
            if (Math.abs(tt - yscale(domain[1])) < 30) ticks.pop();

            ticks.unshift(domain[0]);
            ticks.push(domain[1]);

            _.each(ticks, function(val) {
                var y = yscale(val), x = c.lpad-me.theme.yLabelOffset;
                if (val >= domain[0] && val <= domain[1]) {
                    // c.paper.text(x, y, val).attr(styles.labels).attr({ 'text-anchor': 'end' });
                    me.label(x, y, val, { align: 'right', w: 60, cl: 'axis' });
                    if (me.theme.yTicks) {
                        me.path([['M', c.lpad-25, y], ['L', c.lpad-20,y]], 'tick');
                    }
                    if (me.theme.horizontalGrid) {
                        me.path([['M', c.lpad, y], ['L', c.w - c.rpad,y]], 'grid')
                            .attr(me.theme.horizontalGrid);
                    }
                }
            });
            // draw axis line

            if (me.theme.yAxis) {
                this.path([
                    ['M', c.lpad-20, yscale(domain[0])],
                    ['L', c.lpad-20, yscale(domain[1])]
                ], 'axis').attr(me.theme.yAxis);
            }
        },

        xAxis: function() {
            // draw x scale labels
            var me = this, ds = me.dataset, c = me.__canvas;
            if (me.chart.hasRowHeader()) {
                var last_label_x = -100, min_label_distance = 50;
                _.each(me.chart.rowLabels(), function(val, i) {
                    var x = me.__scales.x(i), y = c.h-c.bpad+me.theme.xLabelOffset;
                    if (x - last_label_x < min_label_distance) return;
                    last_label_x = x;
                    me.label(x, y, val, { align: 'center', cl: 'axis' });
                });
            }
        }

    });

}).call(this);