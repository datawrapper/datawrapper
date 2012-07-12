
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
            c = me.initCanvas({}),
            chart_width = c.w - c.lpad - c.rpad,
            series_gap = 0.05, // pull from theme
            row_gap = 0.01; // pull from theme

            if (me.get('selected-row') !== null) {
                me.chart.filterRow(me.get('selected-row'));
            }

            me.init();
            me.initDimensions();

            $('.tooltip').hide();

            _.each(me.chart.dataSeries(), function(series, s) {
                _.each(series.data, function(val, r) {
                    var d = me.barDimensions(series, s, r);
                    me.registerSeriesElement(c.paper.rect(d.x, d.y, d.w, d.h).attr({
                        'stroke': 'none',
                        'fill': me.getSeriesColor(series, r)
                    }), series);
                    // add value labels
                    if (me.get('orientation') == 'vertical') {
                        me.label(d.x + d.w * 0.5, d.y - 10, me.chart.formatValue(series.data[r]),{
                            w: d.w,
                            align: 'center',
                            cl: 'value'
                        });
                    } else {
                        me.label(d.x + d.w + 10, d.y + d.h * 0.5, me.chart.formatValue(series.data[r]),{
                            w: 40,
                            align: 'left',
                            cl: 'value'
                        });
                    }

                    // add series label
                    if (me.get('orientation') == 'vertical') {
                        me.label(d.x + d.w * 0.5, d.y + d.h + 5, series.name, {
                            w: d.w,
                            align: 'center',
                            valign: 'top',
                            cl: me.chart.isHighlighted(series) ? 'series highlighted' : 'series'
                        });
                    } else {
                        me.label(d.x- 5, d.y + d.h * 0.5, series.name,{
                            w: 70,
                            align: 'right',
                            cl: me.chart.isHighlighted(series) ? 'series highlighted' : 'series'
                        });
                    }
                });
            });

            if (me.get('orientation') == 'vertical') {
                var y = c.h - me.__scales.data(0) - c.bpad;
                console.log(me.__scales.data(0));
                me.path([['M', c.lpad, y], ['L', c.w - c.rpad, y]], 'axis')
                    .attr(me.theme.yAxis);
            }
        },

        initDimensions: function(r) {
            //
            var me = this, c = me.__canvas,
                dMin = 0, dMax = 0;
            _.each(me.chart.dataSeries(), function(series) {
                dMin = Math.min(dMin, series._min());
                dMax = Math.max(dMax, series._max());
            });
            me.__scales = {
                data: d3.scale.linear().domain([dMin, dMax])
            };

            if (me.get('orientation') == 'horizontal') {
                me.__scales.data.rangeRound([c.lpad, c.w-c.rpad-c.lpad-20]);
            } else {
                me.__scales.data.rangeRound([0, c.h - c.bpad - c.tpad]);
            }
        },

        barDimensions: function(series, s, r) {
            var me = this, w, h, x, y, i, cw, n = me.chart.dataSeries().length,
                sc = me.__scales, c = me.__canvas, bw, pad = 0.5;

            if (me.get('orientation') == 'horizontal') {
                cw = c.h - c.bpad - c.tpad;
                bw = cw / (n + (n-1) * pad);
                w = sc.data(series.data[r]);
                h = bw;
                x = c.lpad;
                y = c.tpad + s * (bw + bw * pad);
            } else {
                cw = c.w - c.lpad - c.rpad;
                bw = cw / (n + (n-1) * pad);
                h = sc.data(series.data[r]);
                w = bw;
                y = c.h - h - c.bpad;
                x = c.lpad + s * (bw + bw * pad);
            }
            return { w: w, h: h, x: x, y: y };
        }
    });

}).call(this);