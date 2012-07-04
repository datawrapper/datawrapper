
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
            row_gap = 0.01, // pull from theme
            bar_width = (series_width / me.chart.numRows()) * (1 - row_gap);

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

        initDimensions: function() {
            //
        },

        barDimensions: function(series, s, r) {
            var me = this, w, h, x, y;
            if (me.chart.get('metadata.visualize.orientation') == 'horizontal') {

            } else {

            }
            return { w: w, h: h, x: x, y: y };
        }
    });

}).call(this);