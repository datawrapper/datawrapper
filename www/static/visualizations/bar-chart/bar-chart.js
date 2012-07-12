
(function(){

    // Simple perfect bar chart
    // -------------------------

    var BarChart = Datawrapper.Visualizations.BarChart = function() {

    };

    _.extend(BarChart.prototype, Datawrapper.Visualizations.RaphaelChart.prototype, {

        render: function(el) {
            el = $(el);

            var me = this,
            c = me.initCanvas(el, {}),
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
                });
            });
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
                me.__scales.data.rangeRound([c.lpad, c.w-c.rpad]);
            } else {
                me.__scales.data.rangeRound([c.tpad, c.h-c.bpad]);
            }
        },

        barDimensions: function(series, s, r) {
            var me = this, w, h, x, y, i, sc = me.__scales, c = me.__canvas, bw = 30;
            if (me.get('orientation') == 'horizontal') {
                bw = (c.h - c.bpad - c.tpad) / me.chart.dataSeries().length / 1.5;
                w = sc.data(series.data[r]);
                h = bw;
                x = c.lpad;
                y = Math.round(s*bw*1.5 + r * h*1.35);
            } else {
                bw = (c.w - c.lpad - c.rpad) / me.chart.dataSeries().length / series.data.length/1.5;
                h = sc.data(series.data[r]);
                w = bw;
                y = c.h - c.bpad - h;
                x = c.lpad + s*bw*1.5*series.data.length + r * w * 1.35;
            }
            return { w: w, h: h, x: x, y: y };
        }
    });

}).call(this);