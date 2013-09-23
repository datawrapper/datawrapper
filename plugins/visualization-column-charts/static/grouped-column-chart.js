
(function(){

    dw.visualization.register('grouped-column-chart', 'raphael-chart', {

        // some config
        _showValueLabels: function() { return true; },

        render: function(el) {

            this.setRoot(el);

            var me = this,
                c = me.initCanvas({}),
                dataset = me.dataset,
                chart_width = c.w - c.lpad - c.rpad,
                series_gap = 0.05, // pull from theme
                row_gap = 0.01;

            me.axesDef = me.axes();
            if (!me.axesDef) return;

            if (!_.isUndefined(me.get('selected-row'))) {
                row = me.get('selected-row');
            }

            me.checkData();

            me._color_opts = {};

            if (me.get('negative-color', false)) {
                me._color_opts.byValue = function(v) {
                    return me.theme().colors[v < 0 ? 'negative' : 'positive'];
                };
            } else {
                me._color_opts.varyLightness = true;
            }

            me.init();

            // compute maximum x-label height
            var lh = 0,
                barColumns = me.getBarColumns(),
                n = barColumns.length;
            _.each(barColumns, function(column, s) {
                lh = Math.max(lh, me.labelHeight(column.title(), 'series', c.w / (n)));
            });
            c.bpad += lh;


            me.initDimensions();

            // store bar references for updates
            me.__bars = {};
            me.__barLbls = {};
            me.__gridlines = {};
            me.__gridlabels = {};
            me.__series_names = {};

            if (!me.theme().columnChart.cutGridLines) me.horzGrid();

            me.update();

            // enable mouse events
            el.mousemove(_.bind(me.onMouseMove, me));

            if (dataset.numRows() > 1) {
                var items = [],
                    lblFmt = me.chart().columnFormatter(me.axes(true).labels);
                dataset.eachRow(function(r) {
                    items.push({
                        label: lblFmt(me.axes(true).labels.val(r)),
                        color: me.getColor(null, r, { varyLightness: true, key: me.axes(true).labels.val(r) })
                    });
                });
                me.addLegend(items, $('#header', c.root.parent()));
            }
            $('.showOnHover').hide();

            if (me.theme().columnChart.cutGridLines) me.horzGrid();

            me.post_render();
            me.renderingComplete();
        },

        update: function() {
            var me = this,
                c = me.__canvas,
                n = me.axesDef.columns.length;

            // draw bars
            _.each(me.getBarColumns(me.get('sort-values'), me.get('reverse-order')), function(column, s) {
                column.each(function(val, r) {
                    me._color_opts.key = me.axes(true).labels.val(r);
                    var d = me.barDimensions(column, s, r),
                        fill = me.getColor(column, r, me._color_opts),
                        stroke = chroma.color(fill).darken(10).hex(),
                        key = column.name()+'-'+r,
                        bar_attrs = {
                            x: d.x,
                            y: d.y,
                            width: d.w,
                            height: d.h,
                            stroke: stroke,
                            fill: fill
                        };

                    me.__bars[key] = me.__bars[key] || me.registerElement(c.paper.rect().attr(bar_attrs), column.name(), r);
                    if (me.theme().columnChart.barAttrs) {
                        me.__bars[key].attr(me.theme().columnChart.barAttrs);
                    }

                    me.__barLbls[key] = me.__barLbls[key] || me.registerLabel(me.label(0,0,'X', { align: 'center', cl: 'value' }), column.name());
                    me.__barLbls[key].animate({
                        x: d.x + d.w * 0.5,
                        y: d.y + d.h * 0.5,
                        txt: me.formatValue(column.val(r))
                    }, 1000, 'expoInOut');
                    me.__barLbls[key].data('row', r);
                    me.__barLbls[key].hide();

                    me.__bars[key].animate(bar_attrs, me.theme().duration, me.theme().easing).data('strokeCol', stroke);

                    var val_y = val >= 0 ? d.y - 10 : d.y + d.h + 10,
                        lbl_y = val < 0 ? d.y - 10 : d.y + d.h + 5,
                        lblcl = ['series'],
                        lbl_w = c.w / (n+2),
                        valign = val >= 0 ? 'top' : 'bottom',
                        halign = 'center',
                        alwaysShow = (me.chart().hasHighlight() && me.chart().isHighlighted(column.name())) || (d.w > 40);

                    if (me.chart().hasHighlight() && me.chart().isHighlighted(column.name())) {
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
                    if (!/^X\.\d+$/.test(column.title()) && r === 0) {

                        var la = {
                                x: d.bx + d.bw * 0.5,
                                y: lbl_y,
                                w: lbl_w,
                                align: halign,
                                valign: valign,
                                cl: lblcl.join(' '),
                                rotate: d.bw < 30 ? -90 : 0
                            },
                            sl = me.__series_names[column.name()] = me.__series_names[column.name()] ||
                                me.registerLabel(me.label(la.x, la.y, column.title(), la), column.name());

                        sl.animate(la, me.theme().duration, me.theme().easing);
                    }

                });
            });

            // draw baseline
            var y = c.h - me.__scales.y(0) - c.bpad;
            me.path([['M', c.lpad, y], ['L', c.w - c.rpad, y]], 'axis')
                .attr(me.theme().yAxis);
        },

        getBarColumns: function(sortBars, reverse) {
            return this._getBarColumns(sortBars, reverse);
        },

        // hack to be able to overload in stacked-column-charts.js
        _getBarColumns: function(sortBars, reverse) {
            var me = this,
                columns = _.map(me.axesDef.columns, function(i) { return me.dataset.column(i); });
            if (sortBars) {
                columns.sort(function(a, b) {
                    var aType = a.type(true);
                    return aType.toNum ? aType.toNum(a.val(0)) - aType.toNum(b.val(0)) : a.val() > b.val() ? 1 : a.val() == b.val() ? 0 : -1;
                });
            }
            if (reverse) columns.reverse();
            return columns;
        },

        initDimensions: function(r) {
            //
            var me = this, c = me.__canvas;

            me.__domain = dw.utils.minMax(me.getBarColumns());
            if (me.__domain[0] > 0) me.__domain[0] = 0;
            if (me.__domain[1] < 0) me.__domain[1] = 0;
            me.__scales = {
                y: d3.scale.linear().domain(me.__domain)
            };
            //                                                    v-- substract a few pixel to get space for the legend!
            me.__scales.y.rangeRound([0, c.h - c.bpad - c.tpad - 30]);
        },

        /*
         * computes x,y,w,h for each bar
         */
        barDimensions: function(column, s, r) {
            var me = this,
                sc = me.__scales,
                c = me.__canvas,
                n = me.axesDef.columns.length,
                w, h, x, y, i, cw, bw,
                pad = 0.35,
                vspace = 0.1,
                val = column.val(r);

            if (c.w / n < 30) vspace = 0.05;

            cw = (c.w - c.lpad - c.rpad) * (1 - vspace - vspace);
            bw = cw / (n + (n-1) * pad);
            h = sc.y(val) - sc.y(0);
            w = Math.round(bw / column.length);
            if (h >= 0) {
                y = c.h - c.bpad - sc.y(0) - h;
            } else {
                y = c.h - c.bpad - sc.y(0);
                h *= -1;
            }
            if (val !== 0) h = Math.max(0.5, h);
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

        /*
         * renders the horizontal grid
         */
        horzGrid: function() {
            // draw tick marks and labels
            var me = this,
                yscale = me.__scales.y,
                c = me.__canvas,
                domain = me.__domain,
                styles = me.__styles,
                ticks = me.getYTicks(yscale, c.h, true);

            ticks = ticks.filter(function(val, t) {
                return val >= domain[0] && val <= domain[1];
            });

            _.each(ticks, function(val, t) {
                var y = c.h - c.bpad - yscale(val),
                    x = c.lpad, ly = y-10, lbl,
                    txt = me.formatValue(val, t == ticks.length-1, true);
                // c.paper.text(x, y, val).attr(styles.labels).attr({ 'text-anchor': 'end' });
                if (me.theme().columnChart.cutGridLines) ly += 10;

                if (val !== 0) {
                    lbl = me.__gridlabels[val] = me.__gridlabels[val] || me.label(x+2, ly, txt, { align: 'left', cl: 'axis', css: { opacity: 0 } });
                    lbl.animate({ x: x+2, y: ly, css: { opacity: 1 } }, me.theme().duration, me.theme().easing);
                }

                if (me.theme().yTicks) {
                    me.path([['M', c.lpad-25, y], ['L', c.lpad-20,y]], 'tick');
                }
                if (me.theme().horizontalGrid) {
                    var p = 'M' + [c.lpad, y] + 'H' + c.w,
                        l = me.__gridlines[val] = me.__gridlines[val] || me.path(p, 'grid').attr(me.theme().horizontalGrid).attr('opacity', 0);

                    if (val === 0) l.attr(me.theme().xAxis);
                    else if (me.theme().columnChart.cutGridLines) l.attr('stroke', me.theme().colors.background);

                    l.animate({ path: p, opacity: 1 }, me.theme().duration, me.theme().easing);
                    l.toBack();
                }
            });

            _.each(me.__gridlabels, function(lbl, val) {
                if (_.indexOf(ticks, +val) < 0) {
                    lbl.animate({ css: { opacity: 0 } }, me.theme().duration, me.theme().easing);
                }
            });
            _.each(me.__gridlines, function(line, val) {
                if (_.indexOf(ticks, +val) < 0) {
                    line.animate({ opacity: 0 }, me.theme().duration, me.theme().easing);
                }
            });
        },

        /*
         * highlights hovered bars and displays value labels
         */
        hover: function(hoveredSeries) {
            var me = this,
                whitishBg = chroma.color(me.theme().colors.background).lch()[0] > 60;

            // compute fill color, depending on hoveredSeries
            function getFill(col, el) {
                var fill = me.getColor(null, el.data('row'), { varyLightness: true, key: me.axes(true).labels.val(el.data('row')) });
                if (hoveredSeries !== undefined && col.name() == dw.utils.name(hoveredSeries)) {
                    fill = chroma.color(fill).darken(whitishBg ? 15 : -25).hex();
                }
                return fill;
            }

            _.each(me.getBarColumns(), function(column) {

                var fill, stroke;

                // highlight/invert the column title
                _.each(me.__labels[column.name()], function(lbl) {
                    if (hoveredSeries !== undefined && column.name() == dw.utils.name(hoveredSeries)) {
                        lbl.addClass('hover');
                        if (lbl.hasClass('showOnHover')) lbl.show(0.5);
                    } else {
                        lbl.removeClass('hover');
                        if (lbl.hasClass('showOnHover')) lbl.hide(0.5);
                    }
                    if (lbl.hasClass('value')) {
                        lbl.removeClass('hover');
                        fill = getFill(column, lbl);
                            lbl.addClass('inverted');
                        //}
                    }
                });
                // animate the bar fill & stroke
                _.each(me.__elements[column.name()], function(el) {
                    fill = getFill(column, el);
                    stroke = chroma.color(fill).darken(10).hex();
                    if (el.attrs.fill != fill || el.attrs.stroke != stroke)
                        el.animate({ fill: fill, stroke: stroke }, 50);
                });
            });

            // show/hide the labels that show values on top of the bars
            var visibleLbls = [];
            _.each(me.__barLbls, function(lbl, key) {
                if (hoveredSeries && lbl.data('key') == dw.utils.name(hoveredSeries)) {
                    lbl.show();
                    visibleLbls.push(lbl.data('label'));
                } else lbl.hide();
            });
            me.optimizeLabelPositions(visibleLbls, 5);
        },

        unhoverSeries: function() {
            this.hoverSeries();
        },

        formatValue: function() {
            var me = this;
            // we're overwriting this function with the actual column formatter
            // when it is first called (lazy evaluation)
            me.formatValue = me.chart().columnFormatter(me.axes(true).columns[0]);
            return me.formatValue.apply(me, arguments);
        },

        post_render: function() {

        },

        checkData: function() {
            return true;
        }
    });

}).call(this);