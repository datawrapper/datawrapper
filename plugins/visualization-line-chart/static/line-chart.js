(function(){

    dw.visualization.register('line-chart', 'raphael-chart', {

        render: function(el) {

            var vis = this,
                dataset = vis.dataset,
                theme = vis.theme(),
                chart = vis.chart(),
                y1Domain,
                invertYAxis = false,
                axesDef = vis.axes(true);

            if (!axesDef.x || !axesDef.y1[0]) return;  // stop rendering here

            var formatter = {
                    x: chart.columnFormatter(axesDef.x),
                    y1: chart.columnFormatter(axesDef.y1[0]) // use format of first column for all!
                },
                useLogScale = vis.get('scale-y1') == 'log';

            // init canvas
            vis.setRoot(el);

            var
            bpad = theme.padding.bottom+5,
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
            h = vis.getSize()[1],
            c;

            if (vis.get('direct-labeling')) legend.pos = 'direct';

            var extendRange = vis.get('extend-range', false) || (theme.frame && vis.get('show-grid', false));

            vis.init();

            initMargins();

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
            scales.y = scales.y.range(invertYAxis ? [c.tpad, c.h-c.bpad] : [c.h-c.bpad, c.tpad]);

            drawYAxis();
            drawXAxis();

            var all_series = axesDef.y1,
                seriesLines = this.__seriesLines = {};

            if (legend.pos != 'direct') {
                // sort lines by last data point
                all_series = all_series.sort(function(a, b) {
                    return b.val(-1) - a.val(-1);
                });
                // inverse order if y axis is inverted
                if (invertYAxis) all_series.reverse();
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

            _.each(all_series, renderLine);  // _.each(all_series,

            if (axesDef.y1.length > 1) {
                if (legend.pos == 'direct') {
                    vis.optimizeLabelPositions(legend_labels, 3, 'top');
                } else if (legend.pos == 'inside-right') {
                    legend.cont.css({ left: c.w - legend.xoffset - c.rpad });
                }
            }

            addAreaFills();

            vis.orderSeriesElements();

            initMouseActions();

            if (theme.frameStrokeOnTop) {
                // add frame stroke on top
                if (theme.frame && vis.get('show-grid', false)) {
                    frame().attr({ fill: false });
                }
            }

            if (vis.get('user-change-scale', false)) addScaleChangeUI();
            if (vis.get('annotate-time-axis')) annotateTime(vis.get('annotate-time-axis'));

            vis.computeAspectRatio = computeAspectRatio;

            vis.renderingComplete();

            if (axesDef.y1.length > 1 && !lineLabelsVisible()) {
                vis.notify(vis.translate('tooManyLinesToLabel'));
            }

            function initMargins() {
                c = vis.initCanvas({
                    h: h,
                    bpad: vis.get('rotate-x-labels') ? bpad + 20 : bpad
                });

                c.tpad += 10;

                if (lineLabelsVisible() && legend.pos != 'direct' && legend.pos != 'right') {
                    // some additional top padding since for the legend
                    c.tpad += 20;
                    c.rpad = 0;
                }
                if (vis.get('user-change-scale', false)) {
                    // even more addition space for the scale mode UI
                    c.bpad += 25;
                }

                if (lineLabelsVisible() && (legend.pos == 'direct' || legend.pos == 'right')) {
                    // we need to add some right padding for the labels
                    c.labelWidth = 0;
                    dataset.eachColumn(function(col) {
                        c.labelWidth = Math.max(c.labelWidth, vis.labelWidth(col.name(), 'series highlighted'));
                    });
                    // we limit the label width to the 1/4 of the entire width
                    if (c.labelWidth > this.__w * 0.25) {
                        c.labelWidth = this.__w * 0.25;
                    }
                    c.rpad += c.labelWidth + 20;
                    if (legend.pos == 'right') c.rpad += 15;
                } else {
                    c.rpad += 5;
                }

                if (legend.pos != 'direct' && legend.pos != 'right') {
                    // a little more space for last x-label if no right legend
                    c.rpad += 0.25 * vis.labelWidth(vis.axes(true).x.val(-1));
                    legend.xoffset += c.lpad;
                }

                c.lpad2 = yAxisWidth(h);
            }

            function frame() {
                return c.paper.rect(
                    c.lpad + c.lpad2,
                    c.tpad,
                    c.w - c.rpad - c.lpad - c.lpad2,
                    c.h - c.bpad - c.tpad
                ).attr(theme.frame);
            }

            function renderLine(col, index) {
                var paths = [],
                    pts_ = [],
                    pts = [],
                    x, y, sw,
                    connectMissingValuePath = [],
                    last_valid_y; // keep the last non-NaN y for direct label position

                col.each(buildPathPoints);
                // store the last line
                if (pts.length > 0) pts_.push(pts);

                _.each(pts_, function(pts) {
                    paths.push("M" + [pts.shift(), pts.shift()] + (vis.get('line-mode') == 'curved' ? "R" : "L") + pts);
                });

                sw = lineWidth(col);
                var palette = theme.colors.palette.slice();

                //if (highlightedSeriesCount < 5) {
                //    if (chart.isHighlighted(col)) {
                if (legend.pos != 'direct' && all_series.length > 1) {
                    //if (highlightedSeriesCount)
                    vis.setKeyColor(col.name(), palette[(seriesColIndex + baseCol) % palette.length]);
                    seriesColIndex++;
                }

                var strokeColor = lineColor(col);
                all_paths.push(paths);

                _.each(paths, renderPath);

                renderMissingValueConnections();

                if (lineLabelsVisible()) renderLabels();

                function buildPathPoints(val, i) {
                    if (!_.isNumber(val)) {
                        // store the current line
                        if (pts.length > 0) {
                            pts_.push(pts);
                            pts = [];
                        }
                        return;
                    }

                    x = scales.x(useDateFormat() ? rowName(i) : i);
                    y = scales.y(val);

                    if (pts.length === 0 && pts_.length > 0) {
                        // first valid point after NaNs
                        var lp = pts_[pts_.length-1], s = lp.length-2;
                        connectMissingValuePath.push('M'+[lp[s], lp[s+1]]+'L'+[ x, y]);
                    }
                    if (vis.get('line-mode') == 'stepped' && last_valid_y !== undefined) {
                        pts.push(x, last_valid_y);
                    }
                    pts.push(x, y); // store current point
                    last_valid_y = y;
                }

                function renderPath(path) {
                    vis.registerElement(c.paper.path(path).attr({
                        'stroke-width': sw,
                        'stroke-linecap': 'round',
                        'stroke-linejoin': 'round',
                        'stroke-opacity': 1,
                        'stroke': strokeColor
                    }), col.name());

                    // add invisible line on top to make selection easier
                    vis.registerElement(c.paper.path(path).attr({
                        'stroke-width': sw*4,
                        'opacity': 0
                    }), col.name());
                }

                function renderMissingValueConnections() {
                    if (vis.get('connect-missing-values', false)) {
                        vis.registerElement(c.paper.path(connectMissingValuePath).attr({
                            'stroke-width': sw*0.35,
                            'stroke-dasharray': '- ',
                            stroke: strokeColor
                        }), col.name());
                    }
                }

                function renderLabels() {
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
                    lbl = vis.label(lblx, lbly, col.title(), {
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
                    vis.registerLabel(lbl, col.name(), col.name(), -1);

                }
            }

            function initMouseActions() {

                //me.initValueLabelsPositions();
                el.mousemove(onMouseMove);

                $('.chart').mouseenter(function() {
                    $('.label.x-axis').css({ opacity: 0.4 });
                    $('.label.tooltip').show();
                }).mouseleave(function() {
                    $('.label.x-axis').css({ opacity: 1});
                    if (vis.__xlab) vis.__xlab.remove();
                    vis.__xlab = null;
                    $('.label.tooltip').hide();
                    _.each(vis.__labels, function(labels) {
                        _.each(labels, function(l) {
                            l.show();
                        });
                    });
                });

            }

            // returns true if the x axis is of type date
            function useDateFormat() {
                return axesDef.x.type() == 'date' &&
                    _.filter(axesDef.x.values(), _.isDate).length == axesDef.x.length;
            }

            // returns date obj assigned to row r
            function rowName(r) { return axesDef.x.val(r); }

            // returns the d3.scale for x axis
            function xScale() {
                if (useDateFormat()) {
                    return d3.time.scale().domain([rowName(0), rowName(-1)]);
                } else {
                    // notify user if not all dates could be parsed
                    if (axesDef.x.type() == 'date') {
                        // notify user if not all dates could be parsed
                        vis.notify(vis.translate('couldNotParseAllDates'));
                    }
                    return d3.scale.linear().domain([0, dataset.numRows()-1]);
                }
            }

            // returns d3.scale for y axis, usually d3.linear
            function yScale() {
                var scale, mustInclude,
                // find min/max value of each data series
                    domain = [Number.MAX_VALUE, Number.MAX_VALUE * -1];
                _.each(axesDef.y1, function(col) {
                    domain[0] = Math.min(domain[0], col.range()[0]);
                    domain[1] = Math.max(domain[1], col.range()[1]);
                });
                if ((mustInclude = vis.get('custom-range-y'))) {
                    mustInclude = mustInclude.filter(function(c) {
                        return c !== '';
                    });
                    if (mustInclude.length == 2 && mustInclude[0] > mustInclude[1]) {
                        invertYAxis = true;
                    }
                } else { mustInclude = []; }
                if (vis.get('fill-below', false)) mustInclude.push(0);
                domain = d3.extent(domain.concat(mustInclude));
                y1Domain = domain;  // store for later, replaces me.__domain
                scale = useLogScale ? 'log' : 'linear';
                if (scale == 'log' && domain[0] === 0) domain[0] = 0.03;  // log scales don't like zero!
                return d3.scale[scale]().domain(domain);
            }

            // decides whether or not line labels are visible
            function lineLabelsVisible() {
                return axesDef.y1.length > 1 && (axesDef.y1.length < 15 || chart.hasHighlight());
            }

            // compute width of primary y axis by measuring label widths
            function yAxisWidth(h) {
                var ticks = vis.getYTicks(scales.y, h, extendRange, useLogScale),
                    maxw = 0;

                _.each(ticks, function(val, t) {
                    val = formatter.y1(val, false);
                    maxw = Math.max(maxw, vis.labelWidth(val));
                });
                return maxw+20;
            }

            // draws the primary y axis
            function drawYAxis() {
                // draw tick marks and labels
                var domain = y1Domain,
                    styles = vis.__styles,
                    ticks = vis.getYTicks(scales.y, c.h, extendRange, useLogScale);

                if (!extendRange && ticks[ticks.length-1] != domain[1]) ticks.push(domain[1]);

                if ($('body').hasClass('fullscreen')) {
                    theme.horizontalGrid['stroke-width'] = 2;
                }

                _.each(ticks, function(val, t) {
                    var y = scales.y(val), x = c.lpad;
                    if (val >= domain[0] && val <= domain[1] || extendRange) {
                        // c.paper.text(x, y, val).attr(styles.labels).attr({ 'text-anchor': 'end' });

                        // axis label
                        vis.label(x+2, y-10, formatter.y1(val, t == ticks.length-1), { align: 'left', cl: 'axis' });
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
                var rotate45 = vis.get('rotate-x-labels'),
                    labels = axesDef.x.raw(),
                    k = labels.length-1;

                if (useDateFormat()) return drawDateAxis(); // draw date axis instead

                var last_label_x = -100,
                    min_label_distance = rotate45 ? 30 : 0;

                axesDef.x.each(function(val, i) {
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
                    fmt = axesDef.x.type(true).format(), // get parsed date format
                    daysDelta = Math.round((rowName(-1).getTime() - rowName(0).getTime()) / 86400000),
                    tickFormat = dw.utils.dateFormat(daysDelta),
                    last_month = -1, new_month,
                    last_year = -1, new_year,
                    last_day = -1, new_day,
                    new_decade, new_quarter,
                    real_data_as_ticks = false;

                if (ticks.length > axesDef.x.length) {
                    ticks = axesDef.x.values();
                    real_data_as_ticks = true;
                }

                _.each(ticks, function(date, i) {
                    new_day = date.getDate() != last_day;
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
                    var l = vis.label(x, y, lbl, { align: 'center', cl: 'axis x-axis'});
                    if (
                        ((daysDelta <= 9 && new_day) || // if the data spans about a week, tick for every day
                        (daysDelta > 9 && daysDelta <= 35 && date.getDay() == Globalize.culture().calendar.firstDay) || // tick for every week
                        (daysDelta > 35 && daysDelta <= 180 && new_month) ||  // if the data spans for more less than 6 month, tick every month
                        (daysDelta > 180 && daysDelta <= 500 && new_quarter) ||  // tick every 3 month
                        (daysDelta > 500 && daysDelta < 3650 && new_year) ||  // less between two and ten years
                        (daysDelta >= 3650 && new_decade)) ||  // less between two and ten years
                        real_data_as_ticks
                    ) {
                        if (theme.horizontalGrid) {
                            vis.path('M'+[x, c.h - c.bpad] + 'V' + c.tpad, 'grid')
                                .attr(theme.horizontalGrid);
                        }
                    } else {
                        l.el.addClass('minor-tick');
                    }
                    last_day = date.getDate();
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
                    col = chroma.hex(vis.getKeyColor(column.name())),
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
                    moKey = vis.getKeyByPoint(x, y, e),
                    moColumn = moKey ? dataset.column(moKey) : null,
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
                var lx = scales.x(useDateFormat() ? rowName(row) : row),
                    lfmt = formatter.x,
                    lw = vis.labelWidth(lfmt(rowName(row)), 'axis x-axis')+10;
                xlabel.text(lfmt(rowName(row)));
                xlabel.attr({
                    x: lx,
                    y: xLabelTop,
                    w: lw
                });

                var spaghetti = dataset.numColumns() > 3;

                var valueLabels = [];

                _.each(axesDef.y1, function(column) {
                    var lbl;

                    // Checks that the column's label doesn't exist yet.
                    // If it exists, it should have a parent
                    // do be attached to dom
                    if(column.__label && column.__label.el.parent().length ) {
                        lbl = column.__label;
                    } else {
                        // Avoid memory leak
                        if(column.__label) delete column.__label;

                        lbl = column.__label = vis.label(0, 0, '0', {
                            cl: 'tooltip'+(vis.getKeyColor(column.name()) ? ' inverted' : ''),
                            align: 'center',
                            valign: 'middle',
                            css: {
                                background: lineColor(column)
                            }
                        });
                    }

                    var val = formatter.y1(column.val(row));
                    lbl.data('key', column.name());
                    lbl.data('row', 0);
                    lbl.text(val);

                    lbl.attr({
                        x: lx,
                        y: scales.y(column.val(row))-21,
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
                                $.each(vis.getLabels(column.name()), function(i, l) { l.hide(); });
                            } else {
                                $.each(vis.getLabels(column.name()), function(i, l) { l.show(); });
                            }
                        } else {
                            if (hide_label) {
                                $.each(vis.getLabels(column.name()), function(i, l) { l.el.css('text-decoration', 'none'); });
                            } else {
                                if (!chart.isHighlighted(column.name())) $.each(vis.getLabels(column.name()), function(i, l) { l.el.css('text-decoration', 'underline'); });
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
                    axesDef.x.each(function(date, i) {
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

            function addAreaFills() {
                // fill space between lines
                if (vis.get('fill-between', false) && all_series.length == 2) {
                    fillBetweenLines();
                }

                if (vis.get('fill-below', false) && all_paths.length == 1 && all_paths[0].length == 1) {
                    if (all_paths[0].length == 1) {
                        // fill area below lines
                        addFill(all_series[0], all_paths[0][0] + 'V'+scales.y(0)+'H'+scales.x(useDateFormat() ? axesDef.x.val(0) : 0));
                    }
                }

                function fillBetweenLines() {
                    if (all_paths.length == 2) {
                        if (all_paths[0].length == 1 && all_paths[1].length == 1) {
                            var path1 = Raphael.parsePathString(all_paths[0][0]),
                                path2 = Raphael.parsePathString(all_paths[1][0]),
                                pts = Raphael.pathIntersection(path1, path2),
                                h1 = [], h2 = [],  // points for fill polygons
                                f1 = [], f2 = [],  // paths for fill polygons
                                s1 = 0, s2 = 0,
                                next;

                            if (vis.get('line-mode') != 'curved') {
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
                                // curved line fills
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

                function addFill(series, path) {
                    c.paper.path(path)
                        .attr({
                            fill: lineColor(series),
                            'fill-opacity': theme.lineChart.fillOpacity,
                            stroke: false
                        });
                }
            }

            function addScaleChangeUI() {
                var div = $('<div />').addClass('filter-ui')
                            .appendTo($('#header')),
                    id = "use-log-"+_.random(10000),
                    chk = $('<input type="checkbox" />')
                            .attr('id', id)
                            .prop('checked', useLogScale)
                            .appendTo(div),
                    lbl = $('<label />')
                            .attr('for', id)
                            .text(vis.translate('useLogarithmicScale'))
                            .appendTo(div);
                chk.change(function() {
                    var s = chk.prop('checked') ? 'log' : 'linear',
                        attrs = vis.chart().attributes();
                    attrs.metadata.visualize['scale-y1'] = s;
                    vis.chart().attributes(attrs);
                    __dw.render();
                });
            }

            function annotateTime(annotations) {
                var rg = /@(\d+)%/;
                // parse annotations
                annotations = annotations.trim().split('\n')
                    .map(function(r) { return r.trim().split(',').map($.trim); });

                _.each(annotations, function(annotation) {
                    var dates = dw.column('', annotation.slice(0,2), 'date').values(),
                        k = annotation.length;
                    if (k > 3) {
                        if (rg.test(annotation[k-1])) {
                            annotation[2] = annotation.slice(2,k-1).join(',');
                            annotation[3] = +annotation[k-1].match(rg)[1];
                        } else {
                            annotation[2] = annotation.slice(2).join(',');
                            annotation[3] = null;
                        }
                    }
                    x_range(dates, annotation[2] || '', annotation[3] || 't');
                });

                function x_range(dates, label, align) {
                    var x1 = scales.x(dates[0]),
                        x2 = scales.x(dates[1]),
                        r = scales.y.range(),
                        y1 = Math.min(r[0], r[1]),
                        y2 = Math.max(r[0], r[1]),
                        l_y = align == 't' ? 0 : +align * 0.01,
                        l_yo = align == 't' ? -3 : 0;
                    // draw rect
                    area(c.paper.rect(x1, y1, x2-x1, y2-y1));
                    if (label) {
                        vis.label((x1 + x2)*0.5, y1 + (y2-y1) * l_y + l_yo, label, {
                            valign: align == 't' ? 'bottom' : 'middle',
                            align: 'center',
                            width: 100,
                            cl: 'annotation'
                        });
                    }
                }

                function area(path) {
                    path.attr({
                        stroke: false,
                        fill: theme.annotation.background,
                        opacity: theme.annotation.opacity
                    }).toBack();
                }
            }

            function computeAspectRatio() {
                var slopes = [], M, Rx, Ry;
                _.each(axesDef.y1, function(col) {
                    var lval;
                    col.each(function(val, i) {
                        if (i > 0 && val != lval) {
                            slopes.push(Math.abs(val-lval));
                        }
                        lval = val;
                    });
                });
                M = d3.median(slopes);
                Rx = slopes.length;
                Ry = y1Domain[1] - y1Domain[0];

                return M*Rx/Ry;
            }
        },

        hover: function(series) { },

        keys: function() {
            var vis = this,
                axes = vis.axes();
            return [].concat(axes.y1, axes.y2 || []);
        }

    });

}).call(this);
