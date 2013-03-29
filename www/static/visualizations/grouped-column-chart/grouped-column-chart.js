
(function(){
    // Simple vertical bar chart
    // -------------------------

    var GroupedColumnChart = Datawrapper.Visualizations.GroupedColumnChart = function() {

    };

    _.extend(GroupedColumnChart.prototype, Datawrapper.Visualizations.RaphaelChart.prototype, {

        // some config
        _showValueLabels: function() { return true; },

        _getRowColors: function() {
            var me = this,
                base = me.theme.colors.palette[me.get('base-color', 0)],
                bLch = chroma.hex(base),
                ml = Math.min(bLch.l, 50),
                colors = [];

            colors = d3.range(ml, 91, (90 - ml) / (me.chart.numRows() - 1)).map(function(l) {
                return chroma.lch(l, bLch.c, bLch.h).hex();
            });
            return colors;
        },

        getRowColors: function() {
            return this._getRowColors().reverse();
        },

        render: function(el) {
            el = $(el);

            this.setRoot(el);

            var me = this,
            c = me.initCanvas({}),
            dataset = me.chart.__dataset,
            chart_width = c.w - c.lpad - c.rpad,
            series_gap = 0.05, // pull from theme
            row_gap = 0.01;
            if (!_.isUndefined(me.get('selected-row'))) {
                row = me.get('selected-row');
            }

            me.init();

            // compute maximum x-label height
            var lh = 0,
                n = me.chart.dataSeries().length;
            _.each(me.chart.dataSeries(), function(series, s) {
                lh = Math.max(lh, me.labelHeight(series.name, 'series', c.w / (n)));
            });
            c.bpad = lh+10;


            me.initDimensions();

            $('.tooltip').hide();

            // store bar references for updates
            me.__bars = {};
            me.__gridlines = {};
            me.__gridlabels = {};
            me.__series_names = {};

            if (!me.theme.columnChart.cutGridLines) me.horzGrid();

            var colors = me.getRowColors();

            dataset.eachRow(function(i) {
                me.setRowColor(i, colors[i % colors.length]);
            });

            me.update();

            // enable mouse events
            el.mousemove(_.bind(me.onMouseMove, me));

            if (me.chart.numRows() > 1) {
                var items = [];
                dataset.eachRow(function(r) {
                    items.push({
                        label: dataset.rowName(r),
                        color: me.getBarColor(null, r)
                    });
                });
                me.addLegend(items, $('#header', c.root.parent()));
            }
            $('.showOnHover').hide();

            if (me.theme.columnChart.cutGridLines) me.horzGrid();

            me.post_render();
        },

        update: function() {
            var me = this, c = me.__canvas, n = me.chart.dataSeries().length;
            // draw bars
            _.each(me.chart.dataSeries(me.get('sort-values'), me.get('reverse-order')), function(series, s) {
                _.each(series.data, function(val, r) {
                    var d = me.barDimensions(series, s, r),
                        fill = me.getBarColor(series, r, me.get('negative-color', false)),
                        stroke = chroma.color(fill).darken(15).hex(),
                        key = series.name+'-'+r,
                        bar_attrs = {
                            x: d.x,
                            y: d.y,
                            width: d.w,
                            height: d.h,
                            stroke: stroke,
                            fill: fill
                        };

                    me.__bars[key] = me.__bars[key] || me.registerSeriesElement(c.paper.rect().attr(bar_attrs), series, r);
                    me.__bars[key].animate(bar_attrs, me.theme.duration, me.theme.easing).data('strokeCol', stroke);

                    var val_y = val >= 0 ? d.y - 10 : d.y + d.h + 10,
                        lbl_y = val < 0 ? d.y - 10 : d.y + d.h + 5,
                        lblcl = ['series'],
                        lbl_w = c.w / (n+2),
                        valign = val >= 0 ? 'top' : 'bottom',
                        halign = 'center',
                        alwaysShow = (me.chart.hasHighlight() && me.chart.isHighlighted(series)) || (d.w > 40);

                    if (false && me._showValueLabels()) {
                        // add value labels
                        me.registerSeriesLabel(me.label(d.x + d.w * 0.5, val_y, me.formatValue(series.data[r]),{
                            w: d.w,
                            align: 'center',
                            cl: 'value' + (alwaysShow ? '' : ' showOnHover')
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


                        var la = {
                                x: d.bx + d.bw * 0.5,
                                y: lbl_y,
                                w: lbl_w,
                                align: halign,
                                valign: valign,
                                cl: lblcl.join(' '),
                                rotate: d.bw < 30 ? -90 : 0
                            },
                            sl = me.__series_names[series.name] = me.__series_names[series.name] ||
                                me.registerSeriesLabel(me.label(la.x, la.y, series.name, la), series);

                        sl.animate(la, me.theme.duration, me.theme.easing);
                    }

                });
            });

            // draw baseline
            var y = c.h - me.__scales.y(0) - c.bpad;
            me.path([['M', c.lpad, y], ['L', c.w - c.rpad, y]], 'axis')
                .attr(me.theme.yAxis);
        },

        getBarColor: function(series, row, useNegativeColor, colorful) {
            var me = this,
                main = series && useNegativeColor && series.data[row] < 0 ? 'negative' : 'main',
                hl = series && me.chart.hasHighlight() && me.chart.isHighlighted(series);

            return me.getSeriesColor(series || me.chart.dataSeries()[0], row, false, false);
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
            //                                                    v-- substract a few pixel to get space for the legend!
            me.__scales.y.rangeRound([0, c.h - c.bpad - c.tpad - 30]);
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
                ticks = me.getYTicks(c.h, true);

            ticks = ticks.filter(function(val, t) {
                return val >= domain[0] && val <= domain[1];
            });

            _.each(ticks, function(val, t) {
                var y = c.h - c.bpad - yscale(val),
                    x = c.lpad, ly = y-10, lbl,
                    txt = me.formatValue(val, t == ticks.length-1, true);
                // c.paper.text(x, y, val).attr(styles.labels).attr({ 'text-anchor': 'end' });
                if (me.theme.columnChart.cutGridLines) ly += 10;

                if (val !== 0) {
                    lbl = me.__gridlabels[val] = me.__gridlabels[val] || me.label(x+2, ly, txt, { align: 'left', cl: 'axis', css: { opacity: 0 } });
                    lbl.animate({ x: x+2, y: ly, css: { opacity: 1 } }, me.theme.duration, me.theme.easing);
                }

                if (me.theme.yTicks) {
                    me.path([['M', c.lpad-25, y], ['L', c.lpad-20,y]], 'tick');
                }
                if (me.theme.horizontalGrid) {
                    var p = 'M' + [c.lpad, y] + 'H' + c.w,
                        l = me.__gridlines[val] = me.__gridlines[val] || me.path(p, 'grid').attr(me.theme.horizontalGrid).attr('opacity', 0);

                    if (val === 0) l.attr(me.theme.xAxis);
                    else if (me.theme.columnChart.cutGridLines) l.attr('stroke', me.theme.colors.background);

                    l.animate({ path: p, opacity: 1 }, me.theme.duration, me.theme.easing);
                    l.toBack();
                }
            });

            _.each(me.__gridlabels, function(lbl, val) {
                if (_.indexOf(ticks, +val) < 0) {
                    lbl.animate({ css: { opacity: 0 } }, me.theme.duration, me.theme.easing);
                }
            });
            _.each(me.__gridlines, function(line, val) {
                if (_.indexOf(ticks, +val) < 0) {
                    line.animate({ opacity: 0 }, me.theme.duration, me.theme.easing);
                }
            });
        },

        hoverSeries: function(series) {
            var me = this;
            _.each(me.chart.dataSeries(), function(s) {
                _.each(me.__seriesLabels[s.name], function(lbl) {
                    if (series !== undefined && s.name == series.name) {
                        lbl.addClass('hover');
                        if (lbl.hasClass('showOnHover')) lbl.show(0.5);
                    } else {
                        lbl.removeClass('hover');
                        if (lbl.hasClass('showOnHover')) lbl.hide(0.5);
                    }
                    _.each(me.__seriesElements[s.name], function(el) {
                        var fill = me.getBarColor(s, el.data('row'), me.get('negative-color', false)), stroke;
                        if (series !== undefined && s.name == series.name) fill = chroma.color(fill).darken(15).hex();
                        stroke = chroma.color(fill).darken(15).hex();
                        if (el.attrs.fill != fill || el.attrs.stroke != stroke)
                            el.animate({ fill: fill, stroke: stroke }, 50);
                    });
                });
            });
        },

        unhoverSeries: function() {
            this.hoverSeries();
        },

        formatValue: function() {
            return this.chart.formatValue.apply(this.chart, arguments);
        },

        post_render: function() {

        }
    });

}).call(this);