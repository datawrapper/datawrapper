
(function(){

    // Simple perfect bar chart
    // -------------------------

    var BarChart = Datawrapper.Visualizations.BarChart = function() {

    };

    _.extend(BarChart.prototype, Datawrapper.Visualizations.RaphaelChart.prototype, {

        render: function(el) {
            el = $(el);

            this.setRoot(el);

            var me = this,
            isVertical = me.get('orientation') == 'vertical',
            c = me.initCanvas({}),
            chart_width = c.w - c.lpad - c.rpad,
            series_gap = 0.05, // pull from theme
            row_gap = 0.01,
            row = 0; // pull from theme
            if (me.get('selected-row') !== null) {
                row = me.get('selected-row');
            }
            if (row > me.chart.numRows()) row = 0;
            me.chart.filterRow(row);

            me.init();
            me.initDimensions();

            $('.tooltip').hide();

            if (isVertical) me.horzGrid();

            _.each(me.chart.dataSeries(), function(series, s) {
                _.each(series.data, function(val, r) {
                    var d = me.barDimensions(series, s, r);
                    me.registerSeriesElement(c.paper.rect(d.x, d.y, d.w, d.h).attr({
                        'stroke': 'none',
                        'fill': me.getSeriesColor(series, r)
                    }), series);

                    if (isVertical) {
                        var val_y = val > 0 ? d.y - 10 : d.y + d.h + 10,
                            lbl_y = val <= 0 ? d.y - 10 : d.y + d.h + 5;
                        if (me.chart.isHighlighted(series)) {
                            // add value labels
                            me.registerSeriesLabel(me.label(d.x + d.w * 0.5, val_y, me.chart.formatValue(series.data[r]),{
                                w: d.w,
                                align: 'center',
                                cl: 'value'
                            }), series);
                        }

                        // add series label
                        me.registerSeriesLabel(me.label(d.x + d.w * 0.5, lbl_y, series.name, {
                            w: d.w,
                            align: 'center',
                            valign: val > 0 ? 'top' : 'bottom',
                            cl: me.chart.isHighlighted(series) ? 'series highlighted' : 'series'
                        }), series);

                    } else {
                        var val_x = val > 0 ? d.x + d.w + 10 : d.x- 5,
                            lbl_x = val <= 0 ? d.x + d.w + 5 : d.x- 10;
                        me.registerSeriesLabel(me.label(val_x, d.y + d.h * 0.5, me.chart.formatValue(series.data[r]),{
                            w: 40,
                            align: val > 0 ? 'left' : 'right',
                            cl: 'value'
                        }), series);

                        // add series label
                        me.registerSeriesLabel(me.label(lbl_x, d.y + d.h * 0.5, series.name,{
                            w: 80,
                            align: val <= 0 ? 'left' : 'right',
                            cl: me.chart.isHighlighted(series) ? 'series highlighted' : 'series'
                        }), series);
                    }

                });
            });

            if (isVertical) {
                var y = c.h - me.__scales.y(0) - c.bpad;
                me.path([['M', c.lpad, y], ['L', c.w - c.rpad, y]], 'axis')
                    .attr(me.theme.yAxis);
            } else if (me.__domain[0] < 0) {
                var x = c.lpad + me.__scales.y(0);
                me.path([['M', x, c.tpad], ['L', x, c.h - c.bpad]], 'axis')
                    .attr(me.theme.yAxis);
            }

            // enable mouse events
            el.mousemove(_.bind(me.onMouseMove, me));
        },

        initDimensions: function(r) {
            //
            var me = this, c = me.__canvas,
                dMin = 0, dMax = 0;
            _.each(me.chart.dataSeries(), function(series) {
                dMin = Math.min(dMin, series._min());
                dMax = Math.max(dMax, series._max());
            });
            me.__domain = [dMin, dMax];
            me.__scales = {
                y: d3.scale.linear().domain([dMin, dMax])
            };

            if (me.get('orientation') == 'horizontal') {
                me.__scales.y.rangeRound([c.lpad, c.w-c.rpad-c.lpad-30]);
            } else {
                me.__scales.y.rangeRound([0, c.h - c.bpad - c.tpad]);
            }
        },

        barDimensions: function(series, s, r) {
            var me = this, w, h, x, y, i, cw, n = me.chart.dataSeries().length,
                sc = me.__scales, c = me.__canvas, bw, pad = 0.35, vspace = 0.1;

            if (me.get('orientation') == 'horizontal') {
                cw = c.h - c.bpad - c.tpad;
                bw = Math.min(24, cw / (n + (n-1) * pad));
                w = sc.y(series.data[r]) - sc.y(0);
                h = bw;
                if (w > 0) {
                    x = c.lpad + sc.y(0);
                } else {
                    x = c.lpad + sc.y(0) + w;
                    w *= -1;
                }
                y = Math.round(c.tpad + s * (bw + bw * pad));
            } else {
                cw = (c.w - c.lpad - c.rpad) * (1 - vspace - vspace);
                bw = cw / (n + (n-1) * pad);
                h = sc.y(series.data[r]) - sc.y(0);
                w = bw;
                if (h >= 0) {
                    y = c.h - c.bpad - sc.y(0) - h;
                } else {
                    y = c.h - c.bpad - sc.y(0);
                    h *= -1;
                }
                x = Math.round((c.w - c.lpad - c.rpad) * vspace + c.lpad + s * (bw + bw * pad));
            }
            return { w: w, h: h, x: x, y: y };
        },

        getDataRowByPoint: function(x, y) {
            return 0;
        },

        showTooltip: function() {

        },

        hideTooltip: function() {
            
        },

        horzGrid: function() {
            // draw tick marks and labels
            var me = this,
                yscale = me.__scales.y,
                c = me.__canvas,
                domain = me.__domain,
                styles = me.__styles,
                ticks = me.getYTicks(c.h);

            _.each(ticks, function(val, t) {
                if (t == ticks.length-1) return;
                var y = c.h - c.bpad - yscale(val), x = c.lpad;
                if (val >= domain[0] && val <= domain[1]) {
                    // c.paper.text(x, y, val).attr(styles.labels).attr({ 'text-anchor': 'end' });
                    me.label(x+2, y-10, me.chart.formatValue(val, t == ticks.length-1), { align: 'left', cl: 'axis' });
                    if (me.theme.yTicks) {
                        me.path([['M', c.lpad-25, y], ['L', c.lpad-20,y]], 'tick');
                    }
                    if (me.theme.horizontalGrid) {
                        me.path([['M', c.lpad, y], ['L', c.w - c.rpad,y]], 'grid')
                            .attr(me.theme.horizontalGrid);
                    }
                }
            });
        }
    });

}).call(this);