
(function(){
    // Simple vertical bar chart
    // -------------------------

    var ColumnChart = Datawrapper.Visualizations.ColumnChart = function() {

    };

    _.extend(ColumnChart.prototype, Datawrapper.Visualizations.RaphaelChart.prototype, {

        render: function(el) {
            var me = this, filterUI, sortBars, reverse, c, ds, chart_width, series_gap, row_gap, row;

            el = $(el);

            this.setRoot(el);

            row = 0;
            if (!_.isUndefined(me.get('selected-row'))) {
                row = me.get('selected-row', 0);
                if (row > me.chart.numRows()) row = 0;
            }

            filterUI = me.getFilterUI(row);
            if (filterUI) {
                $('#header').append(filterUI);
            }

            sortBars = me.get('sort-values');
            reverse = me.get('reverse-order');
            c = me.initCanvas({}, 0, filterUI ? filterUI.height() + 10 : 0);
            ds = me.chart.__dataset;
            chart_width = c.w - c.lpad - c.rpad;
            series_gap = 0.05; // pull from theme
            row_gap = 0.01;

            // 2d -> 1d
            if (me.chart.numRows() > 1) me.chart.filterRow(row);

            if (filterUI) c.tpad += 10;

            me.init();

            // compute maximum x-label height
            var lh = 0,
                mm = ds.minMax(),
                mm_r = mm[0] >= 0 ? 1 : mm[1] <= 0 ? 0 : mm[1] / (mm[1] - mm[0]),
                n = me.chart.dataSeries().length;
            _.each(me.chart.dataSeries(), function(series, s) {

                lh = Math.max(lh,
                    chart_width /(n + (n-1) * 0.35) > 31 ?
                      me.labelHeight(series.name, 'series', c.w / (n))
                    : me.labelWidth(series.name, 'series')
                );
            });
            c.bpad = lh * mm_r + 10;
            c.tpad += lh * (1-mm_r);

            me.initDimensions();

            $('.tooltip').hide();

            if (!me.theme.columnChart.cutGridLines) me.horzGrid();

            var base = me.theme.colors.palette[me.get('base-color', 0)],
                bLch = chroma.color(base).lch(),
                ml = Math.min(bLch.l, 50),
                colors = [];


            colors = d3.range(ml, 91, (90 - ml) / (me.chart.numRows() - 1)).map(function(l) {
                return chroma.lch(l, bLch.c, bLch.h).hex();
            }).reverse();

            ds.eachRow(function(i) {
                me.setRowColor(i, colors[i % colors.length]);
            });

            _.each(me.chart.dataSeries(sortBars, reverse), function(series, s) {
                _.each(series.data, function(val, r) {
                    var d = me.barDimensions(series, s, r);
                    var fill = me.getBarColor(series, r, me.get('negative-color', false)),
                        stroke = chroma.color(fill).darken(14).hex(),
                    // create bar
                    bar = me.registerSeriesElement(c.paper.rect().attr(d).attr({
                        'stroke': stroke,
                        'fill': fill
                    }).data('strokeCol', stroke), series, r);

                    if (me.theme.columnChart.barAttrs) {
                        bar.attr(me.theme.columnChart.barAttrs);
                    }

                    var val_y = val > 0 ? d.y - 10 : d.y + d.height + 10,
                        lbl_y = val <= 0 ? d.y - 10 : d.y + d.height + 5,
                        lblcl = ['series'],
                        lbl_w = c.w / (n+2),
                        valign = val > 0 ? 'top' : 'bottom',
                        halign = 'center',
                        alwaysShow = (me.chart.hasHighlight() && me.chart.isHighlighted(series)) || (d.width > 40);

                    var lpos = me.labelPosition(series, s, r, 'value'),
                        spos = me.labelPosition(series, s, r, 'series');

                    // add value labels
                    me.registerSeriesLabel(me.label(lpos.left, lpos.top, me.chart.formatValue(series.data[r]),{
                        w: lpos.width,
                        align: 'center',
                        cl: 'value outline ' + (alwaysShow ? '' : ' showOnHover')
                    }), series);

                    if (me.chart.hasHighlight() && me.chart.isHighlighted(series)) {
                        lblcl.push('highlighted');
                    }
                    if (d.bw < 30) {
                        halign = 'right';
                    }
                    if (d.bw < 20) {
                        lblcl.push('smaller');
                    }
                    // add series label
                    if (!/^X\.\d+$/.test(series.name) && r === 0) {
                        me.registerSeriesLabel(me.label(spos.left, spos.top, series.name, {
                            w: spos.width,
                            align: spos.halign,
                            valign: spos.valign,
                            cl: lblcl.join(' '),
                            rotate: d.bw < 30 ? -90 : 0
                        }), series);
                    }

                });
            });

            var y = c.h - me.__scales.y(0) - c.bpad;
            /*me.path([['M', c.lpad, y], ['L', c.w - c.rpad, y]], 'axis')
                .attr(me.theme.yAxis);*/

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
            $('.showOnHover').hide();

            if (me.theme.columnChart.cutGridLines) me.horzGrid();
            if (me.__gridLines && me.__gridLines['0']) me.__gridLines['0'].toFront();
        },

        update: function(row) {
            var me = this;
            // re-filter dataset
            me.chart.filterRow(row);

            // update scales
            me.initDimensions();

            // update axis and grid
            me.horzGrid();

            // update bar heights and labels
            _.each(me.chart.dataSeries(), function(series, s) {
                _.each(me.__seriesElements[series.name], function(rect) {
                    var dim = me.barDimensions(series, s, 0);
                    rect.animate(dim, me.theme.duration, me.theme.easing);
                });

                _.each(me.__seriesLabels[series.name], function(lbl) {
                    var lpos;
                    if (lbl.hasClass('value')) {
                        // update value
                        lbl.text(me.chart.formatValue(series.data[0]));
                        lpos = me.labelPosition(series, s, 0, 'value');
                    } else if (lbl.hasClass('series')) {
                        // update series label position
                        lpos = me.labelPosition(series, s, 0, 'series');
                    }
                    if (lpos) {
                        lbl.animate({
                            x: lpos.left,
                            y: lpos.top,
                            align: lpos.halign,
                            valign: lpos.valign
                        }, me.theme.duration, me.theme.easing);
                    }
                });
            });
            if (me.__gridLines['0']) me.__gridLines['0'].toFront();
        },

        getBarColor: function(series, row, useNegativeColor, colorful) {
            var me = this,
                main = series && useNegativeColor && series.data[row] < 0 ? 'negative' : 'main',
                hl = series && me.chart.hasHighlight() && me.chart.isHighlighted(series);

            return me.getSeriesColor(series, row, useNegativeColor);
        },

        initDimensions: function(r) {
            //
            var me = this, c = me.__canvas,
                dMin = 0, dMax = 0;
            _.each(me.chart.dataSeries(), function(series) {
                if (!isNaN(series.min)) dMin = Math.min(dMin, series.min);
                if (!isNaN(series.max)) dMax = Math.max(dMax, series.max);
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
                vspace = 0.1,
                val = series.data[r];

            if (isNaN(val)) val = 0;

            if (c.w / n < 30) vspace = 0.05;

            cw = (c.w - c.lpad - c.rpad) * (1 - vspace - vspace);
            bw = cw / (n + (n-1) * pad);
            h = sc.y(val) - sc.y(0);
            w = Math.round(bw / series.data.length);
            if (h >= 0) {
                y = c.h - c.bpad - sc.y(0) - h;
            } else {
                y = c.h - c.bpad - sc.y(0);
                h *= -1;
            }
            if (h !== 0) h = Math.max(1, h);
            x = Math.round((c.w - c.lpad - c.rpad) * vspace + c.lpad + s * (bw + bw * pad));
            return { width: w, height: h, x: x + Math.floor((w+1)*r), y: y, bx: x, bw: bw };
        },

        labelPosition: function(series, s, r, type) {
            var me = this, d = me.barDimensions(series, s, r),
                val = series.data[r],
                c = me.__canvas,
                lbl_top = val >= 0 || isNaN(val),
                valign = lbl_top ? 'top' : 'bottom',
                halign = 'center',
                lbl_w = c.w / (me.chart.dataSeries().length+2),
                val_y = lbl_top ? d.y - 10 : d.y + d.height + 10,
                lbl_y = !lbl_top ? d.y - 5 : d.y + d.height + 5;

            if (type == "value") {
                return { left: d.x + d.width * 0.5, top: val_y, width: d.width };
            } else if (type == "series") {
                if (d.bw < 30) {
                    //lblcl.push('rotate90');
                    lbl_y -= 10;  // move towards zero axis
                    lbl_w = 100;
                    halign = 'right'; // lbl_top ? 'right' : 'left';
                }
                if (d.bw < 20) {
                    lbl_w = 90;
                }
                //console.log(series.name, { left: d.bx + d.bw * 0.5, top: lbl_y, width: lbl_w, halign: halign, valign: valign });
                return { left: d.bx + d.bw * 0.5, top: lbl_y, width: lbl_w, halign: halign, valign: valign };
            }
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
                ticks = me.getYTicks(c.h, true),
                tickLabels = me.__tickLabels = me.__tickLabels || {},
                gridLines = me.__gridLines = me.__gridLines || {};

            ticks = ticks.filter(function(val, t) {
                return val >= domain[0] && val <= domain[1];
            });

            _.each(ticks, function(val, t) {
                var y = c.h - c.bpad - yscale(val), x = c.lpad, ly = y-10;
                // c.paper.text(x, y, val).attr(styles.labels).attr({ 'text-anchor': 'end' });
                if (me.theme.columnChart.cutGridLines) ly += 10;
                var key = String(val);
                // show or update label
                if (val !== 0) {
                    var lbl = tickLabels[key] = tickLabels[key] ||
                        me.label(x+2, ly, me.chart.formatValue(val, t == ticks.length-1, true),
                            { align: 'left', cl: 'axis', css: { opacity: 0 } });
                    lbl.animate({ x: c.lpad+2, y: ly, css: { opacity: 1 } }, me.theme.duration, me.theme.easing);
                }
                if (me.theme.yTicks) {
                    me.path([['M', c.lpad-25, y], ['L', c.lpad-20,y]], 'tick');
                }
                if (me.theme.horizontalGrid) {
                    var lattrs = { path: [['M', c.lpad, y], ['L', c.w - c.rpad,y]], opacity: 1 },
                        l = gridLines[key] = gridLines[key] || me.path(lattrs.path, 'grid');
                    l.toBack();
                    if (val === 0) {
                        lattrs = $.extend(me.theme.xAxis, lattrs);
                        l.toFront();
                    } else {
                        l.attr(me.theme.horizontalGrid);
                        lattrs = $.extend(me.theme.horizontalGrid, lattrs);
                    }
                    if (val !== 0 && me.theme.columnChart.cutGridLines) lattrs.stroke = me.theme.colors.background;
                    l.animate(lattrs, me.theme.duration, me.theme.easing);
                }
            });
            // hide invisible grid lines
            $.each(gridLines, function(val, line) {
                if (_.indexOf(ticks, Number(val)) < 0) {
                    var y = c.h - c.bpad - yscale(val), props;
                    props = $.extend(me.theme.horizontalGrid, { path: [['M', c.lpad, y], ['L', c.w - c.rpad, y]], opacity: 0 });
                    line.animate(props, me.theme.duration, me.theme.easing);
                    if (tickLabels[val]) {
                        var lbl = tickLabels[val];

                        tickLabels[val].animate({
                            x: c.lpad+2,
                            y: y + (me.theme.columnChart.cutGridLines ? -10 : 0),
                            css: {
                                opacity: 0
                            }
                        }, me.theme.duration, me.theme.easing );

                        
                        // lattrs.top = Math.min(lattrs.top, c.h);
                        // tickLabels[val].animate(lattrs, { duration: me.theme.duration, easing: me.theme.easing });
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
                        if (lbl.hasClass('showOnHover')) lbl.show(0.5);
                    } else {
                        lbl.removeClass('hover');
                        if (lbl.hasClass('showOnHover')) lbl.hide(0.5);
                    }
                    _.each(me.__seriesElements[s.name], function(el) {
                        var fill = me.getBarColor(s, el.data('row'), me.get('negative-color', false)), stroke;
                        if (series !== undefined && s.name == series.name) fill = chroma.color(fill).darken(14).hex();
                        stroke = chroma.color(fill).darken(18).hex();
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