(function(){

    // Simple line chart
    // -----------------

    var LineChart = Datawrapper.Visualizations.LineChart = function() {};

    _.extend(LineChart.prototype, Datawrapper.Visualizations.RaphaelChart.prototype, {

        render: function(el) {

            var axesDef = {
                    x: 0,   // x-axis
                    y1: [], // primary y-axis
                    y2: []  // secondary y-axis
                };

            var vis = this,
                dataset = vis.dataset,
                theme = vis.theme,
                chart = vis.chart,
                y1Domain;

            // returns true if the x axis is of type date
            function useDateFormat() {
                return dataset.column(axesDef.x).type() == 'date';
            }

            // returns date obj assigned to row r
            function rowDate(r) {
                return dataset.column(axesDef.x).val(r);
            }

            // returns the d3.scale for x axis
            function xScale() {
                if (useDateFormat()) {
                    return d3.time.scale().domain([rowDate(0), rowDate(-1)]);
                } else {
                    return d3.scale.linear().domain([0, dataset.numRows()-1]);
                }
            }

            // returns d3.scale for y axis, usually d3.linear
            function yScale() {
                var scale,
                // find min/max value of each data series
                    domain = [Number.MAX_VALUE, Number.MAX_VALUE * -1];
                _.each(axesDef.y1, function(c) {
                    domain[0] = Math.min(domain[0], dataset.column(c).range()[0]);
                    domain[1] = Math.max(domain[1], dataset.column(c).range()[1]);
                });
                y1Domain = domain;  // store for later, replaces me.__domain
                if (vis.get('baseline-zero')) {
                    domain[0] = 0;
                }
                scale = vis.get('scale') || 'linear';
                if (scale == 'log' && domain[0] === 0) domain[0] = 0.03;  // log scales don't like zero!
                return d3.scale[scale]().domain(domain);
            }

            // decides whether or not line labels are visible
            function lineLabelsVisible() {
                return axesDef.y1.length > 1 &&
                    (axesDef.y1.length < 10 || chart.hasHighlight()) &&
                    c.w >= theme.minWidth;
            }

            // compute width of primary y axis by measuring label widths
            function yAxisWidth(h) {
                var ticks = vis.getYTicks(scales.y, h, extendRange),
                    maxw = 0;

                if (c.w <= theme.minWidth) return 4;

                _.each(ticks, function(val, t) {
                    val = chart.formatValue(val, false);
                    maxw = Math.max(maxw, vis.labelWidth(val));
                });
                return maxw+20;
            }

            // draws the primary y axis
            function drawYAxis() {
                // draw tick marks and labels
                var domain = y1Domain,
                    styles = vis.__styles,
                    ticks = vis.getYTicks(scales.y, c.h, extendRange);

                if (!extendRange && ticks[ticks.length-1] != domain[1]) ticks.push(domain[1]);

                if ($('body').hasClass('fullscreen')) {
                    theme.horizontalGrid['stroke-width'] = 2;
                }

                _.each(ticks, function(val, t) {
                    var y = scales.y(val), x = c.lpad;
                    if (val >= domain[0] && val <= domain[1] || extendRange) {
                        // c.paper.text(x, y, val).attr(styles.labels).attr({ 'text-anchor': 'end' });

                        // axis label
                        vis.label(x+2, y-10, chart.formatValue(val, t == ticks.length-1), { align: 'left', cl: 'axis' });
                        // axis ticks
                        if (theme.yTicks) {
                            vis.path([['M', c.lpad-25, y], ['L', c.lpad-20,y]], 'tick');
                        }
                        // grid line
                        if (theme.horizontalGrid) {
                            vis.path([['M', c.lpad, y], ['L', c.w - c.rpad,y]], 'grid')
                                .attr(theme.horizontalGrid);
                        }
                    }
                });

                // draw axis line
                if (domain[0] <= 0 && domain[1] >= 0) {
                    y = scales.y(0);
                    vis.path([['M', c.lpad, y], ['L', c.w - c.rpad,y]], 'axis')
                                .attr(theme.xAxis);
                }
            }

            // draws the x-axis
            function drawXAxis() {
                // draw x scale labels
                if (!chart.hasRowHeader()) return;

                var rotate45 = vis.get('rotate-x-labels'),
                    labels = chart.rowLabels(),
                    k = labels.length-1;

                if (useDateFormat()) return drawDateAxis(); // draw date axis instead

                var last_label_x = -100,
                    min_label_distance = rotate45 ? 30 : 0;

                dataset.column(axesDef.x).each(function(val, i) {
                    min_label_distance = Math.max(min_label_distance, vis.labelWidth(val));
                });

                function addlbl(x, val, i, low) {
                    var y = c.h - c.bpad + theme.lineChart.xLabelOffset, lbl;
                    if (!val) return;
                    if (rotate45) x -= 5;
                    lbl = vis.label(x, y, val, {
                        align: 'center',
                        cl: 'axis x-axis' + (rotate45 ? ' rotate45' : '')
                    });
                }

                addlbl(scales.x(0), labels[0], 0);

                var cl = 'axis x-axis',
                    lw, x,
                    l0 = scales.x(0) + vis.labelWidth(labels[0], cl) * 0.6,
                    l1 = scales.x(k) - vis.labelWidth(labels[k], cl) * 0.6;

                for (var i=1; i<k; i++) {
                    lw = vis.labelWidth(labels[i], cl);
                    x = scales.x(i);
                    if (x - lw * 0.6 > l0 && x + lw * 0.6 < l1) {
                        addlbl(scales.x(i), labels[i], i);
                        l0 = x + lw * 0.6;
                    }
                }
                addlbl(scales.x(k), labels[k], k);
                if (vis.get('show-grid', false) && theme.verticalGrid) {
                    // draw vertical grid
                    _.each(scales.x.ticks(20), function(tick) {
                        var x = scales.x(tick), t=c.tpad, b=c.h-c.bpad;
                        var p = c.paper.path('M'+x+','+t+' '+x+','+b).attr(theme.verticalGrid);
                    });
                }
            }  // end drawXAxis


            function drawDateAxis() {
                var tickCount = Math.round(c.w / 75),
                    ticks = scales.x.ticks(tickCount),
                    fmt = dataset.column(axesDef.x).type(true).format(), // get parsed date format
                    daysDelta = Math.round((rowDate(-1).getTime() - rowDate(0).getTime()) / 86400000),
                    tickFormat = vis.getDateTickFormat(daysDelta),
                    last_month = -1, new_month,
                    last_year = -1, new_year,
                    new_decade, new_quarter;

                _.each(ticks, function(date, i) {
                    new_month = date.getMonth() != last_month;
                    new_quarter = new_month && (date.getMonth() % 3 === 0);
                    new_year = date.getFullYear() != last_year;
                    new_decade = new_year && date.getFullYear() % 10 === 0;
                    var x = scales.x(date),
                        y = c.h - c.bpad + theme.lineChart.xLabelOffset,
                        lbl = tickFormat(date);
                    if (fmt == 'YYYY' && i > 0 && i < ticks.length-1) {
                        lbl = '’'+String(date.getFullYear()).substr(2);
                    }
                    vis.label(x, y, lbl, { align: 'center', cl: 'axis x-axis'});
                    if (
                        ((daysDelta <= 90 && new_month) ||
                        (daysDelta > 90 && daysDelta <= 500 && new_quarter) ||
                        (daysDelta > 500 && daysDelta < 3650 && new_year) ||  // less between two and ten years
                        (daysDelta >= 3650 && new_decade))  // less between two and ten years
                    ) {
                        if (theme.horizontalGrid) {
                            vis.path('M'+[x, c.h - c.bpad] + 'V' + c.tpad, 'grid')
                                .attr(theme.horizontalGrid);
                        }
                    }
                    last_month = date.getMonth();
                    last_year = date.getFullYear();
                });
            } // end drawDateAxis

            // computes width of a given column, respecting highlights
            function lineWidth(column) {
                var fs_scale = $('body').hasClass('fullscreen') ? 1.5 : 1,
                    scale = chart.hasHighlight() ? chart.isHighlighted(column) ? 1 : 0.65 : 1;
                return theme.lineChart.strokeWidth * fs_scale * scale;
            }

            function lineColor(column) {
                var bgcol = chroma.hex(theme.colors.background),
                    bglum = bgcol.luminance(),
                    col = chroma.hex(vis.getSeriesColor(column)),
                    min_contrast = chart.hasHighlight() ? (chart.isHighlighted(column) ? 4.5 : 1.45) : 1.7,
                    i = 0;

                // make sure there's enough contrast with background
                while (chroma.contrast(bgcol, col) < min_contrast && i++ < 20) {
                    if (bglum > 0.5) col = col.darken(5);
                    else col = col.brighten(5);
                }
                return col.hex();
            }

            function onMouseMove(e) {
                var x = e.pageX,
                    y = e.pageY,
                    moColumn = vis.getSeriesByPoint(x, y, e),
                    row = dataRowByPoint(x, y, e),
                    hoveredNode = moColumn !== null,
                    xLabelTop = c.h - c.bpad + theme.lineChart.xLabelOffset,
                    xlabel = vis.__xlab = vis.__xlab ||
                        vis.label(x, xLabelTop, 'foo', {
                            cl: 'axis x-axis h',
                            align: 'center',
                            css: {
                                background: theme.colors.background,
                                zIndex: 100
                            }
                        });

                // update x-label
                var lx = scales.x(useDateFormat() ? rowDate(row) : row),
                    lw = vis.labelWidth(dataset.rowName(row), 'axis x-axis'),
                    lfmt = vis.longDateFormat(dataset.column(axesDef.x));

                xlabel.text(useDateFormat() ? lfmt(rowDate(row)) : dataset.rowName(row));
                xlabel.attr({
                    x: lx,
                    y: xLabelTop,
                    w: lw
                });

                var spaghetti = dataset.numColumns() > 3;

                var valueLabels = [];

                _.each(dataset.columns(), function(column) {
                    // we add every value label
                    var lbl = column.__label = column.__label ||
                        vis.label(0, 0, '0', {
                            cl: 'tooltip'+(vis.getSeriesColor(column) ? ' inverted' : ''),
                            align: 'center',
                            valign: 'middle',
                            css: {
                                background: lineColor(column)
                            }
                        }),
                    val = chart.formatValue(column.val(row));
                    lbl.data('series', column);
                    lbl.data('row', 0);
                    lbl.text(val);

                    lbl.attr({
                        x: lx,
                        y: scales.y(column.val(row)),
                        w: vis.labelWidth(val)+10
                    });
                    // if the current value is NaN we cannot show it
                    if (isNaN(column.val(row))) {
                        lbl.hide();
                    } else {
                        lbl.show();
                    }
                    valueLabels.push(lbl);

                    if (spaghetti) {  // special treatment for spaghetti charts
                        // only show value label if the line is highlighted or hovered
                        if (!(column == moColumn || chart.hasHighlight() && chart.isHighlighted(column))) lbl.hide();
                        // only show series label if the line is highlighted or hovered
                        var hide_label = chart.hasHighlight() && !chart.isHighlighted(column) && (column != moColumn);
                        if (vis.get('direct-labeling')) {
                            if (hide_label) {
                                $.each(vis.getSeriesLabels(column), function(i, l) { l.hide(); });
                            } else {
                                $.each(vis.getSeriesLabels(column), function(i, l) { l.show(); });
                            }
                        } else {
                            if (hide_label) {
                                $.each(vis.getSeriesLabels(column), function(i, l) { l.el.css('text-decoration', 'none'); });
                            } else {
                                if (!chart.isHighlighted(s)) $.each(vis.getSeriesLabels(column), function(i, l) { l.el.css('text-decoration', 'underline'); });
                            }
                        }
                    }
                });
                vis.optimizeLabelPositions(valueLabels, 3, 'middle');
                return;
            }

            function dataRowByPoint(x, y) {
                x -= vis.__root.offset().left;
                y -= vis.__root.offset().top;

                if (useDateFormat()) {
                    var mouse_date = scales.x.invert(x),
                        min_dist = Number.MAX_VALUE,
                        closest_row = 0;
                    // find closest date
                    dataset.column(axesDef.x).each(function(date, i) {
                        var dist = Math.abs(date.getTime() - mouse_date.getTime());
                        if (dist < min_dist) {
                            min_dist = dist;
                            closest_row = i;
                        }
                    });
                    return closest_row;
                }
                return Math.min(
                    dataset.numRows()-1,
                    Math.max(0, Math.round(scales.x.invert(x)))
                );
            }

            // populate axesDef.y1
            $.each(dataset.columns(), function(i) {
                if (i > 0) axesDef.y1.push(i);
            });

            // init canvas
            el = $(el);
            vis.setRoot(el);

            var
            bpad = theme.padding.bottom,
            baseCol = Math.max(0, vis.get('base-color', 0)),
            scales = vis.__scales = {
                x: xScale(),
                y: yScale()
            },
            legend = {
                pos: vis.get('legend-position', 'right'),
                xoffset: 0,
                yoffset: -10
            },
            h = vis.get('force-banking') ? el.width() / vis.computeAspectRatio() : vis.getSize()[1],
            c;

            if (vis.get('direct-labeling')) legend.pos = 'direct';

            var extendRange = vis.get('extend-range', false) || (theme.frame && vis.get('show-grid', false));

            vis.init();

            c = vis.initCanvas({
                h: h,
                bpad: vis.get('rotate-x-labels') ? bpad + 20 : bpad
            });

            if (c.w <= theme.minWidth) {
                c.tpad = 15;
                c.rpad = 9;
                c.lpad = 5;
                c.bpad = 5;
            }
            if (lineLabelsVisible() && legend.pos != 'direct' && legend.pos != 'right') {
                c.tpad += 20;
                c.rpad = 0;
            }

            if (lineLabelsVisible() && (legend.pos == 'direct' || legend.pos == 'right')) {
                c.labelWidth = 0;
                _.each(chart.dataSeries(), function(col) {
                    c.labelWidth = Math.max(c.labelWidth, vis.labelWidth(col.name(), 'series'));
                });
                if (c.labelWidth > theme.lineChart.maxLabelWidth) {
                    c.labelWidth = theme.lineChart.maxLabelWidth;
                }
                c.rpad += c.labelWidth + 20;
                if (legend.pos == 'right') c.rpad += 15;
            } else {
                c.rpad += 5;
            }

            if (legend.pos != 'direct' && legend.pos != 'right') {
                // some more space for last x-label
                c.rpad += 0.25 * vis.labelWidth(chart.rowLabel(vis.numRows-1));
                legend.xoffset += c.lpad;
            }

            c.lpad2 = yAxisWidth(h);

            function frame() {
                return c.paper.rect(
                    c.lpad + c.lpad2,
                    c.tpad,
                    c.w - c.rpad - c.lpad - c.lpad2,
                    c.h - c.bpad - c.tpad
                ).attr(theme.frame);
            }

            if (theme.frame && vis.get('show-grid', false)) {
                if (theme.frameStrokeOnTop) {
                    // draw frame fill, but without stroke
                    frame().attr({ stroke: false });
                } else {
                    frame();
                }
            }
            if (extendRange) {
                scales.y = scales.y.nice();
            }

            scales.x = scales.x.range([c.lpad + c.lpad2, c.w-c.rpad]);
            scales.y = scales.y.range(vis.get('invert-y-axis', false) ? [c.tpad, c.h-c.bpad] : [c.h-c.bpad, c.tpad]);

            drawYAxis();
            drawXAxis();

            var all_series = _.map(axesDef.y1, function(i) { return dataset.column(i); }),
                seriesLines = this.__seriesLines = {};

            if (legend.pos != 'direct') {
                // sort lines by last data point
                all_series = all_series.sort(function(a, b) {
                    return b.val(-1) - a.val(-1);
                });
                // inverse order if y axis is inverted
                if (vis.get('invert-y-axis', false)) all_series.reverse();
                //
                if (legend.pos.substr(0, 6) == "inside") {
                    legend.xoffset = yAxisWidth(h);
                    legend.yoffset = 40;
                }
            }

            // get number of 'highlighted' series (or all if none)
            var highlightedSeriesCount = 0, seriesColIndex = 0;
            $.each(all_series, function(i, column) {
                if (chart.hasHighlight() && chart.isHighlighted(column)) highlightedSeriesCount++;
            });
            highlightedSeriesCount = highlightedSeriesCount || all_series.length;

            // draw series lines
            var all_paths = [],
                legend_labels = [];  // we keep a reference to legend labels
            legend.cont = $('<div />')
                            .addClass('legend')
                            .appendTo(el)
                            .css({ position: 'absolute', top: 0, left: 0 });

            _.each(all_series, function(col, index) {
                var paths = [],
                    pts_ = [],
                    pts = [],
                    x, y, sw,
                    connectMissingValuePath = [],
                    last_valid_y; // keep the last non-NaN y for direct label position

                col.each(function(val, i) {
                    //console.log(col.name(), val);

                    x = scales.x(useDateFormat() ? rowDate(i) : i);
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
                    paths.push("M" + [pts.shift(), pts.shift()] + (vis.get('smooth-lines') ? "R" : "L") + pts);
                });

                sw = lineWidth(col);
                var palette = theme.colors.palette.slice();

                if (highlightedSeriesCount < 5) {
                    if (chart.isHighlighted(col)) {
                        vis.setSeriesColor(col, palette[(seriesColIndex + baseCol) % palette.length]);
                        seriesColIndex++;
                    }
                }

                var strokeColor = lineColor(col);

                all_paths.push(paths);

                _.each(paths, function(path) {
                    vis.registerSeriesElement(c.paper.path(path).attr({
                        'stroke-width': sw,
                        'stroke-linecap': 'round',
                        'stroke-linejoin': 'round',
                        'stroke-opacity': 1,
                        'stroke': strokeColor
                    }), col);

                    // add invisible line on top to make selection easier
                    vis.registerSeriesElement(c.paper.path(path).attr({
                        'stroke-width': sw*4,
                        'opacity': 0
                    }), col);
                });

                if (vis.get('connect-missing-values', false)) {
                    vis.registerSeriesElement(c.paper.path(connectMissingValuePath).attr({
                        'stroke-width': sw*0.35,
                        'stroke-dasharray': '- ',
                        stroke: strokeColor
                    }), col);
                }

                if (lineLabelsVisible()) {
                    var visible = all_series.length < 10 || chart.isHighlighted(col),
                        div, lbl,
                        lblx = x + 10,
                        lbly = last_valid_y,
                        valign = 'top';

                    if (visible) {
                        // legend
                        if (legend.pos == 'right') {
                            lblx += 15;
                            lbly = legend.yoffset;
                            div = $('<div></div>');
                            div.css({
                                background: strokeColor,
                                width: 10,
                                height: 10,
                                position: 'absolute',
                                left: x+10,
                                top: lbly+3
                            });
                            legend.cont.append(div);
                        } else if (legend.pos == 'top' || legend.pos.substr(0, 6) == 'inside') {
                            lblx = legend.xoffset + 15;
                            lbly = legend.yoffset;
                            div = $('<div></div>');
                            div.css({
                                background: strokeColor,
                                width: 10,
                                height: 10,
                                position: 'absolute',
                                left: legend.xoffset,
                                top: lbly+3
                            });
                            legend.cont.append(div);
                            legend.xoffset += vis.labelWidth(col.name(), 'series')+30;
                        }
                    }
                    lbl = vis.label(lblx, lbly, col.name(), {
                        cl: chart.isHighlighted(col) ? 'highlighted series' : 'series',
                        w: c.labelWidth,
                        valign: valign,
                        root: legend.cont
                    });
                    legend_labels.push(lbl);
                    if (!visible) lbl.hide();
                    if (legend.pos == 'right') {
                        legend.yoffset += lbl.height('auto').height()+5;
                    }
                    lbl.data('highlighted', chart.isHighlighted(col));
                    vis.registerSeriesLabel(lbl, col);
                } // */
            });  // _.each(all_series,

            if (legend.pos == 'direct') {
                vis.optimizeLabelPositions(legend_labels, 3, 'top');
            } else if (legend.pos == 'inside-right') {
                legend.cont.css({ left: c.w - legend.xoffset - c.rpad });
            }
            //me.initValueLabelsPositions();
            if (true || theme.tooltips) {
                el.mousemove(onMouseMove);
            }

            window.ds = vis.dataset;
            window.vis = vis;

            function addFill(series, path) {
                c.paper.path(path)
                    .attr({
                        fill: lineColor(series),
                        'fill-opacity': theme.lineChart.fillOpacity,
                        stroke: false
                    });
            }
            // fill space between lines
            if (vis.get('fill-between', false)) {
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

                        if (vis.get('smooth-lines', false) === false) {
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

                    } else vis.warn('<b>Warning:</b> Area filling is not supported for lines with missing values.');
                } else vis.warn('<b>Warning:</b> Filling is only supported for exactly two lines.');
            }

            vis.orderSeriesElements();

            $('.chart').mouseenter(function() {
                $('.label.x-axis').css({ opacity: 0.4 });
                $('.label.tooltip').show();
            }).mouseleave(function() {
                $('.label.x-axis').css({ opacity: 1});
                if (vis.__xlab) vis.__xlab.remove();
                vis.__xlab = null;
                $('.label.tooltip').hide();
                _.each(vis.__seriesLabels, function(labels) {
                    _.each(labels, function(l) {
                        l.show();
                    });
                });
            });

            if (theme.frameStrokeOnTop) {
                // add frame stroke on top
                if (theme.frame && vis.get('show-grid', false)) {
                    frame().attr({ fill: false });
                }
            }
        },

        computeAspectRatio: function() {
            var vis = this, slopes = [], M, Rx, Ry;
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

        // alias to dataset.eachRow
        eachRow: function(func){
            this.dataset.eachRow(func);
        },

        hoverSeries: function(series) { },

        optimizeLabelPositions: function(labels, pad, valign) {
            var i = 1, c = valign == 'top' ? 0 : valign == 'middle' ? 0.5 : 1;
            labels = _.filter(labels, function(lbl) { return lbl.el.is(":visible"); });
            _.each(labels, function(lbl) {
                lbl.__noverlap = {
                    otop: lbl.top(),
                    top: lbl.top(),
                    dy: 0
                };
                lbl.height('auto');
            });
            (function loop() {
                var overlap = false;
                _.each(labels, function(lbl0, p) {
                    _.each(labels, function(lbl1, q) {
                        if (q > p) {
                            var l0 = lbl0.left(), l1 = lbl1.left(),
                                r0 = l0 + lbl0.width(), r1 = l1 + lbl1.width(),
                                t0 = lbl0.__noverlap.top - pad, t1 = lbl1.__noverlap.top - pad,
                                b0 = t0 + lbl0.height() + pad * 2, b1 = t1 + lbl1.height() + pad * 2,
                                dy, l0up;
                            if (!(l1 > r0 || r1 < l0 || t1 > b0 || b1 < t0)) {
                                overlap = true;
                                dy = Math.min(b0, b1) - Math.max(t0, t1);
                                l0up = t0 + (b0 - t0) * c < t1 + (b1 - t1) * c;
                                lbl0.__noverlap.dy += dy * 0.5 * (l0up ? -1 : 1);
                                lbl1.__noverlap.dy += dy * 0.5 * (l0up ? 1 : -1);
                            }
                        }
                    });
                });
                if (overlap) {
                    _.each(labels, function(lbl) {
                        lbl.__noverlap.top += lbl.__noverlap.dy * (1/i);
                        lbl.__noverlap.dy = 0;
                    });
                }
                if (overlap && ++i < 4) loop();
            })();  // end loop()
            _.each(labels, function(lbl) {
                lbl.el.css({ top: lbl.__noverlap.top - lbl.el.parent().offset().top });  // apply new label pos
            });
        }
    });

}).call(this);