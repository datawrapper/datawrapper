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

            me.__extendRange = me.get('extend-range', false) || (me.theme.frame && me.get('show-grid', false));

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
                legend.xoffset += c.lpad;
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

            if (me.theme.frame && me.get('show-grid', false)) {
                if (me.theme.frameStrokeOnTop) {
                    // draw frame fill, but without stroke
                    frame().attr({ stroke: false });
                } else {
                    frame();
                }
            }
            if (me.__extendRange) {
                scales.y = scales.y.nice();
            }

            scales.x = scales.x.range([c.lpad + c.lpad2, c.w-c.rpad]);
            scales.y = scales.y.range(me.get('invert-y-axis', false) ? [c.tpad, c.h-c.bpad] : [c.h-c.bpad, c.tpad]);

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

            // get number of 'highlighted' series (or all if none)
            var highlightedSeriesCount = 0, seriesColIndex = 0;
            $.each(all_series, function(i, s) {
                if (me.chart.hasHighlight() && me.chart.isHighlighted(s)) highlightedSeriesCount++;
            });
            highlightedSeriesCount = highlightedSeriesCount || all_series.length;

            // draw series lines
            var all_paths = [];
            _.each(all_series, function(col, index) {
                var paths = [],
                    pts_ = [],
                    pts = [],
                    x, y, sw,
                    connectMissingValuePath = [],
                    last_valid_y; // keep the last non-NaN y for direct label position

                _.each(col.data, function(val, i) {
                    x = scales.x(me.useDateFormat() ? ds.rowDate(i) : i);
                    y = scales.y(val);

                    if (isNaN(y)) {
                        // store the current line
                        if (pts.length > 0) {
                            pts_.push(pts);
                            pts = [];
                        }
                        return;
                    }
                    last_valid_y = y;
                    if (pts.length === 0 && pts_.length > 0) {
                        // first valid point after NaNs
                        var lp = pts_[pts_.length-1], s = lp.length-2;
                        connectMissingValuePath.push('M'+[lp[s], lp[s+1]]+'L'+[ x, y]);
                    }
                    pts.push(x, y); // store current point
                });
                // store the last line
                if (pts.length > 0) pts_.push(pts);
                _.each(pts_, function(pts) {
                    paths.push("M" + [pts.shift(), pts.shift()] + (me.get('smooth-lines') ? "R" : "L") + pts);
                });

                sw = me.getSeriesLineWidth(col);
                var palette = me.theme.colors.palette.slice();

                if (highlightedSeriesCount < 5) {
                    if (me.chart.isHighlighted(col)) {
                        me.setSeriesColor(col, palette[(seriesColIndex + baseCol) % palette.length]);
                        seriesColIndex++;
                    }
                }

                var strokeColor = me.getLineColor(col);

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
                    var visible = all_series.length < 10 || me.chart.isHighlighted(col);
                    var div, lbl, lblx = x + 10, lbly = last_valid_y, valign = 'middle';
                    if (!directLabeling && visible) {
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
                    if (!visible) lbl.hide();
                    if (!directLabeling) {
                        legend_y_offset += lbl.height()+15;
                    }
                    lbl.data('highlighted', me.chart.isHighlighted(col));
                    me.registerSeriesLabel(lbl, col);
                } // */
            });

            if (true || me.theme.tooltips) {
                el.mousemove(_.bind(me.onMouseMove, me));
            }

            window.ds = me.dataset;
            window.vis = me;

            function addFill(series, path) {
                c.paper.path(path)
                    .attr({
                        fill: me.getLineColor(series),
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
                $('.label.x-axis').css({ opacity: 0.4 });
                $('.label.tooltip').show();
            }).mouseleave(function() {
                $('.label.x-axis').css({ opacity: 1});
                if (me.__xlab) me.__xlab.remove();
                me.__xlab = null;
                $('.label.tooltip').hide();
            });

            if (me.theme.frameStrokeOnTop) {
                // add frame stroke on top
                if (me.theme.frame && me.get('show-grid', false)) {
                    frame().attr({ fill: false });
                }
            }
        },

        lineLabelsVisible: function() {
            var me = this;
            return me.chart.dataSeries().length > 1 &&
                (me.chart.dataSeries().length < 10 || me.chart.hasHighlight()) &&
                me.__canvas.w >= me.theme.minWidth;
        },

        getLineColor: function(series) {
            var me = this,
                bgcol = chroma.hex(me.theme.colors.background),
                bglum = bgcol.luminance(),
                col = chroma.hex(me.getSeriesColor(series)),
                min_contrast = me.chart.hasHighlight() ? (me.chart.isHighlighted(series) ? 4.5 : 1.45) : 1.7,
                i = 0;

            while (chroma.contrast(bgcol, col) < min_contrast && i++ < 20) {
                if (bglum > 0.5) col = col.darken(5);
                else col = col.brighten(5);
            }

            // make sure there's enough contrast with background
            return col.hex();
        },

        getDataRowByPoint: function(x, y) {
            var me = this;
            // var d = me.__d = me.__d || $('<div />').css({ position: 'absolute', width: 20, height: 20, 'border-radius': 20, border: '3px solid rgba(200,0,0,.5)' }).appendTo('body');
            // d.css({ left: x - 10, top: y - 10});
            x -= me.__root.offset().left;//me.__root.parent().offset().left;
            y -= me.__root.offset().top;//me.__root.parent().offset().left;
            // var c = me.__c = me.__c || me.__canvas.paper.circle(0,0,10);
            // c.attr({ cx: x || 0, cy: y || 0 });
            if (me.useDateFormat()) {
                var mouse_date = me.__scales.x.invert(x),
                    min_dist = Number.MAX_VALUE,
                    closest_row = 0;
                // find closest date
                _.each(me.dataset.rowDates(), function(date, i) {
                    var dist = Math.abs(date.getTime() - mouse_date.getTime());
                    if (dist < min_dist) {
                        min_dist = dist;
                        closest_row = i;
                    }
                });
                return closest_row;
            }
            return Math.min(
                me.dataset.numRows()-1,
                Math.max(0, Math.round(me.__scales.x.invert(x)))
            );
        },

        getSeriesLineWidth: function(series) {
            var me = this,
                fs_scale = $('body').hasClass('fullscreen') ? 1.5 : 1,
                scale = me.chart.hasHighlight() ? me.chart.isHighlighted(series) ? 1 : 0.65 : 1;
            return me.theme.lineChart.strokeWidth * fs_scale * scale;
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
            var me = this, ds = me.dataset;
            if (me.useDateFormat()) {
                return d3.time.scale().domain([ds.rowDate(0), ds.rowDate(ds.numRows()-1)]);
            } else {
                return d3.scale.linear().domain([0, ds.numRows()-1]);
            }
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
                ticks = me.getYTicks(h, me.__extendRange),
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
                ticks = me.getYTicks(c.h, me.__extendRange);

            if (!me.__extendRange && ticks[ticks.length-1] != domain[1]) ticks.push(domain[1]);

            if ($('body').hasClass('fullscreen')) {
                me.theme.horizontalGrid['stroke-width'] = 2;
            }

            _.each(ticks, function(val, t) {
                var y = yscale(val), x = c.lpad;
                if (val >= domain[0] && val <= domain[1] || me.__extendRange) {
                    // c.paper.text(x, y, val).attr(styles.labels).attr({ 'text-anchor': 'end' });

                    // axis label
                    me.label(x+2, y-10, me.chart.formatValue(val, t == ticks.length-1), { align: 'left', cl: 'axis' });
                    // axis ticks
                    if (me.theme.yTicks) {
                        me.path([['M', c.lpad-25, y], ['L', c.lpad-20,y]], 'tick');
                    }
                    // grid line
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
                            .attr(me.theme.xAxis);
            }
        },

        /*
         * draws the x-axis
         */
        xAxis: function() {
            // draw x scale labels
            if (!this.chart.hasRowHeader()) return;

            var me = this, ds = me.dataset, c = me.__canvas,
                xscl = me.__scales.x,
                rotate45 = me.get('rotate-x-labels'),
                labels = me.chart.rowLabels(),
                k = labels.length-1;

            if (me.useDateFormat()) return me.dateAxis();

            var last_label_x = -100, min_label_distance = rotate45 ? 30 : 0;
            _.each(me.chart.rowLabels(), function(val, i) {
                min_label_distance = Math.max(min_label_distance, me.labelWidth(val));
            });

            function addlbl(x, val, i, low) {
                var y = c.h - c.bpad + me.theme.lineChart.xLabelOffset, lbl;
                if (!val) return;
                if (rotate45) x -= 5;
                lbl = me.label(x, y, val, {
                    align: 'center',
                    cl: 'axis x-axis' + (rotate45 ? ' rotate45' : '')
                });
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
            if (me.get('show-grid', false) && me.theme.verticalGrid) {
                // draw vertical grid
                _.each(xscl.ticks(20), function(tick) {
                    var x = xscl(tick), t=c.tpad, b=c.h-c.bpad;
                    var p = c.paper.path('M'+x+','+t+' '+x+','+b).attr(me.theme.verticalGrid);
                });
            }
        },

        dateAxis: function() {
            var me = this,
                ds = me.dataset,
                c = me.__canvas,
                scale = me.__scales.x,
                tickCount = Math.round(c.w / 75),
                ticks = scale.ticks(tickCount),
                fmt = me.dataset.__dateFormat,
                daysDelta = Math.round((ds.rowDate(-1).getTime() - ds.rowDate(0).getTime()) / 86400000),
                tickFormat = me.getDateTickFormat(daysDelta),
                last_month = -1, new_month,
                last_year = -1, new_year,
                new_decade, new_quarter;

            _.each(ticks, function(date, i) {
                new_month = date.getMonth() != last_month;
                new_quarter = new_month && (date.getMonth() % 3 === 0);
                new_year = date.getFullYear() != last_year;
                new_decade = new_year && date.getFullYear() % 10 === 0;
                var x = scale(date),
                    y = c.h - c.bpad + me.theme.lineChart.xLabelOffset,
                    lbl = tickFormat(date);
                if (ds.__dateFormat == 'year' && i > 0 && i < ticks.length-1) {
                    lbl = '’'+String(date.getFullYear()).substr(2);
                }
                me.label(x, y, lbl, { align: 'center', cl: 'axis x-axis'});
                if (
                    ((daysDelta <= 90 && new_month) ||
                    (daysDelta > 90 && daysDelta <= 500 && new_quarter) ||
                    (daysDelta > 500 && daysDelta < 3650 && new_year) ||  // less between two and ten years
                    (daysDelta >= 3650 && new_decade))  // less between two and ten years
                ) {
                    if (me.theme.horizontalGrid) {
                        me.path('M'+[x, c.h - c.bpad] + 'V' + c.tpad, 'grid')
                            .attr(me.theme.horizontalGrid);
                    }
                }
                last_month = date.getMonth();
                last_year = date.getFullYear();
            });
        },

        onMouseMove: function(e) {
            var me = this,
                c = me.__canvas,
                x = e.pageX,
                y = e.pageY,
                series = me.getSeriesByPoint(x, y, e),
                row = me.getDataRowByPoint(x, y, e),
                hoveredNode = series !== null,
                xLabelTop = c.h - c.bpad + me.theme.lineChart.xLabelOffset,
                xlabel = me.__xlab = me.__xlab ||
                    me.label(x, xLabelTop, 'foo', {
                        cl: 'axis x-axis h',
                        align: 'center',
                        css: {
                            background: me.theme.colors.background,
                            zIndex: 100
                        }
                    });

            // update x-label
            var lx = me.__scales.x(me.useDateFormat() ? me.dataset.rowDate(row) : row),
                lw = me.labelWidth(me.dataset.rowName(row), 'axis x-axis'),
                lfmt = me.longDateFormat();

            xlabel.text(me.useDateFormat() ? lfmt(me.dataset.rowDate(row)) : me.dataset.rowName(row));
            xlabel.attr({
                x: lx,
                y: xLabelTop,
                w: lw
            });

            var spaghetti = me.chart.dataSeries().length > 9;

            me.dataset.eachSeries(function(s) {
                var lbl = s._label = s._label ||
                    me.label(0, 0, '0', {
                        cl: 'tooltip'+(me.getSeriesColor(s) ? ' inverted' : ''),
                        align: 'center',
                        valign: 'middle',
                        css: {
                            background: me.getLineColor(s)
                        }
                    }),
                    val = me.chart.formatValue(s.data[row]);
                lbl.data('series', s);
                lbl.data('row', 0);
                lbl.text(val);
                lbl.attr({
                    x: lx,
                    y: me.__scales.y(s.data[row]),
                    w: me.labelWidth(val)+10
                });

                // if the current value is NaN we cannot show it
                if (isNaN(s.data[row])) {
                    lbl.hide();
                } else {
                    lbl.show();
                }

                if (spaghetti) {  // special treatment for spaghetti charts
                    // only show series label if the line is highlighted or hovered
                    var hide_label = me.chart.hasHighlight() && !me.chart.isHighlighted(s) && (s != series);
                    if (me.get('direct-labeling')) {
                        if (hide_label) {
                            $.each(me.__seriesLabels[s.name], function(i, l) { l.hide(); });
                        } else {
                            $.each(me.__seriesLabels[s.name], function(i, l) { l.show(); });
                        }
                    } else {
                        if (hide_label) {
                            $.each(me.__seriesLabels[s.name], function(i, l) { l.el.css('text-decoration', 'none'); });
                        } else {
                            if (!me.chart.isHighlighted(s)) $.each(me.__seriesLabels[s.name], function(i, l) { l.el.css('text-decoration', 'underline'); });
                        }
                    }
                }
            });

            return;
        },

        hoverSeries: function(series) { },

        useDateFormat: function() {
            return this.dataset.isTimeSeries();
        }

    });

}).call(this);