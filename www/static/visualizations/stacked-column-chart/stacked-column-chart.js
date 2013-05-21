
(function(){
    // Stacked Vertical Bar Chart
    // --------------------------

    var StackedColumnChart = Datawrapper.Visualizations.StackedColumnChart = function() {

    };

    _.extend(StackedColumnChart.prototype, Datawrapper.Visualizations.GroupedColumnChart.prototype, {

        // some config
        _showValueLabels: function() { return false; },

        initDimensions: function(r) {
            //
            var me = this, c = me.__canvas,
                normalize = me.is_normalized(),
                dMin = 0, dMax = 0;

            _.each(me.chart.dataSeries(), function(series) {
                var ssum = 0;
                if (!series.odata) series.odata = series.data.slice(0); // save a copy of the original data
                series.data = series.odata.slice(0);
                _.each(series.data, function(v) {
                    ssum += isNaN(v) ? 0 : v;
                });
                if (normalize) {
                    dMin = 0;
                    dMax = 1;
                    $.each(series.data, function(i, v) {
                        series.data[i] = v / ssum;
                    });
                } else {
                    dMin = Math.min(dMin, series.min);
                    dMax = Math.max(dMax, ssum);
                }
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
        },

        formatValue: function(v) {
            var me = this;
            return me.is_normalized() ? Math.round(v * 100)+'%' : me.chart.formatValue.apply(me.chart, arguments);
        },

        is_normalized: function() {
            var me = this;
            return me.get('normalize', false) && (!me.get('normalize-user', false) || $('#normalize:checked').length > 0);
        },

        post_render: function() {
            var me = this;
            if (me.get('normalize-user', false)) {
                $('.header-right').remove();
                var chkNormalize = $('<div><label for="normalize"><input type="checkbox" id="normalize" /> ' + me.translate('stack percentages') + '</label></div>');
                chkNormalize.addClass('header-right');
                $('#normalize', chkNormalize).on('change', function() {
                    me.initDimensions();
                    me.update();
                    me.horzGrid();
                });
                $('#header').append(chkNormalize);
            }
        },

        checkData: function() {
            var me = this, ds = me.dataset, allPositive = true;
            ds.eachSeries(function(s) {
                ds.eachRow(function(r) {
                    if (s.data[r] < 0) {
                        allPositive = false;
                        return false;
                    }
                });
                if (!allPositive) return false;
            });
            if (!allPositive) {
                me.warn('<b>Warning:</b> Stacked column charts cannot display negative values!');
            }
        }

    });

}).call(this);