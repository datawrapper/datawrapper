
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
                row = me.get('selected-row');
                if (row > me.chart.numRows() || row === undefined) row = 0;
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
                n = me.chart.dataSeries().length;
            _.each(me.chart.dataSeries(), function(series, s) {
                lh = Math.max(lh, me.labelHeight(series.name, 'series', c.w / (n)));
            });
            c.bpad = lh+10;


            me.initDimensions();

            $('.tooltip').hide();

            if (!me.theme.columnChart.cutGridLines) me.horzGrid();

            var base = me.theme.colors.palette[me.get('base-color', 0)],
                bLch = d3.cie.lch(d3.rgb(base)),
                ml = Math.min(bLch.l, 50),
                colors = [];


            colors = d3.range(ml, 91, (90 - ml) / (me.chart.numRows() - 1)).map(function(l) {
                return ''+d3.cie.lch(l, bLch.c, bLch.h).rgb();
            }).reverse();

            ds.eachRow(function(i) {
                me.setRowColor(i, colors[i % colors.length]);
            });

            _.each(me.chart.dataSeries(sortBars, reverse), function(series, s) {
                _.each(series.data, function(val, r) {
                    var d = me.barDimensions(series, s, r);
                    var fill = me.getBarColor(series, r, me.get('negative-color', false)),
                        stroke = d3.cie.lch(d3.rgb(fill)).darker(0.6).toString();
                    // create bar
                    me.registerSeriesElement(c.paper.rect().attr(d).attr({
                        'stroke': stroke,
                        'fill': fill
                    }).data('strokeCol', stroke), series, r);

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
                        cl: 'value' + (alwaysShow ? '' : ' showOnHover')
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
                    rect.animate(dim, 1000, 'expoInOut');
                });

                _.each(me.__seriesLabels[series.name], function(lbl) {
                    var lpos;
                    if (lbl.hasClass('value')) {
                        // update value
                        $('span', lbl).html(me.chart.formatValue(series.data[0]));
                        lpos = me.labelPosition(series, s, 0, 'value');
                    } else if (lbl.hasClass('series')) {
                        // update series label position
                        lpos = me.labelPosition(series, s, 0, 'series');
                    }
                    if (lpos) {
                        lbl.data('attrs', $.extend(lbl.data('attrs'), { valign: lpos.valign, halign: lpos.halign }));
                        var lattrs = lbl.data('lblcss')(lbl, lpos.left, lpos.top);
                        if (lattrs['text-align']) {
                            lbl.css('text-align', lattrs['text-align']);
                            lattrs['text-align'] = undefined;
                            delete lattrs['text-align'];
                        }
                        lbl.animate(lattrs, {
                            easing: 'easeInOutExpo',
                            duration: 1000
                        });
                    }
                });
            });
        },

        getBarColor: function(series, row, useNegativeColor, colorful) {
            var me = this,
                main = series && useNegativeColor && series.data[row] < 0 ? 'negative' : 'main',
                hl = series && me.chart.hasHighlight() && me.chart.isHighlighted(series);

            return me.getSeriesColor(series, row, useNegativeColor);

            /*if (useNegativeColor) {
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
            // return me.theme.colors[me.chart.isHighlighted(series) ? highlight : main];*/
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
            return { width: w, height: h, x: x + Math.floor((w+1)*r), y: y, bx: x, bw: bw };
        },

        labelPosition: function(series, s, r, type) {
            var me = this, d = me.barDimensions(series, s, r),
                val = series.data[r],
                c = me.__canvas,
                valign = val > 0 ? 'top' : 'bottom',
                halign = 'center',

                lbl_w = c.w / (me.chart.dataSeries().length+2),
                val_y = val > 0 ? d.y - 10 : d.y + d.height + 10,
                lbl_y = val <= 0 ? d.y - 10 : d.y + d.height + 5;

            if (type == "value") {
                return { left: d.x + d.width * 0.5, top: val_y, width: d.width };
            } else if (type == "series") {
                if (d.bw < 30) {
                    //lblcl.push('rotate90');
                    lbl_y += 5;
                    lbl_w = 100;
                    halign = 'right';
                }
                if (d.bw < 20) {
                    lbl_w = 90;
                }
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

            _.each(ticks, function(val, t) {
                var y = c.h - c.bpad - yscale(val), x = c.lpad, ly = y-10;
                if (val >= domain[0] && val <= domain[1]) {
                    // c.paper.text(x, y, val).attr(styles.labels).attr({ 'text-anchor': 'end' });
                    if (me.theme.columnChart.cutGridLines) ly += 10;
                    var key = String(val);
                    // show or update label
                    if (val !== 0) {
                        var lbl = tickLabels[key] = tickLabels[key] || me.label(x+2, ly, me.chart.formatValue(val, t == ticks.length-2, true), { align: 'left', cl: 'axis' }).css({ opacity: 0 });
                        lcss = lbl.data('lblcss');
                        var lattrs = $.extend(lcss(lbl, c.lpad+2, ly), { opacity: 1 });
                        if (lattrs['text-align']) {
                            lbl.css('text-align', lattrs['text-align']);
                            lattrs['text-align'] = undefined;
                            delete lattrs['text-align'];
                        }
                        lbl.animate(lattrs, { duration: 1000, easing: 'easeInOutExpo' });
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
                        l.animate(lattrs, 1000, 'expoInOut');
                    }
                }
            });
            // hide invisible grid lines
            $.each(gridLines, function(val, line) {
                if (_.indexOf(ticks, Number(val)) < 0) {
                    var y = c.h - c.bpad - yscale(val), props;
                    props = $.extend(me.theme.horizontalGrid, { path: [['M', c.lpad, y], ['L', c.w - c.rpad, y]], opacity: 0 });
                    line.animate(props, 1000, 'expoInOut');
                    if (tickLabels[val]) {
                        var lbl = tickLabels[val], lcss = lbl.data('lblcss'),
                            lattrs = $.extend(lcss(lbl, c.lpad+2, y + (me.theme.columnChart.cutGridLines ? -10 : 0)), { opacity: 0 });
                        lattrs.top = Math.min(lattrs.top, c.h);
                        tickLabels[val].animate(lattrs, { duration: 1000, easing: 'easeInOutExpo' });
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