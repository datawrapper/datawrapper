(function(){

    // Simple line chart
    // -----------------

    var LineChart = Datawrapper.Visualizations.LineChart = function() {};

    _.extend(LineChart.prototype, Datawrapper.Visualizations.RaphaelChart.prototype, {

        render: function(el, thumb) {
            el = $(el);
            var
            me = this;
            me.setRoot(el);

            var
            ds = me.dataset,
            bpad = me.theme.padding.bottom,
            directLabeling = me.get('direct-labeling'),
            baseCol = Math.max(0, me.get('base-color', 0)),
            scales = me.__scales = {
                x: me.xScale(),
                y: me.yScale()
            },
            legend = {
                pos: me.get('legend-position', 'right'),
                xoffset: 0,
                yoffset: -5
            },
            h = me.get('force-banking') ? el.width() / me.computeAspectRatio() : me.getSize()[1],
            c;

            me.init();
            c = me.initCanvas({
                h: thumb ? h : h,
                bpad: thumb ? 0 : me.get('rotate-x-labels') ? bpad + 20 : bpad
            });
            if (c.w <= me.theme.minWidth) {
                c.tpad = 15;
                c.rpad = 9;
                c.lpad = 5;
                c.bpad = 5;
            }
            if (!directLabeling && me.lineLabelsVisible() && legend.pos != 'right') {
                c.tpad += 20;
                c.rpad = 0;
            }


            if (me.lineLabelsVisible() && (directLabeling || legend.pos == 'right')) {
                c.labelWidth = 0;
                _.each(me.chart.dataSeries(), function(col) {
                    c.labelWidth = Math.max(c.labelWidth, me.labelWidth(col.name, 'series'));
                });
                if (c.labelWidth > me.theme.lineChart.maxLabelWidth) {
                    c.labelWidth = me.theme.lineChart.maxLabelWidth;
                }
                c.rpad += c.labelWidth + 20;
                if (!directLabeling) c.rpad += 15;
            } else {
                c.rpad += 5;
            }

            if (!directLabeling && legend.pos != 'right') {
                // some more space for last x-label
                c.rpad += 0.25 * me.labelWidth(me.chart.rowLabel(me.numRows-1));
            }

            c.lpad2 = me.yAxisWidth(h);

            if (thumb) {
                c.tpad = c.bpad = c.lpad = c.rpad = c.lpad2 = 5;
            }

            function frame() {
                return c.paper.rect(
                    c.lpad + c.lpad2,
                    c.tpad,
                    c.w - c.rpad - c.lpad - c.lpad2,
                    c.h - c.bpad - c.tpad
                ).attr(me.theme.frame);
            }

            if (me.theme.frame) {
                frame().attr({ stroke: false });
                scales.y = scales.y.nice();
            }

            scales.x = scales.x.range([c.lpad + c.lpad2, c.w-c.rpad]);
            scales.y = scales.y.range([c.h-c.bpad, c.tpad]);

            me.yAxis();

            me.xAxis();

            var all_series = me.chart.dataSeries(),
                seriesLines = this.__seriesLines = {},
                legend_y_offset = 0;

            if (!directLabeling) {
                // sort lines by last data point
                all_series = all_series.sort(function(a, b) {
                    return b.data[ds.numRows()-1] -a.data[ds.numRows()-1];
                });
                //
                if (legend.pos == "inside") {
                    legend.xoffset = me.yAxisWidth(h);
                    legend.yoffset = 40;
                }
            }

            // draw series lines
            var all_paths = [];
            _.each(all_series, function(col, index) {
                var paths = [], pts_ = [], pts = [], x, y, sw, connectMissingValuePath = [];
                _.each(col.data, function(val, i) {
                    x = scales.x(i);
                    y = scales.y(val);

                    if (isNaN(y)) {
                        // store the current line
                        if (pts.length > 0) {
                            pts_.push(pts);
                            pts = [];
                        }
                        return;
                    }
                    if (pts.length === 0 && pts_.length > 0) {
                        // first valid point after NaNs
                        var lp = pts_[pts_.length-1], s = lp.length-2;
                        connectMissingValuePath.push('M'+[lp[s], lp[s+1]]+'L'+[ x, y]);
                    }
                    pts.push(x, y); // store current point
                });
                // store the last line
                pts_.push(pts);
                _.each(pts_, function(pts) {
                    paths.push("M" + [pts.shift(), pts.shift()] + (me.get('smooth-lines') ? "R" : "L") + pts);
                });

                sw = me.getSeriesLineWidth(col);
                var palette = me.theme.colors.palette.slice();

                if (all_series.length < palette.length * 2) {
                    // we only color lines if there's a reasonable number of them
                    if (!directLabeling || all_series.length > 4) {
                        for (var i=0; i < baseCol; i++) palette.push(palette.pop());
                        if (all_series.length > palette.length) {
                            // add variations of palette colors
                            $.each(palette, function(i, col) {
                                palette.push(d3.cie.lch(d3.rgb(col)).darker(-2).toString());
                            });
                        }
                        me.setSeriesColor(col, palette[(index + baseCol) % palette.length]);
                    } else {
                        // use different shades of the same color
                        var base = palette[baseCol % palette.length],
                            bLch = d3.cie.lch(d3.rgb(base)),
                            ml = Math.max(bLch.l, 50),
                            l = d3.range(81, ml, -(80 - ml) / (all_series.length - 1));
                        me.setSeriesColor(col, ''+d3.cie.lch(l[index], bLch.c, bLch.h));
                    }
                }

                var strokeColor = me.getSeriesColor(col);

                all_paths.push(paths);

                _.each(paths, function(path) {
                    me.registerSeriesElement(c.paper.path(path).attr({
                        'stroke-width': sw,
                        'stroke-linecap': 'round',
                        'stroke-linejoin': 'round',
                        'stroke-opacity': 1,
                        'stroke': strokeColor
                    }), col);

                    // add invisible line on top to make selection easier
                    me.registerSeriesElement(c.paper.path(path).attr({
                        'stroke-width': sw*4,
                        'opacity': 0
                    }), col);
                });

                if (me.get('connect-missing-values', false)) {
                    me.registerSeriesElement(c.paper.path(connectMissingValuePath).attr({
                        'stroke-width': sw*0.35,
                        'stroke-dasharray': '- ',
                        stroke: strokeColor
                    }), col);
                }

                if (me.lineLabelsVisible()) {
                    var div, lbl, lblx = x + 10, lbly = y, valign = 'middle';
                    if (!directLabeling) {
                        // legend
                        if (legend.pos == 'right') {
                            lblx += 15;
                            valign = 'top';
                            lbly = legend_y_offset;
                            div = $('<div></div>');
                            div.css({
                                background: strokeColor,
                                width: 10,
                                height: 10,
                                position: 'absolute',
                                left: x+10,
                                top: lbly+3
                            });
                            el.append(div);
                        } else if (legend.pos == 'top' || legend.pos == 'inside') {
                            lblx = legend.xoffset + 15;
                            lbly = legend.yoffset;
                            div = $('<div></div>');
                            div.css({
                                background: strokeColor,
                                width: 10,
                                height: 10,
                                position: 'absolute',
                                left: legend.xoffset,
                                top: lbly-5
                            });
                            el.append(div);
                            legend.xoffset += me.labelWidth(col.name, 'series')+30;
                        }
                    }
                    lbl = me.label(lblx, lbly, col.name, {
                        cl: me.chart.isHighlighted(col) ? 'highlighted series' : 'series',
                        w: c.labelWidth,
                        valign: valign
                    });
                    if (!directLabeling) {
                        legend_y_offset += lbl.height()+15;
                    }
                    lbl.data('highlighted', me.chart.isHighlighted(col));
                    me.registerSeriesLabel(lbl, col);
                } // */
            });

            if (me.theme.lineChart.hoverDotRadius) {
                this.hoverDot = c.paper.circle(0, 0, me.theme.lineChart.hoverDotRadius).hide();
            }

            if (true || me.theme.tooltips) {
                el.mousemove(_.bind(me.onMouseMove, me));
            }

            window.ds = me.dataset;
            window.vis = me;

            function addFill(series, path) {
                c.paper.path(path)
                    .attr({
                        fill: me.getSeriesColor(series),
                        'fill-opacity': me.theme.lineChart.fillOpacity,
                        stroke: false
                    });
            }
            // fill space between lines
            if (me.get('fill-between', false)) {
                // compute intersections
                if (all_paths.length == 2) {
                    if (all_paths[0].length == 1 && all_paths[1].length == 1) {
                        var path1 = Raphael.parsePathString(all_paths[0][0]),
                            path2 = Raphael.parsePathString(all_paths[1][0]),
                            pts = Raphael.pathIntersection(path1, path2),
                            h1 = [], h2 = [],  // points for fill polygons
                            f1 = [], f2 = [],  // paths for fill polygons
                            s1 = 0, s2 = 0,
                            next;

                        if (me.get('smooth-lines', false) === false) {
                            // straight line fills
                            $.each(pts, function(i, pt) {
                                while (s1 < pt.segment1) {
                                    h1.push(path1[s1][1], path1[s1][2]);
                                    s1++;
                                }
                                h1.push([pt.x, pt.y]);
                                while (s2 < pt.segment2) {
                                    h2.unshift(path2[s2][1], path2[s2][2]);
                                    s2++;
                                }
                                (h1[1] < h2[h2.length-1] ? f1 : f2).push([].concat(h1, h2));
                                h1 = [pt.x, pt.y];
                                h2 = [];
                            });
                            while (s1 < path1.length) {
                                h1.push(path1[s1][1], path1[s1][2]);
                                s1++;
                            }
                            while (s2 < path2.length) {
                                h2.unshift(path2[s2][1], path2[s2][2]);
                                s2++;
                            }
                            (h1[1] < h2[h2.length-1] ? f1 : f2).push([].concat(h1, h2));

                            $.each([f1, f2], function(i, fills) {
                                var path = [];
                                _.each(fills, function(pts) {
                                    path.push("M" + [pts.shift(), pts.shift()] + "L" + pts);
                                });
                                addFill(all_series[i], path);
                            });

                        } else {
                            // smooth line fills
                            var pts1 = [].concat(path1[0].slice(1), path1[1].slice(1)),
                                pts2 = [].concat(path2[0].slice(1), path2[1].slice(1));

                            $.each(pts, function(i, pt) {
                                while (s1 < pt.segment1) {
                                    h1.push(pts1[s1*2], pts1[s1*2+1]);
                                    s1++;
                                }
                                h1.push(pt.x, pt.y);
                                while (s2 < pt.segment2) {
                                    h2.unshift(pts2[s2*2], pts2[s2*2+1]);
                                    s2++;
                                }
                                var f = h1[1] < h2[h2.length-(i === 0 ? 1 : 3)] ? f1 : f2;
                                f.push('M' + [h1.shift(), h1.shift()] + (h1.length > 2 ? 'R' + h1 + /*'L' + [h2.shift(), h2.shift()] +*/ 'R' + h2 : 'L' + h1 +'L'+ h2));

                                h1 = [pt.x, pt.y];
                                h2 = [pt.x, pt.y];
                            });
                            while (s1*2 < pts1.length) {
                                h1.push(pts1[s1*2], pts1[s1*2+1]);
                                s1++;
                            }
                            while (s2*2 < pts2.length) {
                                h2.unshift(pts2[s2*2], pts2[s2*2+1]);
                                s2++;
                            }
                            var f = h1[1] < h2[h2.length-3] ? f1 : f2;
                            f.push('M' + [h1.shift(), h1.shift()] + (h1.length > 2 ? 'R' + h1 + 'L' + [h2.shift(), h2.shift()] + 'R' + h2 : 'L' + h1 +'L'+ h2));

                            $.each([f1, f2], function(i, fills) {
                                _.each(fills, function(path) {
                                    addFill(all_series[i], path);
                                });
                            });
                        }

                    } else me.warn('<b>Warning:</b> Area filling is not supported for lines with missing values.');
                } else me.warn('<b>Warning:</b> Filling is only supported for exactly two lines.');
            }

            me.orderSeriesElements();

            $('.chart').mouseenter(function() {
                $('.label.x-axis').css({ opacity: 0.6 });
                if (me.__xlab) me.__xlab.css('opacity', 1).show();
                if (me.__xline) me.__xline.show();
                $('.label.tooltip').show();
            }).mouseleave(function() {
                $('.label.x-axis').css({ opacity: 1});
                if (me.__xlab) me.__xlab.hide();
                if (me.__xline) me.__xline.hide();
                $('.label.tooltip').hide();
            });

            if (me.theme.frame) {
                frame().attr({ fill: false });
            }
        },

        lineLabelsVisible: function() {
            var me = this;
            return me.chart.dataSeries().length > 1 && me.chart.dataSeries().length < 10 && me.__canvas.w >= me.theme.minWidth;
        },

        getDataRowByPoint: function(x, y) {
            var me = this;
            // var d = me.__d = me.__d || $('<div />').css({ position: 'absolute', width: 20, height: 20, 'border-radius': 20, border: '3px solid rgba(200,0,0,.5)' }).appendTo('body');
            // d.css({ left: x - 10, top: y - 10});
            x -= me.__root.offset().left;//me.__root.parent().offset().left;
            y -= me.__root.offset().top;//me.__root.parent().offset().left;
            // var c = me.__c = me.__c || me.__canvas.paper.circle(0,0,10);
            // c.attr({ cx: x || 0, cy: y || 0 });
            return Math.min(me.dataset.numRows()-1, Math.max(0, Math.round(me.__scales.x.invert(x))));
        },

        getSeriesLineWidth: function(series) {
            return this.theme.lineChart.strokeWidth['highlight'] * ($('body').hasClass('fullscreen') ? 1.5 : 1);
        },

        computeAspectRatio: function() {
            var me = this, slopes = [], M, Rx, Ry;
            _.each(me.chart.dataSeries(), function(col) {
                var lval;
                _.each(col.data, function(val, i) {
                    if (i > 0 && val != lval) {
                        slopes.push(Math.abs(val-lval));
                    }
                    lval = val;
                });
            });
            M = d3.median(slopes);
            Rx = slopes.length;
            Ry = me.__domain[1] - me.__domain[0];
            return M*Rx/Ry;
        },

        xScale: function() {
            return d3.scale.linear().domain([0, this.dataset.numRows()-1]);
        },

        yScale: function() {
            var me = this, scale,
            // find min/max value of each data series
            domain = [Number.MAX_VALUE, Number.MAX_VALUE * -1];
            _.each(me.chart.dataSeries(), function(col) {
                domain[0] = Math.min(domain[0], col._min());
                domain[1] = Math.max(domain[1], col._max());
            });
            me.__domain = domain;
            if (me.get('baseline-zero')) {
                domain[0] = 0;
            }
            scale = me.get('scale') || 'linear';
            if (scale == 'log' && domain[0] === 0) domain[0] = 0.03;
            return d3.scale[scale]().domain(domain);
        },

        yAxisWidth: function(h) {
            var me = this,
                ticks = me.getYTicks(h),
                maxw = 0;

            if (me.__canvas.w <= me.theme.minWidth) return 4;

            _.each(ticks, function(val, t) {
                val = me.chart.formatValue(val, false);
                maxw = Math.max(maxw, me.labelWidth(val));
            });
            return maxw+20;
        },

        yAxis: function() {
            // draw tick marks and labels
            var me = this,
                yscale = me.__scales.y,
                c = me.__canvas,
                domain = me.__domain,
                styles = me.__styles,
                ticks = me.getYTicks(c.h, me.theme.frame);

            if ($('body').hasClass('fullscreen')) {
                me.theme.horizontalGrid['stroke-width'] = 2;
            }

            _.each(ticks, function(val, t) {
                var y = yscale(val), x = c.lpad;
                if (val >= domain[0] && val <= domain[1] || me.theme.frame) {
                    // c.paper.text(x, y, val).attr(styles.labels).attr({ 'text-anchor': 'end' });
                    me.label(x+2, y-10, me.chart.formatValue(val, t == ticks.length-1), { align: 'left', cl: 'axis' });
                    if (me.theme.yTicks) {
                        me.path([['M', c.lpad-25, y], ['L', c.lpad-20,y]], 'tick');
                    }
                    if (me.theme.horizontalGrid) {
                        me.path([['M', c.lpad, y], ['L', c.w - c.rpad,y]], 'grid')
                            .attr(me.theme.horizontalGrid);
                    }
                }
            });

            // draw axis line
            if (domain[0] <= 0 && domain[1] >= 0) {
                y = yscale(0);
                me.path([['M', c.lpad, y], ['L', c.w - c.rpad,y]], 'axis')
                            .attr(me.theme.yAxis);
            }
        },

        xAxis: function() {
            // draw x scale labels
            if (!this.chart.hasRowHeader()) return;

            var me = this, ds = me.dataset, c = me.__canvas,
                xscl = me.__scales.x,
                rotate45 = me.get('rotate-x-labels'),
                labels = me.chart.rowLabels(),
                k = labels.length-1;

            var last_label_x = -100, min_label_distance = rotate45 ? 30 : 0;
            _.each(me.chart.rowLabels(), function(val, i) {
                min_label_distance = Math.max(min_label_distance, me.labelWidth(val));
            });

            function addlbl(x, val, i, low) {
                var y = c.h-c.bpad+me.theme.xLabelOffset, lbl;
                if (!val) return;
                if (rotate45) x -= 5;
                lbl = me.label(x, y, val, { align: 'center', cl: 'axis x-axis' + (rotate45 ? ' rotate45' : '') });
                //if (low) lbl.css({ 'font-weight': 'normal'});
            }

            addlbl(xscl(0), labels[0], 0);

            var cl = 'axis x-axis',

                lw, x,
                l0 = xscl(0) + me.labelWidth(labels[0], cl) * 0.6,
                l1 = xscl(k) - me.labelWidth(labels[k], cl) * 0.6;

            for (var i=1; i<k; i++) {
                lw = me.labelWidth(labels[i], cl);
                x = xscl(i);
                if (x - lw * 0.6 > l0 && x + lw * 0.6 < l1) {
                    addlbl(xscl(i), labels[i], i);
                    l0 = x + lw * 0.6;
                }
            }

            addlbl(xscl(k), labels[k], k);

            if (me.theme.verticalGrid) {
                // draw vertical grid
                _.each(xscl.ticks(20), function(tick) {
                    var x = xscl(tick), t=c.tpad, b=c.h-c.bpad;
                    c.paper.path('M'+x+','+t+' '+x+','+b).attr(me.theme.verticalGrid);
                });
            }

        },

        hoverSeries: function(series) {
            var me = this,
                seriesElements = me.__seriesElements;
            _.each(seriesElements, function(elements, key) {
                var h = !series || key == series.name;
                _.each(elements, function(el) {
                    if (el.attrs['stroke-opacity'] > 0) {
                        el.attr({
                            opacity: h ? 1 : 0.5,
                            'stroke-width': h ? me.getSeriesLineWidth(series) : 1
                        });
                    }
                });
            });

            var seriesLabels = me.__seriesLabels;
            _.each(seriesLabels, function(labels, key) {
                var h = !series || key == series.name;
                _.each(labels, function(lbl) {
                    lbl.css({ opacity: h ? 1 : 0.5 });
                    if (h) lbl.addClass('highlighted');
                });
            });
        },

        onMouseMove: function(e) {
            var me = this,
                c = me.__canvas,
                x = e.pageX,
                y = e.pageY,
                series = this.getSeriesByPoint(x, y),
                row = this.getDataRowByPoint(x, y),
                hoveredNode = series !== null,
                xlabel = me.__xlab = me.__xlab ||
                    me.label(x, c.h - c.bpad+me.theme.xLabelOffset - 5, 'foo', {
                        cl: 'axis x-axis',
                        css: {
                            background: me.theme.colors.background,
                            padding: '5px 10px',
                            zIndex: 100
                        }
                    });
               /* xline = me.__xline = me.__xline ||
                    c.paper.path('M0,'+c.tpad+' 0,'+(c.h - c.bpad)).attr(me.theme.horizontalGrid).toBack();*/

            // update x-label
            $('span', xlabel).html(me.dataset.rowName(row))
                .parent().css({ left: me.__scales.x(row) - xlabel.outerWidth() * 0.5 });

            // update x-line
            //xline.transform('t'+me.__scales.x(row)+',0');

            me.dataset.eachSeries(function(s) {
                var lbl = s._label = s._label ||
                    me.label(0, 0, 'foo', {
                        cl: 'tooltip',
                        css: {
                            background: me.getSeriesColor(s),
                            padding: '2px 3px',
                            zIndex: 100
                        }
                    }).addClass(me.invertLabel(me.getSeriesColor(s)) ? 'inverted' : '');
                $('span', lbl).html(me.chart.formatValue(s.data[row])).css('background', 'transparent').parent()
                    .css({
                        left: me.__scales.x(row) - lbl.outerWidth() * 0.5,
                        top: me.__scales.y(s.data[row]) - lbl.outerHeight() * 0.5
                    });
            });

            return;
        },

        showTooltip: function(series, row, x, y) {
            var me = this,
                xval = me.chart.rowLabel(row),
                yval = series.data[row],
                xtto = me.__root.offset().left - me.__root.parent().offset().left,
                tt = $('.tooltip'),
                yr = me.__scales.y(yval);

            x = me.__scales.x(row);
            y = yr + me.__root.offset().top;

            if (tt) {
                $('.xval', tt).html(xval);
                $('.yval', tt).html(me.chart.formatValue(yval, true));
                if (me.chart.hasRowHeader()) {
                    $('.xlabel', tt).html(me.chart.rowHeader().name);
                }
                $('.ylabel', tt).html(series.name);

                tt.css({
                    position: 'absolute',
                    top: (y - tt.outerHeight()-10)+'px',
                    left: (x - tt.outerWidth()*0.5 + xtto)+'px'
                });
                tt.show();
            }

            if (me.theme.lineChart.hoverDotRadius) {
                me.hoverDot.attr({
                    cx: x,
                    cy: yr,
                    r: me.theme.lineChart.hoverDotRadius,
                    stroke: me.getSeriesColor(series),
                    'stroke-width': 1.5,
                    fill: '#fff'
                }).data('series', series).show();
            }
        },

        hideTooltip: function() {
            $('.tooltip').hide();
            if (this.theme.lineHoverDotRadius) {
                this.hoverDot.hide();
            }
        }


    });

}).call(this);