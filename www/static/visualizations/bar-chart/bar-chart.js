
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
            all_series = me.chart.dataSeries(),
            chart_width = c.w - c.lpad - c.rpad,
            series_gap = 0.05, // pull from theme
            row_gap = 0.01; // pull from theme

            me.initDimensions();

            _.each(all_series, function(series, s) {
                _.each(series.data, function(val, r) {
                    var d = me.barDimensions(series, s, r);
                    me.registerSeriesElement(c.paper.rect(d.x, d.y, d.w, d.h).attr({
                        'stroke': 'none',
                        'fill': me.getSeriesColor(col, row)
                    }), col);
                });
            });
        },

        isStacked: function() {
            return false;
        },

        initDimensions: function() {
            //
            var me = this, c = me.__canvas,
                dMin = 0, dMax = 0;
            _.each(me.chart.dataSeries(), function(series) {
                if (me.isStacked()) {
                    // use sum
                    dMin = Math.min(dMin, series._sum());
                    dMax = Math.max(dMax, series._sum());
                } else {
                    dMin = Math.min(dMin, series._min());
                    dMax = Math.max(dMax, series._max());
                }
            });
            me.__scales = {
                data: d3.scales.linear().domain([dMin, dMax])
            };
            console.log(dMin, dMax);
        },

        barDimensions: function(series, s, r) {
            var me = this, w, h, x, y, sc = me.__scales;
            if (me.get('orientation') == 'horizontal') {
                w = sc.data(series.data[r]);
            } else {
                h = sc.data(series.data[r]);
            }
            return { w: w, h: h, x: x, y: y };
        }
    });

}).call(this);