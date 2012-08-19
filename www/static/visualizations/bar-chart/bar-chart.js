
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
            sortBars = me.get('sort-values'),
            c = me.initCanvas({}),
            chart_width = c.w - c.lpad - c.rpad,
            series_gap = 0.05, // pull from theme
            row_gap = 0.01,
            row = 0; // pull from theme
            if (!_.isUndefined(me.get('selected-row'))) {
                row = me.get('selected-row');
            }
            if (row > me.chart.numRows() || row === undefined) row = 0;
            me.chart.filterRow(row);

            me.init();
            me.initDimensions();

            $('.tooltip').hide();

            _.each(me.chart.dataSeries(sortBars), function(series, s) {
                _.each(series.data, function(val, r) {
                    var d = me.barDimensions(series, s, r);
                    var fill = me.getSeriesColor(series, r),
                        stroke = d3.cie.lch(d3.rgb(fill)).darker(0.6).toString();
                    me.registerSeriesElement(c.paper.rect(d.x, d.y, d.w, d.h).attr({
                        'stroke': stroke,
                        'fill': fill
                    }).data('strokeCol', stroke), series);

                    var val_x = val > 0 ?
                            d.x - me.__canvas.maxValueLabelWidth + 10
                            : d.x - 5,
                        lbl_x = val > 0 ?
                            d.x - 10 - me.__canvas.maxValueLabelWidth
                            : d.x + d.w + 5;
                    me.registerSeriesLabel(me.label(val_x, d.y + d.h * 0.5, me.chart.formatValue(series.data[r], s === 0),{
                        w: 40,
                        align: 'left',
                        cl: 'value'
                    }), series);

                    // add series label
                    me.registerSeriesLabel(me.label(lbl_x , d.y + d.h * 0.5, series.name,{
                        w: 160,
                        align: val <= 0 ? 'left' : 'right',
                        cl: me.chart.isHighlighted(series) ? 'series highlighted' : 'series'
                    }), series);

                });
            });

            if (me.__domain[0] < 0) {
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
                dMin = 0, dMax = 0, w = c.w - c.lpad - c.rpad - 20;
            _.each(me.chart.dataSeries(), function(series) {
                dMin = Math.min(dMin, series._min());
                dMax = Math.max(dMax, series._max());
            });
            me.__domain = [dMin, dMax];
            me.__scales = {
                y: d3.scale.linear().domain([dMin, dMax])
            };
            if (!me.get('labels-inside-bars')) {
                // compute maximum width of series labels
                var max_sw = 0, max_vw = 0;
                _.each(me.chart.dataSeries(), function(series, s) {
                    max_sw = Math.max(max_sw, me.labelWidth(series.name, 'series'));
                    max_vw = Math.max(max_vw, me.labelWidth(me.chart.formatValue(series.data[r], s === 0), 'value'));
                });
                max_sw += 20;
                max_vw += 10;
                w -= max_sw + max_vw;
                me.__canvas.maxSeriesLabelWidth = max_sw;
                me.__canvas.maxValueLabelWidth = max_vw;

            }

            me.__scales.y.rangeRound([c.lpad, w]);
        },

        barDimensions: function(series, s, r) {
            var me = this, w, h, x, y, i, cw, n = me.chart.dataSeries().length,
                sc = me.__scales, c = me.__canvas, bw, pad = 0.35, vspace = 0.1;

            //
            cw = c.h - c.bpad - c.tpad;
            //
            bw = Math.min(24, cw / (n + (n-1) * pad));
            w = sc.y(series.data[r]) - sc.y(0);
            h = bw;
            if (w > 0) {
                x = c.lpad + sc.y(0);
            } else {
                x = c.lpad + sc.y(0) + w;
                w *= -1;
            }
            x += me.__canvas.maxSeriesLabelWidth;
            x += me.__canvas.maxValueLabelWidth;
            y = Math.round(c.tpad + s * (bw + bw * pad));
            return { w: w, h: h, x: x, y: y };
        },

        getDataRowByPoint: function(x, y) {
            return 0;
        },

        showTooltip: function() {

        },

        hideTooltip: function() {
            
        },

        hoverSeries: function(series) {
            var me = this;
            _.each(me.chart.dataSeries(), function(s) {
                _.each(me.__seriesLabels[s.name], function(lbl) {
                    if (series !== undefined && s.name == series.name) {
                        lbl.addClass('hover');
                    } else {
                        lbl.removeClass('hover');
                    }
                    _.each(me.__seriesElements[s.name], function(el) {
                        var fill = me.getSeriesColor(s, 0), stroke;
                        if (series !== undefined && s.name == series.name) fill = d3.cie.lch(d3.rgb(fill)).darker(0.6).toString();
                        stroke = d3.cie.lch(d3.rgb(fill)).darker(0.6).toString();
                        if (el.attrs.fill != fill || el.attrs.stroke != stroke)
                            el.animate({ fill: fill, stroke: stroke }, 50);
                    });
                });
            });
        },

        unhoverSeries: function() {
            this.hoverSeries();
        }
    });

}).call(this);