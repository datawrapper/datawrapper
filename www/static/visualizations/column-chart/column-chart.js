
(function(){
    // Simple vertical bar chart
    // -------------------------

    var ColumnChart = Datawrapper.Visualizations.ColumnChart = function() {

    };

    _.extend(ColumnChart.prototype, Datawrapper.Visualizations.RaphaelChart.prototype, {

        render: function(el) {
            el = $(el);

            this.setRoot(el);

            var me = this,
            sortBars = me.get('sort-values'),
            reverse = me.get('reverse-order'),
            c = me.initCanvas({}),
            ds = me.chart.__dataset,
            chart_width = c.w - c.lpad - c.rpad,
            series_gap = 0.05, // pull from theme
            row_gap = 0.01;
            if (!_.isUndefined(me.get('selected-row'))) {
                row = me.get('selected-row');
            }

            //if (row > me.chart.numRows() || row === undefined) row = 0;
            ///if (me.chart.numRows() > 3) {
            //    me.chart.filterRows([0,1,2]);
                //me.warn('Displaying only the first three rows of data.');
           //}

            me.init();
            me.initDimensions();

            $('.tooltip').hide();

            me.horzGrid();

            var base = me.theme.colors.palette[me.get('base-color', 0)],
                bLch = d3.cie.lch(d3.rgb(base)),
                ml = Math.min(bLch.l, 50),
                colors = [];


            colors = d3.range(ml, 91, (90 - ml) / (me.chart.numRows() - 1)).map(function(l) {
                return ''+d3.cie.lch(l, bLch.c, bLch.h).rgb();
            });
            //


            ds.eachRow(function(i) {
                me.setRowColor(i, colors[i % colors.length]);
            });

            _.each(me.chart.dataSeries(sortBars, reverse), function(series, s) {
                _.each(series.data, function(val, r) {
                    var d = me.barDimensions(series, s, r);
                    var fill = me.getBarColor(series, r, me.get('negative-color', false)),
                        stroke = d3.cie.lch(d3.rgb(fill)).darker(0.6).toString();
                    me.registerSeriesElement(c.paper.rect(d.x, d.y, d.w, d.h).attr({
                        'stroke': stroke,
                        'fill': fill
                    }).data('strokeCol', stroke), series, r);

                    var val_y = val > 0 ? d.y - 10 : d.y + d.h + 10,
                        lbl_y = val <= 0 ? d.y - 10 : d.y + d.h + 5,
                        lblcl = ['series'],
                        lbl_w = d.bw,
                        valign = val > 0 ? 'top' : 'bottom',
                        halign = 'center';

                    if ((me.chart.hasHighlight() && me.chart.isHighlighted(series)) || (d.w > 40)) {
                        // add value labels
                        me.registerSeriesLabel(me.label(d.x + d.w * 0.5, val_y, me.chart.formatValue(series.data[r]),{
                            w: d.w,
                            align: 'center',
                            cl: 'value'
                        }), series);
                    }

                    if (me.chart.hasHighlight() && me.chart.isHighlighted(series)) {
                        lblcl.push('highlighted');
                    }
                    if (d.bw < 30) {
                        //lblcl.push('rotate90');
                        lbl_y += 5;
                        lbl_w = 100;
                        halign = 'right';
                    }
                    if (d.bw < 20) {
                        lblcl.push('smaller');
                        lbl_w = 90;
                    }
                    // add series label
                    if (!/^X\.\d+$/.test(series.name) && r === 0) {
                        me.registerSeriesLabel(me.label(d.bx + d.bw * 0.5, lbl_y, series.name, {
                            w: lbl_w,
                            align: halign,
                            valign: valign,
                            cl: lblcl.join(' '),
                            rotate: d.bw < 30 ? -90 : 0
                        }), series);
                    }

                });
            });

            var y = c.h - me.__scales.y(0) - c.bpad;
            me.path([['M', c.lpad, y], ['L', c.w - c.rpad, y]], 'axis')
                .attr(me.theme.yAxis);

            // enable mouse events
            el.mousemove(_.bind(me.onMouseMove, me));

            if (me.chart.numRows() > 1) {
                // add legend
                var l = $('<div class="legend"></div>'),
                    xo = 0;

                me.chart.__dataset.eachRow(function(r) {
                    div = $('<div></div>');
                    div.css({
                        background: me.getBarColor(null, r),
                        width: 12,
                        height: 12,
                        position: 'absolute',
                        left: xo,
                        top: 1
                    });
                    l.append(div);
                    lbl = me.label(xo + 15, 0, me.chart.__dataset.rowName(r), {
                        valign: 'left',
                        root: l
                    });
                    xo += me.labelWidth(me.chart.__dataset.rowName(r))+30;
                });
                l.css({
                    position: 'relative'
                });
                $('#header', c.root.parent()).append(l);
            }
        },

        getBarColor: function(series, row, useNegativeColor, colorful) {
            var me = this,
                main = series && useNegativeColor && series.data[row] < 0 ? 'negative' : 'main',
                hl = series && me.chart.hasHighlight() && me.chart.isHighlighted(series);

            return me.getSeriesColor(series, row, useNegativeColor);

            if (useNegativeColor) {
                return me.theme.colors[(hl ? 'highlight-' : '') + (series.data[row] < 0 ? 'positive' : 'negative')];
            }
            var col = me.theme.colors.palette[row % me.theme.colors.palette.length];
            if (series === null || me.chart.isHighlighted(series)) return col;
            var hsl = d3.hsl(col);
            //lch.c *= 0.15;
            //lch.l *= 1.15;
            hsl.s = 0.3;
            hsl.l *= 1.1;
            return hsl.toString();

            // // use a different color, if set via setSeriesColor
            // if (me.__customSeriesColors && me.__customSeriesColors[series.name])
            //     return me.__customSeriesColors[series.name];
            // if (!me.chart.hasHighlight()) return me.theme.colors[main];
            // return me.theme.colors[me.chart.isHighlighted(series) ? highlight : main];
        },

        initDimensions: function(r) {
            //
            var me = this, c = me.__canvas,
                dMin = 0, dMax = 0;
            _.each(me.chart.dataSeries(), function(series) {
                dMin = Math.min(dMin, series.min);
                dMax = Math.max(dMax, series.max);
            });
            me.__domain = [dMin, dMax];
            me.__scales = {
                y: d3.scale.linear().domain([dMin, dMax])
            };

            me.__scales.y.rangeRound([0, c.h - c.bpad - c.tpad]);
        },

        barDimensions: function(series, s, r) {
            var me = this,
                sc = me.__scales,
                c = me.__canvas,
                n = me.chart.dataSeries().length,
                w, h, x, y, i, cw, bw,
                pad = 0.35,
                vspace = 0.1;

            if (c.w / n < 30) vspace = 0.05;

            cw = (c.w - c.lpad - c.rpad) * (1 - vspace - vspace);
            bw = cw / (n + (n-1) * pad);
            h = sc.y(series.data[r]) - sc.y(0);
            w = Math.round(bw / series.data.length);
            if (h >= 0) {
                y = c.h - c.bpad - sc.y(0) - h;
            } else {
                y = c.h - c.bpad - sc.y(0);
                h *= -1;
            }
            x = Math.round((c.w - c.lpad - c.rpad) * vspace + c.lpad + s * (bw + bw * pad));
            return { w: w, h: h, x: x + Math.floor((w+1)*r), y: y, bx: x, bw: bw };
        },

        getDataRowByPoint: function(x, y) {
            return 0;
        },

        showTooltip: function() {

        },

        hideTooltip: function() {
            
        },

        horzGrid: function() {
            // draw tick marks and labels
            var me = this,
                yscale = me.__scales.y,
                c = me.__canvas,
                domain = me.__domain,
                styles = me.__styles,
                ticks = me.getYTicks(c.h);

            _.each(ticks, function(val, t) {
                if (t == ticks.length-1) return;
                var y = c.h - c.bpad - yscale(val), x = c.lpad;
                if (val >= domain[0] && val <= domain[1]) {
                    // c.paper.text(x, y, val).attr(styles.labels).attr({ 'text-anchor': 'end' });
                    me.label(x+2, y-10, me.chart.formatValue(val, t == ticks.length-2, true), { align: 'left', cl: 'axis' });
                    if (me.theme.yTicks) {
                        me.path([['M', c.lpad-25, y], ['L', c.lpad-20,y]], 'tick');
                    }
                    if (me.theme.horizontalGrid) {
                        me.path([['M', c.lpad, y], ['L', c.w - c.rpad,y]], 'grid')
                            .attr(me.theme.horizontalGrid);
                    }
                }
            });
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
                        var fill = me.getBarColor(s, el.data('row'), me.get('negative-color', false)), stroke;
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