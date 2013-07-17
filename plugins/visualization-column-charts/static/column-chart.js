
(function(){
    // Simple vertical bar chart
    // -------------------------

    var ColumnChart = Datawrapper.Visualizations.ColumnChart = function() {

    };

    _.extend(ColumnChart.prototype, Datawrapper.Visualizations.RaphaelChart.prototype, {

        render: function(el) {
            var me = this, filter, filterUI, sortBars, reverse, c, dataset = me.dataset,
                chart_width, column_gap, row_gap, row, column, bars;

            me.axesDef = me.axes();
            if (!me.axesDef) return;

            el = $(el);

            this.setRoot(el);

            row = 0;
            if (!_.isUndefined(me.get('selected-row'))) {
                row = me.get('selected-row', 0);
                if (row > me.chart.numRows()) row = 0;
            }

            me.__lastRow = row;

            var barColumns = _.map(me.axesDef.columns, function(i) { return dataset.column(i); });
                filter = dw.utils.filter(dw.utils.columnNameColumn(barColumns), row),
                filterUI = filter.ui(me);

            if (filterUI) {
                $('#header').append(filterUI);
                filter.change(function(val, i) {
                    me.__lastRow = i;
                    me.update(i);
                });
            }

            sortBars = me.get('sort-values');
            reverse = me.get('reverse-order');

            c = me.initCanvas({}, 0, filterUI ? filterUI.height() + 10 : 0);

            chart_width = c.w - c.lpad - c.rpad;
            column_gap = 0.05; // pull from theme
            row_gap = 0.01;

            if (filterUI) c.tpad += 10;

            me.init();

            column = me.getBarColumn();
            bars = me.getBarValues();

            // compute maximum x-label height
            var lh = 0,
                mm = column.range(),
                mm_r = mm[0] >= 0 ? 1 : mm[1] <= 0 ? 0 : mm[1] / (mm[1] - mm[0]),
                n = bars.length;

            _.each(bars, function(bar, s) {
                lh = Math.max(lh,
                    chart_width /(n + (n-1) * 0.35) > 31 ?
                      me.labelHeight(bar.name, 'series', c.w / (n)) :
                      me.labelWidth(bar.name, 'series')
                );
            });
            c.bpad = lh * mm_r + 10;
            c.tpad += lh * (1-mm_r);

            me.initDimensions();

            $('.tooltip').hide();

            if (!me.theme.columnChart.cutGridLines) me.horzGrid();

            _.each(me.getBarValues(sortBars, reverse), function(barv, s) {
                var d = me.barDimensions(barv, s),
                    val = barv.value,
                    fill = me.getBarColor(barv, me.get('negative-color', false)),
                    stroke = chroma.color(fill).darken(14).hex(),
                    bar;

                // create bar
                bar = me.registerElement(c.paper.rect().attr(d).attr({
                    'stroke': stroke,
                    'fill': fill
                }).data('strokeCol', stroke), barv.name);

                if (me.theme.columnChart.barAttrs) {
                    bar.attr(me.theme.columnChart.barAttrs);
                }

                var val_y  = val > 0 ? d.y - 10 : d.y + d.height + 10,
                    lbl_y  = val <= 0 ? d.y - 10 : d.y + d.height + 5,
                    f_val  = me.chart.formatValue(val, true),
                    vlbl_w = me.labelWidth(f_val, 'value'),
                    bw     = (d.width + d.width * d.pad),
                    lblcl  = ['series'],
                    lbl_w  = c.w / (n+2),
                    valign = val > 0 ? 'top' : 'bottom',
                    halign = 'center',
                    alwaysShow = (me.chart.hasHighlight() &&
                        me.chart.isHighlighted(column)) ||
                        (bw > vlbl_w);
                var lpos = me.labelPosition(barv, s, 'value'),
                    spos = me.labelPosition(barv, s, 'series');

                // add value labels
                me.registerLabel(me.label(lpos.left, lpos.top, me.chart.formatValue(barv.value, true),{
                    w: lpos.width,
                    align: 'center',
                    cl: 'value outline ' + (alwaysShow ? '' : ' showOnHover')
                }), barv.name);

                if (me.chart.hasHighlight() && me.chart.isHighlighted(barv.name)) {
                    lblcl.push('highlighted');
                }
                if (d.bw < 30) {
                    halign = 'right';
                }
                if (d.bw < 20) {
                    lblcl.push('smaller');
                }
                // add column label
                if (!/^X\.\d+$/.test(barv.name)) {
                    me.registerLabel(me.label(spos.left, spos.top, barv.name, {
                        w: spos.width,
                        align: spos.halign,
                        valign: spos.valign,
                        cl: lblcl.join(' '),
                        rotate: d.bw < 30 ? -90 : 0
                    }), barv.name);
                }

            });

            var y = c.h - me.__scales.y(0) - c.bpad;
            /*me.path([['M', c.lpad, y], ['L', c.w - c.rpad, y]], 'axis')
                .attr(me.theme.yAxis);*/

            // enable mouse events
            el.mousemove(_.bind(me.onMouseMove, me));

            $('.showOnHover').hide();

            if (me.theme.columnChart.cutGridLines) me.horzGrid();
            if (me.__gridLines && me.__gridLines['0']) me.__gridLines['0'].toFront();
        },

        getBarValues: function(sortBars, reverse) {
            var me = this,
                values = [],
                filter = me.__lastRow,
                labels = me.dataset.column(me.axesDef.labels),
                column = me.getBarColumn(filter),
                fmt = dw.utils.longDateFormat(column);

            column.each(function(val, i) {
                values.push({
                    name: fmt(labels.val(i)),
                    value: val
                });
            });
            if (sortBars) values.sort(function(a,b) { return b.value - a.value; });
            if (reverse) values.reverse();
            return values;
        },

        getBarColumn: function() {
            var me = this,
                filter = me.__lastRow;
            if (_.isUndefined(filter)) throw 'filter must not be undefined';
            return me.dataset.column(me.axesDef.columns[filter]);
        },

        update: function(row) {
            var me = this;

            // update scales
            me.initDimensions();

            // update axis and grid
            me.horzGrid();

            var n = me.getBarValues().length;

            // update bar heights and labels
            _.each(me.getBarValues(), function(column, s) {
                _.each(me.__seriesElements[column.name()], function(rect) {
                    var dim = me.barDimensions(column, s, 0);
                    rect.animate(dim, me.theme.duration, me.theme.easing);
                });

                _.each(me.__seriesLabels[column.name()], function(lbl) {
                    var lpos;
                    if (lbl.hasClass('value')) {
                        // update value
                        lbl.text(me.chart.formatValue(column.val(0), true));
                        lpos = me.labelPosition(column, s, 0, 'value');
                    } else if (lbl.hasClass('series')) {
                        // update column label position
                        lpos = me.labelPosition(column, s, 0, 'series');
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

        getBarColor: function(bar, useNegativeColor, colorful) {
            var me = this;
            return me.getKeyColor(bar ? bar.name : null, bar ? bar.value : null, useNegativeColor);
        },

        initDimensions: function(r) {
            //
            var me = this,
                c = me.__canvas,
                domain = me.getBarColumn().range();

            if (domain[0] > 0) domain[0] = 0;
            if (domain[1] < 0) domain[1] = 0;

            me.__domain = domain;
            me.__scales = {
                y: d3.scale.linear().domain(domain)
            };
            me.__scales.y.rangeRound([0, c.h - c.bpad - c.tpad]);
        },

        barDimensions: function(bar, s) {
            var me = this,
                sc = me.__scales,
                c = me.__canvas,
                n = me.getBarValues().length,
                w, h, x, y, i, cw, bw,
                pad = 0.35,
                vspace = 0.1,
                val = bar.value;

            if (isNaN(val)) val = 0;

            if (c.w / n < 30) vspace = 0.05;

            cw = (c.w - c.lpad - c.rpad) * (1 - vspace - vspace);
            bw = cw / (n + (n-1) * pad);
            h = sc.y(val) - sc.y(0);
            w = Math.round(bw);
            if (h >= 0) {
                y = c.h - c.bpad - sc.y(0) - h;
            } else {
                y = c.h - c.bpad - sc.y(0);
                h *= -1;
            }
            if (h !== 0) h = Math.max(1, h);
            x = Math.round((c.w - c.lpad - c.rpad) * vspace + c.lpad + s * (bw + bw * pad));
            return { width: w, height: h, x: x, y: y, bx: x, bw: bw, pad: pad };
        },

        labelPosition: function(bar, s, type) {
            var me = this,
                d = me.barDimensions(bar, s), lbl_w,
                val = bar.value,
                c = me.__canvas,
                lbl_top = val >= 0 || isNaN(val),
                valign = lbl_top ? 'top' : 'bottom',
                halign = 'center',
                val_y = lbl_top ? d.y - 10 : d.y + d.height + 10,
                lbl_y = !lbl_top ? d.y - 5 : d.y + d.height + 5;

            if (type == "value") {
                lbl_w = me.labelWidth(me.chart.formatValue(val, true), 'value outline hover');
                return { left: d.x + d.width * 0.5, top: val_y, width: lbl_w };
            } else if (type == "series") {
                lbl_w = c.w / (me.getBarValues().length+2);
                if (d.bw < 30) {
                    //lblcl.push('rotate90');
                    lbl_y -= 10;  // move towards zero axis
                    lbl_w = 100;
                    halign = 'right'; // lbl_top ? 'right' : 'left';
                }
                if (d.bw < 20) {
                    lbl_w = 90;
                }
                //console.log(column.name(), { left: d.bx + d.bw * 0.5, top: lbl_y, width: lbl_w, halign: halign, valign: valign });
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
                ticks = me.getYTicks(yscale, c.h, true),
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

        hovers: function(column) {
            var me = this;
            _.each(me.getBarColumns(), function(col) {
                _.each(me.__seriesLabels[col.name()], function(lbl) {
                    if (column !== undefined && col.name() == column.name()) {
                        lbl.addClass('hover');
                        if (lbl.hasClass('showOnHover')) lbl.show(0.5);
                    } else {
                        lbl.removeClass('hover');
                        if (lbl.hasClass('showOnHover')) lbl.hide(0.5);
                    }
                    _.each(me.__seriesElements[col.name()], function(el) {
                        var fill = me.getBarColor(col, el.data('row'), me.get('negative-color', false)), stroke;
                        if (column !== undefined && col.name() == column.name()) fill = chroma.color(fill).darken(14).hex();
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