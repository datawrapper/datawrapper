
(function(){

    // Pie chart
    // ---------

    var PieChart = Datawrapper.Visualizations.PieChart = function() {

    };

    var TWO_PI = Math.PI * 2, HALF_PI = Math.PI * 0.5;

    var Slice = function(paper, cx, cy, or, ir, startAngle, endAngle, label) {
        var me = {
            cx: cx,
            cy: cy,
            or: or,
            ir: ir,
            startAngle: startAngle,
            endAngle: endAngle
        };

        function arcPath() {
            var cx = me.cx, cy = me.cy, ir = me.ir, or = me.or,
                startAngle = me.startAngle, endAngle = me.endAngle;

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
                return "M"+x0+" "+y0+" A"+ir+","+ir+" 0 "+largeArc+",1 "+x1+","+y1+" L"+x2+" "+y2+" A"+or+","+or+" 0 "+largeArc+",0 "+x3+" "+y3+" Z";
            else
                return "M"+cx+" "+cy+" L"+x2+" "+y2+" A"+or+","+or+" 0 "+largeArc+",0 "+x3+" "+y3+" Z";
        }

        function updateLabelPos() {
            lx = me.cx + Math.cos((me.startAngle + me.endAngle) * 0.5) * me.or * 0.7,
            ly = me.cy + Math.sin((me.startAngle + me.endAngle) * 0.5) * me.or * 0.7;
            label.attr({ x: lx, y: ly });
        }

        var running;
        function frame() {
            path.attr({ path: arcPath() });
            updateLabelPos();
            if (running) requestAnimationFrame(frame);
        }

        var path = paper.path(arcPath());
        updateLabelPos();

        var slice = { path: path, label: label };
        slice.animate = function(cx, cy, or, ir, sa, ea, duration, easing) {
            running = true;
            $(me).animate(
                { cx: cx, cy: cy, or: or, ir: ir, startAngle: sa, endAngle: ea },
                { easing: easing, duration: duration, complete: function() {
                    running = false;
                    frame();
                }
            });
            requestAnimationFrame(frame);
        };
        return slice;
    };

    _.extend(PieChart.prototype, Datawrapper.Visualizations.RaphaelChart.prototype, {

        isDonut: function() {
            return false;
        },

        getFullArc: function() {
            return TWO_PI;
        },

        groupAfter: function() {
            return 5;
        },

        render: function(el) {
            el = $(el);

            this.setRoot(el);

            var me = this,
                sort = true,
                donut = me.isDonut(),
                row = 0;

            // 2d -> 1d
            if (!_.isUndefined(me.get('selected-row'))) {
                row = me.get('selected-row', 0);
                if (row > me.chart.numRows() || row === undefined) row = 0;
            }

            var filterUI = me.getFilterUI(row);
            if (filterUI) $('#header').append(filterUI);

            var c = me.initCanvas({}, 0, filterUI ? filterUI.height()+10 : 0),
                chart_width = c.w,
                chart_height = c.h,
                FA = me.getFullArc(); // full arc

            c.cx = chart_width * 0.5;
            c.cy = chart_height * (FA < TWO_PI ? 0.69 : 0.5); // 1:1 1.5:1
            c.or = Math.min(FA == TWO_PI ? chart_height * 0.5 : chart_height * 0.66, chart_width * 0.5) - 3;
            c.ir = donut ? c.or * 0.3 : 0;
            c.or_sq = c.or * c.or;
            c.ir_sq = c.ir * c.ir;


            me.init();

            $('.tooltip').hide();

            me.__initialRow = row;
            me.update(row);

            // enable mouse events
            el.mousemove(_.bind(me.onMouseMove, me));
        },

        /*
         * updates the chart according to the given row
         */
        update: function(row) {
            var me = this,
                groupAfter = me.groupAfter(),
                c = me.__canvas,
                donut = me.isDonut(),
                showTotal = donut && me.get('show-total', false),
                FA = me.getFullArc(),
                slices = me.__slices = me.__slices ? me.__slices : {};

            me.chart.filterRow(row);

            var series = me.chart.dataSeries(me.get('sort-values', true) ? me.__initialRow : false),
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
                    name: me.translate('other'),
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
            if (reverse) sa += FA * (series[0].data[0] / total);

            if (FA < TWO_PI) {
                reverse = false;
                sa = -HALF_PI - FA * 0.5;
            }

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

                var da = s.data[0] / total * FA,
                    fill = me.getSeriesColor(s, 0),
                    stroke = chroma.color(fill).darken(15).hex(),
                    a0 = reverse ? sa - da : sa,
                    a1 = reverse ? sa : sa + da,
                    value = showTotal ? Math.round(s.data[0] / total * 100)+'%' : me.chart.formatValue(s.data[0], true);

                if (s.data[0] === 0) return;

                if (!slices[s.name]) {
                    var lblcl = me.chart.hasHighlight() && me.chart.isHighlighted(s) ? 'series highlighted' : 'series';
                    if (me.invertLabel(fill)) lblcl += ' inverted';

                    var lbl = me.registerSeriesLabel(me.label(0, 0, '<b>'+s.name+'</b><br />'+value, {
                        w: 80, cl: lblcl, align: 'center', valign: 'middle'
                    }), s);

                    slice = slices[s.name] = Slice(c.paper, c.cx, c.cy, c.or, c.ir, a0, a1, lbl, me.theme);
                    slice.path.attr({
                        'stroke': me.theme.colors.background,
                        'stroke-width': 2,
                        'fill': fill
                    });
                } else {
                    slice = slices[s.name];
                    slice.label.text('<b>'+s.name+'</b><br />'+value);
                    slice.animate(c.cx, c.cy, c.or, c.ir, a0, a1, me.theme.duration, me.theme.easing);

                }

                me.__seriesAngles[s.name] = normalize(a0, a1);
                sa += reverse ? -da : da;

            });

            if (showTotal) {
                if (me.get('custom-total')) {
                    total = me.get('custom-total-value', '');
                } else {
                    total = me.chart.formatValue(total, true);
                }
                if (me.__labelTotal) me.__labelTotal.remove();
                me.__labelTotal = me.label(c.cx, c.cy, '<strong>Total:</strong><br />'+total, {
                    w: 50,
                    align: 'center',
                    valign: 'middle'
                });
            }
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
                bg = chroma.color(me.theme.colors.background);
            _.each(me.chart.dataSeries(), function(s) {
                _.each(me.__seriesLabels[s.name], function(lbl) {
                    if (series !== undefined && s.name == series.name) {
                        lbl.addClass('hover');
                    } else {
                        lbl.removeClass('hover');
                    }
                    _.each(me.__seriesElements[s.name], function(el) {
                        var fill = me.getSeriesColor(s, 0), stroke, hover = series !== undefined && s.name == series.name;
                        if (hover) fill = chroma.lch(fill).darken(bg.hcl()[2] > 60 ? 14 : -14).hex();
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