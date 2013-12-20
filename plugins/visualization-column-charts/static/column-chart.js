
(function(){

    dw.visualization.register('column-chart', 'raphael-chart', {

        render: function(el) {
            var me = this, filter, filterUI, sortBars, reverse, c, dataset = me.dataset,
                chart_width, column_gap, row_gap, row, column, bars, theme = me.theme();

            me.axesDef = me.axes();
            if (!me.axesDef) return;

            this.setRoot(el);

            row = 0;
            if (!_.isUndefined(me.get('selected-row'))) {
                row = me.get('selected-row', 0);
                if (row > dataset.numRows()) row = 0;
            }

            me.__lastRow = row;

            var barColumns = _.map(me.axesDef.columns, function(i) { return dataset.column(i); });

            filter = dw.utils.filter(dw.utils.columnNameColumn(barColumns), row);
            filterUI = filter.ui(me);

            var filterH = 0;

            if (filterUI) (function() {
                var $h = $('#header'),
                    oldHeaderHeight = $h.height();
                $h.append(filterUI);
                filterH = $h.height() - oldHeaderHeight;
                filter.change(function(val, i) {
                    me.__lastRow = i;
                    me.update(i);
                });
            })();

            sortBars = me.get('sort-values');
            reverse = me.get('reverse-order');

            c = me.initCanvas({}, 0, filterH);

            chart_width = c.w - c.lpad - c.rpad;
            column_gap = 0.05; // pull from theme
            row_gap = 0.01;

            if (filterUI) c.tpad += 5;

            me.init();

            column = me.getBarColumn();
            if (!column) return; // stop rendering here

            bars = me.getBarValues();

            // compute maximum x-label height
            var lh = 0,
                mm = column.range(),
                mm_r = mm[0] >= 0 ? 1 : mm[1] <= 0 ? 0 : mm[1] / (mm[1] - mm[0]),
                n = me.__n = bars.length;

            _.each(bars, function(bar, s) {
                lh = Math.max(lh,
                    chart_width /(n + (n-1) * 0.35) > 38 ?
                      me.labelHeight(bar.name, 'series', c.w / (n)) :
                      Math.min(80, me.labelWidth(bar.name, 'series'))
                );
            });
            c.bpad = c.bpad - 30 + lh * mm_r + 15;
            c.tpad += lh * (1-mm_r);

            me.initDimensions();

            $('.tooltip').hide();

            if (!theme.columnChart.cutGridLines) me.horzGrid();

            _.each(me.getBarValues(sortBars, reverse), _.bind(me.__barEnter, me));

            var y = c.h - me.__scales.y(0) - c.bpad;
            /*me.path([['M', c.lpad, y], ['L', c.w - c.rpad, y]], 'axis')
                .attr(me.theme.yAxis);*/

            // enable mouse events
            el.mousemove(_.bind(me.onMouseMove, me));

            $('.showOnHover').hide();

            if (theme.columnChart.cutGridLines) me.horzGrid();
            if (me.__gridLines && me.__gridLines['0']) me.__gridLines['0'].toFront();
            me.renderingComplete();
        },

        __barEnter: function(barv, s) {
            var me = this,
                c = me.__canvas,
                d = me.barDimensions(barv, s),
                n = me.__n,
                chart = me.chart(),
                theme = me.theme(),
                val = barv.value,
                fill = me.getBarColor(barv, me.get('negative-color', false)),
                stroke = chroma.color(fill).darken(theme.columnChart.darkenStroke).hex(),
                bar,
                formatter = chart.columnFormatter(me.getBarColumn());

            // create bar
            bar = me.registerElement(c.paper.rect().attr(d).attr({
                'stroke': stroke,
                'fill': fill
            }).data('strokeCol', stroke), barv.name);

            if (theme.columnChart.barAttrs) {
                bar.attr(theme.columnChart.barAttrs);
            }

            var val_y  = val > 0 ? d.y - 10 : d.y + d.height + 10,
                lbl_y  = val <= 0 ? d.y - 10 : d.y + d.height + 5,
                f_val  = formatter(val, true),
                vlbl_w = me.labelWidth(f_val, 'value'),
                bw     = (d.width + d.width * d.pad),
                lblcl  = ['series'],
                lbl_w  = c.w / (n+2),
                valign = val > 0 ? 'top' : 'bottom',
                halign = 'center',
                alwaysShow = (chart.hasHighlight() &&
                    chart.isHighlighted(barv.name)) ||
                    (bw > vlbl_w);
            var lpos = me.labelPosition(barv, s, 'value'),
                spos = me.labelPosition(barv, s, 'series');

            // add value labels
            me.registerLabel(me.label(lpos.left, lpos.top, formatter(barv.value, true),{
                w: lpos.width,
                align: 'center',
                cl: 'value outline ' + (alwaysShow ? '' : ' showOnHover')
            }), barv.name);

            if (chart.hasHighlight() && chart.isHighlighted(barv.name)) {
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
                }), barv.name, me.axes().labels, barv.row);
            }
        },

        __barExit: function(bar_name, s) {
            var me = this;
            _.each(me.__elements[bar_name], function(el) {
                el.remove();
            });
            _.each(me.__labels[bar_name], function(el) {
                el.remove();
            });
            me.__elements[bar_name] = undefined;
            me.__labels[bar_name] = undefined;
        },

        getBarValues: function(sortBars, reverse) {
            var me = this,
                values = [],
                filter = me.__lastRow,
                labels = me.dataset.column(me.axesDef.labels),
                column = me.getBarColumn(filter),
                fmt = labels.type(true).formatter();

            column.each(function(val, i) {
                if (!isNaN(val) || !me.get('ignore-missing-values', false)) {
                    values.push({
                        name: fmt(labels.val(i)),
                        value: val,
                        row: i
                    });
                }
            });
            if (sortBars) values.sort(function(a,b) { return (isNaN(b.value) ? 0 : b.value) - (isNaN(a.value) ? 0 : a.value); });
            if (reverse) values.reverse();
            return values;
        },

        getBarColumn: function() {
            var me = this,
                filter = me.__lastRow;
            if (_.isUndefined(filter)) throw 'filter must not be undefined';
            if (_.isUndefined(me.axesDef.columns[filter])) return null;
            return me.dataset.column(me.axesDef.columns[filter]);
        },

        update: function(row) {
            var me = this,
                theme = me.theme(),
                formatter = me.chart().columnFormatter(me.getBarColumn());

            // update scales
            me.initDimensions();

            // update axis and grid
            me.horzGrid();

            var n = me.__n = me.getBarValues().length,
                updated_bars = {};

            // update bar heights and labels
            _.each(me.getBarValues(me.get('sort-values'), me.get('reverse-order')), function(bar, s) {
                // enter new bar
                if (!me.__elements[bar.name]) me.__barEnter(bar, s);

                _.each(me.__elements[bar.name], function(rect) {
                    var dim = me.barDimensions(bar, s, 0);
                    rect.animate(dim, theme.duration, theme.easing);
                });

                _.each(me.__labels[bar.name], function(lbl) {
                    var lpos;
                    if (lbl.hasClass('value')) {
                        // update value
                        lbl.text(formatter(bar.value, true));
                        lpos = me.labelPosition(bar, s, 'value');
                    } else if (lbl.hasClass('series')) {
                        // update column label position
                        lpos = me.labelPosition(bar, s, 'series');
                    }
                    if (lpos) {
                        lbl.animate({
                            x: lpos.left,
                            y: lpos.top,
                            align: lpos.halign,
                            valign: lpos.valign
                        }, theme.duration, theme.easing);
                    }
                });
                updated_bars[bar.name] = true;
            });
            // exit old bars
            _.each(me.__elements, function(elements, key) {
                if (!updated_bars[key]) {
                    me.__barExit(key);
                }
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

            if (me.get('absolute-scale', false)) {
                domain = dw.utils.minMax(_.map(me.axesDef.columns, function(c) { return me.dataset.column(c); }));
            }

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

            if (!me.gridVisible()) vspace = 0.02;

            cw = (c.w - c.lpad - c.rpad) * (1 - vspace - vspace);
            bw = cw / (n + (n-1) * pad);
            if (bw < 10) {
                bw = 2;
                pad = ((cw / bw) - n) / (n-1);
            }

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
                lbl_y = !lbl_top ? d.y - 5 : d.y + d.height + 5,
                formatter = me.chart().columnFormatter(me.getBarColumn());


            if (type == "value") {
                lbl_w = me.labelWidth(formatter(val, true), 'value outline hover');
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
                theme = me.theme(),
                ticks = me.getYTicks(yscale, c.h, true),
                tickLabels = me.__tickLabels = me.__tickLabels || {},
                gridLines = me.__gridLines = me.__gridLines || {},
                formatter = me.chart().columnFormatter(me.getBarColumn());

            if (!me.gridVisible()) ticks = [];

            ticks = ticks.filter(function(val, t) {
                return val >= domain[0] && val <= domain[1];
            });

            _.each(ticks, function(val, t) {
                var y = c.h - c.bpad - yscale(val), x = c.lpad, ly = y-10;
                // c.paper.text(x, y, val).attr(styles.labels).attr({ 'text-anchor': 'end' });
                if (theme.columnChart.cutGridLines) ly += 10;
                var key = String(val);
                // show or update label
                if (val !== 0) {
                    var lbl = tickLabels[key] = tickLabels[key] ||
                        me.label(x+2, ly, formatter(val, t == ticks.length-1, true),
                            { align: 'left', cl: 'axis', css: { opacity: 0 } });
                    lbl.animate({ x: c.lpad+2, y: ly, css: { opacity: 1 } }, theme.duration, theme.easing);
                }
                if (theme.yTicks) {
                    me.path([['M', c.lpad-25, y], ['L', c.lpad-20,y]], 'tick');
                }
                if (theme.horizontalGrid) {
                    var lattrs = { path: [['M', c.lpad, y], ['L', c.w - c.rpad,y]], opacity: 1 },
                        l = gridLines[key] = gridLines[key] || me.path(lattrs.path, 'grid');
                    l.toBack();
                    if (val === 0) {
                        $.extend(lattrs, theme.xAxis);
                        l.toFront();
                    } else {
                        l.attr(theme.horizontalGrid);
                        $.extend(lattrs, theme.horizontalGrid);
                    }
                    if (!me.__lastTicks || _.indexOf(me.__lastTicks, Number(val)) < 0) {
                        var old_path = lattrs.path;
                        if (me.__lastDomain) {
                            yscale.domain(me.__lastDomain);
                            y = c.h - c.bpad - yscale(val);
                            yscale.domain(domain);
                            old_path = [['M', c.lpad, y], ['L', c.w - c.rpad,y]];
                        }
                        l.attr({ opacity: 0, path: old_path });
                    }
                    if (val !== 0 && theme.columnChart.cutGridLines) lattrs.stroke = theme.colors.background;
                    l.animate(lattrs, theme.duration * (me.__lastTicks ? 1 : 0.2), theme.easing);
                }
            });
            // hide invisible grid lines
            $.each(gridLines, function(val, line) {
                if (_.indexOf(ticks, +val) < 0) {
                    var y = c.h - c.bpad - yscale(val), props = {};
                    $.extend(props, theme.horizontalGrid, { path: [['M', c.lpad, y], ['L', c.w - c.rpad, y]], opacity: 0 });
                    line.animate(props, theme.duration, theme.easing);
                    if (tickLabels[val]) {
                        var lbl = tickLabels[val];

                        tickLabels[val].animate({
                            x: c.lpad+2,
                            y: y + (theme.columnChart.cutGridLines ? -10 : 0),
                            css: {
                                opacity: 0
                            }
                        }, theme.duration, theme.easing );
                    }
                }
            });

            me.__lastTicks = ticks;
            me.__lastDomain = domain.slice(0);
        },

        hovers: function(column) {
            var me = this,
                theme = me.theme();
            _.each(me.getBarColumns(), function(col) {
                _.each(me.__labels[col.name()], function(lbl) {
                    if (column !== undefined && col.name() == column.name()) {
                        lbl.addClass('hover');
                        if (lbl.hasClass('showOnHover')) lbl.show(0.5);
                    } else {
                        lbl.removeClass('hover');
                        if (lbl.hasClass('showOnHover')) lbl.hide(0.5);
                    }
                    _.each(me.__elements[col.name()], function(el) {
                        var fill = me.getBarColor(col, el.data('row'), me.get('negative-color', false)), stroke;
                        if (column !== undefined && col.name() == column.name()) fill = chroma.color(fill).darken(14).hex();
                        stroke = chroma.color(fill).darken(theme.columnChart.darkenStroke).hex();
                        if (el.attrs.fill != fill || el.attrs.stroke != stroke)
                            el.animate({ fill: fill, stroke: stroke }, 50);
                    });
                });
            });
        },

        unhoverSeries: function() {
            this.hoverSeries();
        },

        gridVisible: function() {
            var me = this;
            return me.get('grid-lines', 'show') == 'show' ? true :
                me.get('grid-lines') == 'hide' ? false :
                (me.__canvas.w / me.getBarValues().length) < 50 || me.getBarValues().length > 8;
        }
    });

}).call(this);