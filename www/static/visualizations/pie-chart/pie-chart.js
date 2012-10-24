
(function(){
    // Simple perfect bar chart
    // -------------------------

    var PieChart = Datawrapper.Visualizations.PieChart = function() {

    };

    var TWO_PI = Math.PI * 2, HALF_PI = Math.PI * 0.5;

    _.extend(PieChart.prototype, Datawrapper.Visualizations.RaphaelChart.prototype, {

        isDonut: function() {
            return false;
        },

        render: function(el) {
            el = $(el);

            this.setRoot(el);

            var me = this,
                sort = true,
                donut = me.isDonut(),
                showTotal = donut && me.get('show-total'),
                groupAfter = 5,
                c = me.initCanvas({}),
                chart_width = c.w,
                chart_height = c.h;

            c.cx = chart_width * 0.5;
            c.cy = chart_height * 0.5;
            c.or = Math.min(chart_height, chart_width) * 0.5 - 3;
            c.ir = donut ? c.or * 0.3 : 0;
            c.or_sq = c.or * c.or;
            c.ir_sq = c.ir * c.ir;

            row = 0;
            // 2d -> 1d
            if (!_.isUndefined(me.get('selected-row'))) {
                row = me.get('selected-row');
                if (row > me.chart.numRows() || row === undefined) row = 0;
            }
            if (me.chart.numRows() > 1) me.chart.filterRow(row);

            me.init();

            $('.tooltip').hide();

            function arc(cx, cy, or, ir, startAngle, endAngle) {
                var x0 = cx+Math.cos(startAngle)*ir,
                    y0 = cy+Math.sin(startAngle)*ir,
                    x1 = cx+Math.cos(endAngle)*ir,
                    y1 = cy+Math.sin(endAngle)*ir,
                    x2 = cx+Math.cos(endAngle)*or,
                    y2 = cy+Math.sin(endAngle)*or,
                    x3 = cx+Math.cos(startAngle)*or,
                    y3 = cy+Math.sin(startAngle)*or,
                    largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

                if (ir > 0)
                    return me.path("M"+x0+" "+y0+" A"+ir+","+ir+" 0 "+largeArc+",1 "+x1+","+y1+" L"+x2+" "+y2+" A"+or+","+or+" 0 "+largeArc+",0 "+x3+" "+y3+" Z", 'slice');
                else
                    return me.path("M"+cx+" "+cy+" L"+x2+" "+y2+" A"+or+","+or+" 0 "+largeArc+",0 "+x3+" "+y3+" Z", 'slice');
            }

            var series = me.chart.dataSeries(true),
                total = 0, min = Number.MAX_VALUE, max = 0,
                reverse, oseries, others = 0, ocnt = 0, hasNegativeValues = false;


            // now group small series into one big chunk named 'others'
            oseries = [];
            _.each(series, function(s, i) {
                if (s.data[0] < 0) {
                    hasNegativeValues = true;
                    return;
                }
                if (i < groupAfter) oseries.push(s);
                else {
                    ocnt += 1;
                    others += s.data[0];
                }
            });

            if (hasNegativeValues) {
                me.warn('<b>Warning:</b> Pie charts are not suitable for displaying negative values.');
            }
            if (ocnt > 0) {
                var _others = {
                    name: 'others',
                    data: [others]
                };
                oseries.push(_others);
                me.chart.__dataset.__seriesByName[_others.name] = _others;
            }

            _.each(oseries, function(s) {
                total += s.data[0];
                min = Math.min(min, s.data[0]);
                max = Math.max(max, s.data[0]);
            });
            reverse = min < total / series.length * 0.66 || max > total/series.length * 1.5;

            sa = -HALF_PI;
            if (reverse) sa += TWO_PI * (series[0].data[0] / total);

            me.__seriesAngles = {};

            function normalize(a0, a1) {
                a0 += HALF_PI;
                a1 += HALF_PI;
                if (a0 < 0) {
                    a0 += TWO_PI;
                    a1 += TWO_PI;
                }
                return [a0, a1];
            }

            _.each(oseries, function(s) {

                var da = s.data[0] / total * Math.PI * 2,
                    fill = me.getSeriesColor(s, 0),
                    stroke = d3.cie.lch(d3.rgb(fill)).darker(0.6).toString(),
                    a0 = reverse ? sa - da : sa,
                    a1 = reverse ? sa : sa + da,
                    lx = c.cx + Math.cos((a0 + a1) * 0.5) * c.or * 0.7,
                    ly = c.cy + Math.sin((a0 + a1) * 0.5) * c.or * 0.7,
                    value = showTotal ? Math.round(s.data[0] / total * 100)+'%' : me.chart.formatValue(s.data[0], true);

                if (s.data[0] === 0) return;

                me.registerSeriesElement(arc(c.cx, c.cy, c.or, c.ir, a0, a1).attr({
                    'stroke': me.theme.colors.background,
                    'stroke-width': 2,
                    'fill': fill
                }), s);

                me.__seriesAngles[s.name] = normalize(a0, a1);

                sa += reverse ? -da : da;
                var lblcl = me.chart.hasHighlight() && me.chart.isHighlighted(s) ? 'series highlighted' : 'series';
                if (me.invertLabel(fill)) lblcl += ' inverted';

                me.registerSeriesLabel(me.label(lx, ly, s.name+'<br />'+value, {
                    w: 80,
                    align: 'center',
                    valign: 'middle',
                    cl: lblcl
                }), s);

            });

            if (showTotal) {
                if (me.get('custom-total')) {
                    total = me.get('custom-total-value', '');
                } else {
                    total = me.chart.formatValue(total, true);
                }
                me.label(c.cx, c.cy, '<strong>Total:</strong><br />'+total, {
                    w: 50,
                    align: 'center',
                    valign: 'middle'
                });
            }

            // enable mouse events
            el.mousemove(_.bind(me.onMouseMove, me));
        },

        getSeriesByPoint: function(x, y) {
            var me = this, c = me.__canvas, a, match;
            x -= c.root.offset().left + c.cx;
            y -= c.root.offset().top + c.cy;
            dist = x*x + y*y;
            if (dist > c.or_sq || dist < c.ir_sq) return false;
            a = Math.atan2(y, x) + HALF_PI;
            if (a < 0) a += TWO_PI;

            _.each(me.__seriesAngles, function(range, sname) {
                // console.log(a, range);
                if (a >= range[0] && a < range[1]) {
                    match = sname;
                    return false;
                }
            });
            return me.chart.seriesByName(match);
        },

        getDataRowByPoint: function(x, y) {
            return 0;
        },

        showTooltip: function() {

        },

        hideTooltip: function() {
            
        },

        hoverSeries: function(series) {
            var me = this,
                bg = d3.cie.lch(d3.rgb(me.theme.colors.background));
            _.each(me.chart.dataSeries(), function(s) {
                _.each(me.__seriesLabels[s.name], function(lbl) {
                    if (series !== undefined && s.name == series.name) {
                        lbl.addClass('hover');
                    } else {
                        lbl.removeClass('hover');
                    }
                    _.each(me.__seriesElements[s.name], function(el) {
                        var fill = me.getSeriesColor(s, 0), stroke, hover = series !== undefined && s.name == series.name;
                        if (hover) fill = d3.cie.lch(d3.rgb(fill)).darker(bg.l > 60 ? 0.6 : -0.6).toString();
                        if (el.attrs.fill != fill)
                            el.animate({ fill: fill }, 50);
                        if (hover) el.toFront();
                    });
                });
            });
        },

        unhoverSeries: function() {
            this.hoverSeries();
        }
    });

}).call(this);