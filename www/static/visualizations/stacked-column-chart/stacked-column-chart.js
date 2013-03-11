
(function(){
    // Stacked Vertical Bar Chart
    // --------------------------

    var StackedColumnChart = Datawrapper.Visualizations.StackedColumnChart = function() {

    };

    _.extend(StackedColumnChart.prototype, Datawrapper.Visualizations.GroupedColumnChart.prototype, {

        // some config
        _showValueLabels: function() { return false; },

        getRowColors: function() {
            return this._getRowColors();
        },

        initDimensions: function(r) {
            //
            var me = this, c = me.__canvas,
                dMin = 0, dMax = 0;
            _.each(me.chart.dataSeries(), function(series) {
                var ssum = 0;
                _.each(series.data, function(v) {
                    ssum += v;
                });
                dMin = Math.min(dMin, series.min);
                dMax = Math.max(dMax, ssum);
            });
            me.__domain = [dMin, dMax];
            me.__scales = {
                y: d3.scale.linear().domain([dMin, dMax])
            };
            //                                                    v-- substract a few pixel to get space for the legend!
            me.__scales.y.rangeRound([0, c.h - c.bpad - c.tpad - 30]);
            return;
        },

        barDimensions: function(series, s, r) {
            var me = this,
                sc = me.__scales,
                yo = me.__yoffset || 0,
                c = me.__canvas,
                n = me.chart.dataSeries().length,
                w, h, x, y, i, cw, bw,
                pad = 0.35,
                vspace = 0.1;

            if (c.w / n < 30) vspace = 0.05;

            cw = (c.w - c.lpad - c.rpad) * (1 - vspace - vspace);
            bw = bw = cw / (n + (n-1) * pad);
            h = sc.y(series.data[r]) - sc.y(0);
            if (r === 0) yo = 0;
            w = bw; //w = Math.round(bw / series.data.length);
            if (h >= 0) {
                y = c.h - c.bpad - sc.y(0) - h;
            } else {
                y = c.h - c.bpad - sc.y(0);
                h *= -1;
            }
            x = Math.round((c.w - c.lpad - c.rpad) * vspace + c.lpad + s * (bw + bw * pad));
            y = y - yo;
            me.__yoffset = yo + h;
            return { w: w, h: h, x: x, y: y, bx: x, bw: bw };
        }

    });

}).call(this);