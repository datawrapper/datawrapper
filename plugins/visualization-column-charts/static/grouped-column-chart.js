
(function(){

    dw.visualization.register('grouped-column-chart', 'raphael-chart', {

        // some config
        _showValueLabels: function() { return true; },

        _isStacked: function() { return false; },

        _directLabeling: function() {
            var me = this,
                mob = me.get('same-as-desktop') || me.__canvas.w > 420 ? '' : '-mobile';
            return me._isStacked() && me.get('direct-labeling'+mob) == 'always';
        },

        render: function(el) {

            this.setRoot(el);

            var me = this,
                c = me.initCanvas({}),
                dataset = me.dataset,
                chart_width = c.w - c.lpad - c.rpad,
                series_gap = 0.05, // pull from theme
                row_gap = 0.01;

            if (dataset.numRows() > 40 || dataset.numColumns() > 50) {
                console.log('limit');
                this.notify('Your dataset is too big for this chart type. You may want to consider using a different one (e.g. line chart or scatterplot).');
            }

            dataset.limitRows(100);
            dataset.limitColumns(50);

            var label_direct = me._directLabeling();

            me.axesDef = me.axes();
            if (!me.axesDef) return;

            if (!_.isUndefined(me.get('selected-row'))) {
                row = me.get('selected-row');
            }

            me.__top = $(el).offset().top - $(el).parent().offset().top;

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
                lhi = 0,
                lw = 0,
                lwi = 0;
                barColumns = me.getBarColumns(),
                n = barColumns.length,
                all_values_negative = true;

            _.each(barColumns, function(column, s) {
                var lbl_w = me.labelWidth(column.title(), 'series'),
                    lbl_h = me.labelHeight(column.title(), 'series');

                if (lbl_w >= lw) { lw = lbl_w; lwi = s; }
                if (lbl_h >= lh) { lh = lbl_h; lhi = s; }

                column.each(function(val) {
                    if (val > 0) all_values_negative = false;
                });
            });

            if (label_direct) {
                var mobile = me.get('same-as-desktop') || c.w > 420 ? '' : '-mobile',
                    labelSpace = me.get('label-space'+mobile)/100;

                c.tpad = 2;
                c.rpad = Math.max(c.w * labelSpace, 1);
            } else c.tpad += 20;

            if (me.get('grid-lines') && me._isStacked()) c.tpad += 10;

            var bw = me.barDimensions(barColumns[0], 0, 0).bw;

            if (bw < 20) {
                c.bpad += me.labelWidth(barColumns[lwi].title(), 'series smaller');
            } else if (bw < 30) {
                c.bpad += Math.min(100, lw);
            } else {
                c.bpad += lh;
            }

            if (all_values_negative) {
                c.tpad = 30;
                c.bpad = 0;
            }

            if (dataset.numRows() > 1) {
                var items = [],
                    lblFmt = me.chart().columnFormatter(me.axes(true).labels);
                dataset.eachRow(function(r) {
                    items.push({
                        key: 'row-'+r,
                        label: lblFmt(me.axes(true).labels.val(r)),
                        color: me.colorMap()(me.getBarColor(null, r, { varyLightness: true, key: me.axes(true).labels.val(r) }))
                    });
                });
                if (!label_direct) me.addLegend(items, $('#chart'));
            }

            me.initDimensions();

            // store bar references for updates
            me.__bars = {};
            me.__barLbls = {};
            me.__gridlines = {};
            me.__gridlabels = {};
            me.__series_names = {};
            me.__row_labels = {};
            me.__row_label_lines = {};
            me.__barCn = {};

            if (!me.theme().columnChart.cutGridLines) me.horzGrid();

            me.update();

            // enable mouse events
            el.mousemove(_.bind(me.onMouseMove, me));

            $('.showOnHover').hide();

            if (me.theme().columnChart.cutGridLines) me.horzGrid();

            me.post_render();
            me.renderingComplete();
        },

        update: function() {
            var me = this,
                c = me.__canvas,
                n = me.axesDef.columns.length,
                columns = me.getBarColumns(me.get('sort-values'), me.get('reverse-order')),
                lblFmt = me.chart().columnFormatter(me.axes(true).labels);

            me.__rowx = [];

            var directLbls = [],
                last_bar,
                bar_dims = {};

            var cm = me.colorMap();

            // draw bars
            _.each(columns, function(column, s) {
                column.each(function(val, r) {
                    me._color_opts.key = me.axes(true).labels.val(r);
                    var d = me.barDimensions(column, s, r),
                        fill = me.getBarColor(column, r, me._color_opts),
                        stroke = fill, //chroma.color(fill).darken(10).hex(),
                        key = column.name()+'-'+r,
                        bar_attrs = {
                            x: d.x,
                            y: d.y,
                            width: d.w,
                            height: d.h,
                            stroke: cm(stroke),
                            fill: cm(fill)
                        };
                    bar_dims[s+'/'+r] = d;
                    last_bar = d;
                    me.__rowx.push([d.x, d.x+d.w, d.y, d.y + d.h, r]);

                    var valueLabels = me.get('value-labels');

                    me.__bars[key] = me.__bars[key] || me.registerElement(c.paper.rect().attr(bar_attrs), column.name(), r);
                    if (me.theme().columnChart.barAttrs) {
                        me.__bars[key].attr(me.theme().columnChart.barAttrs);
                    }

                    if (valueLabels != "hide") {
                        me.__barLbls[key] = me.__barLbls[key] || me.registerLabel(me.label(0,0,'X', {
                                align: 'center', cl: 'value'+(d.h > 30 || me._isStacked() ? ' inside' : '') }), column.name());
                        // console.log('xxx', column.name(), r, d.y, d.h, 'y:', +d.y + (column.val(r) >= 0 ? +(d.h > 30 ? d.h - 12 : -12) : +(d.h > 30 ? 12 : d.h + 12) ))
                        me.__barLbls[key].animate({
                            x: d.x + d.w * 0.5,
                            y: me._isStacked() ?
                                d.y + d.h * 0.5 :
                                +d.y + (column.val(r) >= 0 ? +(d.h > 30 ? 12 : -12) : +(d.h > 30 ? d.h- 12 : d.h + 12) ), // < 0
                            txt: me.formatValue(column.val(r), true)
                        }, 0, 'expoInOut');
                        me.__barLbls[key].data('row', r);


                        if (!valueLabels || valueLabels == "auto") {
                            me.__barLbls[key].hide();
                        } else if (valueLabels == "always") {
                            me.__barLbls[key].show();
                        }

                        me.__bars[key].animate(bar_attrs, me.theme().duration, me.theme().easing).data('strokeCol', stroke);

                    }

                    var val_y = val >= 0 ? d.y - 10 : d.y + d.h + 10,
                        lbl_y = val < 0 ? d.y - 10 : d.y + d.h + 5,
                        lblcl = ['series'],
                        lbl_w = d.tw-5,
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
                    if (d.bw < 30) {
                        lblcl.push('rotate90');
                    }

                    if (me._isStacked() && me.get('connect-bars') && s > 0) {
                        var pp = bar_dims[(s-1)+'/'+(r)];
                            cn_attrs = {
                                fill: cm(fill),
                                stroke: cm(fill),
                                opacity: 0.15,
                                path: 'M'+[pp.x+pp.w, pp.y]+'L'+[d.x, d.y, d.x, d.y + d.h, pp.x+pp.w, pp.y+pp.h]
                            };
                        me.__barCn[key] = me.__barCn[key] || me.registerElement(c.paper.path().attr(cn_attrs), column.name(), r);
                        me.__barCn[key].animate(cn_attrs, me.theme().duration, me.theme().easing);
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

                    // add row label (if direct)
                    if (me._directLabeling() && s == columns.length-1) {
                        var rl = {
                                x: c.w - c.rpad+20 - (me.get('grid-lines') ? 0 : (c.w * me.get('margin')/150)),
                                y: d.y + d.h*0.5,
                                oy: d.y + d.h*0.5,
                                w: c.rpad-20,
                                align: 'left',
                                valign: 'middle',
                                cl: '',
                                rotate: 0
                            },
                            sl2_key = 'row-'+r,
                            sl2 = me.__row_labels[sl2_key] = me.__row_labels[sl2_key] ||
                                me.registerLabel(me.label(rl.x, rl.y, lblFmt(me.axes(true).labels.val(r)), rl), sl2_key);
                            sl2.__attrs = rl;

                        directLbls.push(sl2);
                    }

                });
            });


            function getFill(col, el) {
                var fill = me.getBarColor(null, el.data('row'), { varyLightness: true, key: me.axes(true).labels.val(el.data('row')) });
                return fill;
            }

            _.each(me.getBarColumns(), function(column) {
                var fill, stroke;

                _.each(me.__labels[column.name()], function(lbl) {
                    if (lbl.hasClass('value')) {
                        fill = getFill(column, lbl);
                        if (lbl.hasClass('inside') && chroma(fill).lab()[0] < 70) { lbl.addClass('inverted'); }
                    }
                });
            });

            me.optimizeLabelPositions(directLbls, 7, 'middle', 0, c.h-c.bpad-7);

            directLbls.forEach(function(lbl, r) {
                lbl.__attrs.y = lbl.__attrs.oy + lbl.__noverlap.dy;

                var path = 'M'+(last_bar.x + last_bar.w)+','+lbl.__attrs.oy+'L'+(lbl.__attrs.x-3)+','+lbl.__attrs.y;

                if (me.__row_label_lines[r]) me.__row_label_lines[r].animate({path: path}, me.theme().duration, me.theme().easing);
                else me.__row_label_lines[r] = c.paper.path(path).attr(me.theme().yAxis).attr({ opacity: 0.5 });

                lbl.animate(lbl.__attrs, me.theme().duration, me.theme().easing);
            })

            // draw baseline
            if (!me._isStacked() || me.get('grid-lines')) {
                var y = c.h - me.__scales.y(0) - c.bpad;
                me.path([['M', c.lpad, y], ['L', c.w - c.rpad, y]], 'axis').attr(me.theme().yAxis);
            }
        },

        getBarColor: function(bar, row, opts) {
            var me = this;
            var ax = me.axes(true).labels,
                fmt = me.chart().columnFormatter(ax),
                key = fmt(ax.values()[row]);

            if (me.hasKeyColor(key)) return me.getKeyColor(key);
            return me.getColor(bar, row, opts);
        },

        getBarColumns: function(sortBars, reverse) {
            return this._getBarColumns(sortBars, reverse);
        },

        // hack to be able to overload in stacked-column-charts.js
        _getBarColumns: function(sortBars, reverse) {
            var me = this,
                columns = _.map(me.axesDef.columns, function(i) { return me.dataset.column(i); }),
                sortByFirst = me.get('sort-by') != 'last';
            if (sortBars) {
                columns = columns.sort(function(a, b) {
                    var aType = a.type(true),
                        bType = b.type(true),
                        r = sortByFirst ? 0 : a.length-1,
                        a_val = aType.toNum ? aType.toNum(a.val(r)) : a.val(r),
                        b_val = bType.toNum ? bType.toNum(b.val(r)) : b.val(r);
                    return a_val > b_val ? 1 : a_val < b_val ? -1 : 0;
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

            var lh = ($('.legend div:last').offset().top - $('.legend div:first').offset().top),
                svg = $(me._svgCanvas()),
                ch = $(svg.parent());

            $(svg).height($(svg).height()-lh);
            $(ch).height($(ch).height()-lh);

            // -- substract a few pixel to get space for the legend!
            me.__scales.y.rangeRound([0, c.h - c.bpad - c.tpad - (lh+20)]);
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
            w = Math.round(bw / column.length);

            if (sc && sc.y) {
                h = sc.y(val) - sc.y(0);
                if (h >= 0) {
                    y = c.h - c.bpad - sc.y(0) - h;
                } else {
                    y = c.h - c.bpad - sc.y(0);
                    h *= -1;
                }
            }
            if (val !== 0) h = Math.max(0.5, h);
            x = Math.round((c.w - c.lpad - c.rpad) * vspace + c.lpad + s * (bw + bw * pad));
            return { w: w, h: h, x: x + Math.floor((w+1)*r), y: y, bx: x, bw: bw, tw: bw + bw * pad };
        },

        getDataRowByPoint: function(x, y) {
            var me = this;
            return (_.find(this.__rowx, function(d) {
                return x >= d[0] && x <= d[1] && y-me.__top >= d[2] && y-me.__top <= d[3];
            }) || [0,0,0,0,-1])[4];
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

            if (me._isStacked() && !me.get('grid-lines')) return;

            ticks = ticks.filter(function(val, t) {
                return val >= domain[0] && val <= domain[1];
            });

            _.each(ticks, function(val, t) {
                var y = c.h - c.bpad - yscale(val),
                    x = c.lpad, ly = y-10, lbl,
                    txt = me.formatValue(val, true);
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
                    var p = 'M' + [c.lpad, y] + 'H' + (c.w - c.rpad),
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
        hover: function(hoveredSeries, row) {
            var me = this,
                whitishBg = chroma.color(me.theme().colors.background).lch()[0] > 60;
            // compute fill color, depending on hoveredSeries
            function getFill(col, el) {
                var fill = me.getBarColor(null, el.data('row'), { varyLightness: true, key: me.axes(true).labels.val(el.data('row')) });
                // if (hoveredSeries !== undefined && col.name() == dw.utils.name(hoveredSeries)) {
                //     fill = chroma.color(fill).darken(whitishBg ? 15 : -25).hex();
                // }
                return fill;
            }

            _.each(me.getBarColumns(), function(column) {

                var fill, stroke;

                // highlight/invert the column title
                _.each(me.__labels[column.name()], function(lbl) {
                    if (hoveredSeries !== undefined && column.name() == dw.utils.name(hoveredSeries)) {
                        // lbl.addClass('hover');
                        // if (lbl.hasClass('showOnHover')) lbl.show(0.5);
                    } else {
                        lbl.removeClass('hover');
                        if (lbl.hasClass('showOnHover')) lbl.hide(0.5);
                    }
                    if (lbl.hasClass('value')) {
                        lbl.removeClass('hover');
                        fill = getFill(column, lbl);
                        // console.log(fill, );
                        if (lbl.hasClass('inside') && chroma(fill).lab()[0] < 50) lbl.addClass('inverted');
                        //}
                    }
                });

                $('.dw-chart .legend > div').removeClass('hover');
                if (hoveredSeries) $('.dw-chart .legend > div[data-key="row-'+row+'"]').addClass('hover');
                // animate the bar fill & stroke
                // _.each(me.__elements[column.name()], function(el) {
                //     fill = getFill(column, el);
                //     stroke = fill; //chroma.color(fill).darken(10).hex();
                //     if (el.attrs.fill != fill || el.attrs.stroke != stroke)
                //         el.animate({ fill: fill, stroke: stroke }, 50);
                // });
            });

            // show/hide the labels that show values on top of the bars
            var visibleLbls = [];
            _.each(me.__barLbls, function(lbl, key) {
                var valueLabels = me.get('value-labels');
                if (!valueLabels || valueLabels == "auto") {
                    if (hoveredSeries && lbl.data('row') == row && hoveredSeries == lbl.data('key')) {
                        lbl.show();
                        visibleLbls.push(lbl.data('label'));
                    } else lbl.hide();
                }
            });
            // me.optimizmeLabelPositions(visibleLbls, 5);
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
