
(function(){
    // Simple bar chart
    // ----------------

    var BarChart = Datawrapper.Visualizations.BarChart = function() {

    };

    _.extend(BarChart.prototype, Datawrapper.Visualizations.RaphaelChart.prototype, {

        render: function(el) {
            el = $(el);

            this.setRoot(el);

            var me = this, row = 0,
            sortBars = me.get('sort-values', false),
            reverse = me.get('reverse-order'),
            useNegativeColor = me.get('negative-color', false);

            if (!_.isUndefined(me.get('selected-row'))) {
                row = me.get('selected-row', 0);
                row = row > me.chart.numRows() ? 0 : row;
            }

            var filterUI = me.getFilterUI(row);
            if (filterUI) $('#header').append(filterUI);

            var c = me.initCanvas({
                h: Math.max(
                    me.getSize()[1] - me.theme.padding.top - me.theme.padding.bottom - me.theme.vpadding,
                    18 * 1.35 * me.chart.dataSeries().length + 5
                )
            });

            var
            chart_width = c.w - c.lpad - c.rpad,
            series_gap = 0.05, // pull from theme
            row_gap = 0.01,
            labelsInsideBars = me.get('labels-inside-bars', false);

            if (me.chart.numRows() > 1) me.chart.filterRow(row);

            me.init();
            me.initDimensions(0);

            $('.tooltip').hide();

            c.lastBarY = 0;

            _.each(me.chart.dataSeries(sortBars, reverse), function(series, s) {
                _.each(series.data, function(val, r) {
                    var d = me.barDimensions(series, s, r),
                        lpos = me.labelPosition(series, s, r),
                        fill = me.getSeriesColor(series, r, useNegativeColor),
                        stroke = chroma.color(fill).darken(14).hex();

                    if (labelsInsideBars) d.x -= 10;

                    // draw bar
                    var bar = me.registerSeriesElement(c.paper.rect(d.x, d.y, d.width, d.height).attr({
                        'stroke': stroke,
                        'fill': fill
                    }).data('strokeCol', stroke), series);
                    if (me.theme.barChart.barAttrs) {
                        bar.attr(me.theme.barChart.barAttrs);
                    }

                    if (lpos.show_val) {
                        me.registerSeriesLabel(me.label(lpos.val_x, lpos.top, me.chart.formatValue(series.data[r], true),{
                            // w: 40,
                            align: lpos.val_align,
                            cl: 'value' + lpos.lblClass
                        }), series);
                    }

                    if (lpos.show_lbl) {
                        me.registerSeriesLabel(me.label(lpos.lbl_x , lpos.top, series.name,{
                            w: 160,
                            align: lpos.lbl_align,
                            cl: 'series' + lpos.lblClass
                        }), series);
                    }

                    c.lastBarY = Math.max(c.lastBarY, d.y + d.height);
                });
            });

            if (me.__domain[0] < 0) {
                var x = c.lpad + c.zero ;
                if (labelsInsideBars) x -= 10;
                // add y-axis
                me.__yaxis = me.path('M' + [x, c.tpad] + 'V' + c.lastBarY, 'axis')
                    .attr(me.theme.yAxis);
            }

            // enable mouse events
            el.mousemove(_.bind(me.onMouseMove, me));

        },

        update: function(row) {
            var me = this;
            // re-filter dataset
            me.chart.filterRow(row);

            // update scales
            me.initDimensions(0);

            // update bar heights and labels
            _.each(me.chart.dataSeries(me.get('sort-values', false)), function(series, s) {
                _.each(me.__seriesElements[series.name], function(rect) {
                    var dim = me.barDimensions(series, s, 0);
                    rect.animate(dim, me.theme.duration, me.theme.easing);
                });

                _.each(me.__seriesLabels[series.name], function(lbl) {
                    var pos = me.labelPosition(series, s, 0), lpos;
                    if (lbl.hasClass('value')) {
                        // update value
                        lbl.text(me.chart.formatValue(series.data[0]));
                        lpos = { halign: pos.val_align, left: pos.val_x, top: pos.top };
                    } else if (lbl.hasClass('series')) {
                        // update series label position
                        lpos = { halign: pos.lbl_align, left: pos.lbl_x, top: pos.top };
                    }
                    if (lpos) {
                        lbl.animate({
                            align: lpos.halign,
                            x: lpos.left,
                            y: lpos.top
                        }, me.theme.duration, me.theme.easing);
                    }
                });
            });
            if (me.__domain[0] < 0) {
                var c = me.__canvas,
                    x = c.lpad + c.zero - (me.get('labels-inside-bars', false) ? 10 : 0),
                    p = 'M' + [x, c.tpad] + 'V' + c.lastBarY;
                // add y-axis
                if (me.__yaxis) {
                    me.__yaxis.animate({ path: p, opacity: 1 }, me.theme.duration, me.theme.easing);
                } else {
                    me.__yaxis = me.path(p, 'axis').attr(me.theme.yAxis);
                }
            } else if (me.__yaxis) {
                me.__yaxis.animate({ opacity: 0 }, me.theme.duration * 0.5, me.theme.easing);
            }
        },

        initDimensions: function(r) {
            //
            var me = this, c = me.__canvas,
                dMin = 0, dMax = 0, w = c.w - c.lpad - c.rpad - 30;
            _.each(me.chart.dataSeries(), function(series) {
                if (!isNaN(series.min)) dMin = Math.min(dMin, series.min);
                if (!isNaN(series.max)) dMax = Math.max(dMax, series.max);
            });
            me.__domain = [dMin, dMax];
            me.__scales = {
                y: d3.scale.linear().domain([dMin, dMax])
            };
            /* how maxw works:
             *
             * maxw[0] .. max series name label width      \
             * maxw[1] .. max formatted value label width   } positive
             * largestVal[0] .. max absolute value               /
             * maxw[2] .. max series name label width      \
             * maxw[3] .. max formatted value label width   } negative
             * largestVal[1] .. max absolute value               /
             */
            var maxw = [0, 0, 0, 0], ratio, largestVal = [0, 0];
            _.each(me.chart.dataSeries(), function(series, s) {
                if (isNaN(series.data[r])) return;
                var neg = series.data[r] < 0;
                largestVal[neg ? 1 : 0] = Math.max(largestVal[neg ? 1 : 0], Math.abs(series.data[r]));
            });
            _.each(me.chart.dataSeries(), function(series, s) {
                if (isNaN(series.data[r])) return;
                var val = series.data[r],
                    neg = val < 0,
                    t = neg ? 2 : 0,
                    bw;
                bw = Math.abs(val) / (largestVal[0] + largestVal[1]) * w;
                maxw[t] = Math.max(maxw[t], me.labelWidth(series.name, 'series') + 20);
                maxw[t+1] = Math.max(maxw[t+1], me.labelWidth(me.chart.formatValue(series.data[r], true), 'value') + 20 + bw);
            });

            c.left = 0;
            c.right = 0;
            c.zero = largestVal[1] / (largestVal[0] + largestVal[1]) * w;

            if (!me.get('labels-inside-bars', false) && w > 300) {

                var maxNegBar = c.zero;
                //console.log('c.left', );
                c.left = Math.max(maxw[0], maxw[3]) - c.zero;
                c.right = Math.max(maxw[1], maxw[2]) - (w - c.zero); // Math.max((maxw[2] + maxw[1]) - (w - c.zero), 0);

                w -= c.left + c.right;

                c.zero = c.left + largestVal[1] / (largestVal[0] + largestVal[1]) * w;
            } else {
                c.zero += 15;
            }

            c.maxSeriesLabelWidth = [maxw[0], maxw[2]];
            c.maxValueLabelWidth = [maxw[1], maxw[3]];

            me.__scales.y.rangeRound([c.lpad, w]);
        },

        barDimensions: function(series, s, r) {
            var me = this, w, h, x, y, i, cw, n = me.chart.dataSeries().length,
                sc = me.__scales, c = me.__canvas, bw, pad = 0.35, vspace = 0.1,
                val = series.data[r];

            if (isNaN(val)) val = 0;
            //
            cw = c.h - c.bpad - c.tpad;
            //
            bw = Math.max(18, Math.min(50, cw / (n + (n-1) * pad)));
            w = sc.y(val) - sc.y(0);
            h = bw;
            if (w > 0) {
                x = c.lpad + c.zero;
            } else {
                x = c.lpad + c.zero + w;
                w *= -1;
            }
            if (val !== 0) w = Math.max(1, w);
            y = Math.round(c.tpad + s * (bw + bw * pad));
            return { width: w, height: h, x: x, y: y };
        },

        labelPosition: function(series, s, r) {
            var me = this,
                d = me.barDimensions(series, s, r),
                c = me.__canvas,
                val = series.data[r],
                lbl_left = val >= 0 || isNaN(val),
                lbl_x = lbl_left ?
                    c.zero - 10
                    : c.zero + 10,
                lbl_align = lbl_left ? 'right' : 'left',
                val_x = lbl_left ?
                    d.x + d.width + 10
                    : d.x - 10,
                val_align = lbl_left ? 'left' : 'right',
                show_lbl = true,
                show_val = true,
                lblClass = me.chart.hasHighlight() && me.chart.isHighlighted(series) ? ' highlighted' : '';

            if (me.get('labels-inside-bars', false)) {
                lbl_x = lbl_left ? d.x + 10 : d.x + d.width - 10;
                val_x = lbl_left ? d.x + d.width - 10 : d.x + 10;
                lbl_align = lbl_left ? 'left' : 'right';
                val_align = lbl_left ? 'right' : 'left';

                // check if the label is bigger than the bar
                var slblw = me.labelWidth(series.name, 'series')+10,
                    vlblw = me.labelWidth(me.chart.formatValue(val, true), 'value')+20,
                    fill = me.getSeriesColor(series, r, me.get('negative-color', false));
                if (slblw + vlblw > d.width) {
                    show_val = false;
                    if (slblw > d.width) show_lbl = false;
                }
                if (me.invertLabel(fill)) lblClass += ' inverted';
            }

            return { lblClass: lblClass, val_align: val_align, show_lbl: show_lbl,
                show_val: show_val, lbl_align: lbl_align, lbl_x: lbl_x, val_x: val_x,
                top: d.y + d.height * 0.5 };
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
                        var fill = me.getSeriesColor(s, 0, me.get('negative-color', false)), stroke;
                        if (series !== undefined && s.name == series.name) fill = chroma.color(fill).darken(14).hex();
                        stroke = chroma.color(fill).darken(14).hex();
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