
(function(){

    dw.visualization.register('grouped-column-chart', 'column-chart', {
        _showValueLabels: function() { return true; },

        _isStacked: function() { return false; },

        render: function(el) {            
            var me = this;

            me.checkDataset(el);
            if (!me.axesDef) return;

            c = me.initCanvas({ tpad: 20 });            
            c.rpad = 0;
            c.lpad = 0;
            c.bpad = 10
            
            me.init();
            me.renderChart(el, c);                
            me.renderingComplete();
        },

        initColorOptions: function(el) {
            var me = this;                

            me.__top = $(el).offset().top - $(el).parent().offset().top;
            me._color_opts = {};
            
            if (me.get('negative-color', false)) {
                me._color_opts.byValue = function(v) {
                    return me.theme().colors[v < 0 ? 'negative' : 'positive'];
                };
            } else {
                me._color_opts.varyLightness = true;
            }
        },

        renderChart: function(el, c) {            
            var me = this,
                dataset = me.dataset;                
                barColumns = me.getBarColumns(), 
                all_values_negative = true;               
             
            me.initColorOptions(el);
            me.calculateGridLabelSpace();
            me.addSeriesLabelSpace(c, barColumns.map(function(d) { return { name: d.title() }; }));   

            if (me.useDirectLabeling()) {
                var mobile = me.get('same-as-desktop') || c.w > 420 ? '' : '-mobile',
                    labelSpace = me.get('label-space'+mobile)/100;

                c.rpad = Math.max(c.w * labelSpace, 1);
            } else {                
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
                    
                    me.addLegend(items, $('#chart'));
                }
            }

            _.each(barColumns, function(column, s) {
                column.each(function(val) {
                    if (val > 0) all_values_negative = false;
                });
            });

            if (all_values_negative) {
                c.tpad = 30;
                c.bpad = 0;
            }

            // store bar references for updates
            ["__bars", "__barLbls", "__gridlines", "__gridlabels", "__series_names", "__row_labels",
                "__row_labels", "__row_label_lines", "__barCn"].forEach(function(prop) {
                me[prop] = {}
            });

            me.initDimensions();
            me.horzGrid(false, me.getBarColumns()[0]);
            me.update();
            el.mousemove(_.bind(me.onMouseMove, me));
        },

         getDomain: function() {
            var me = this,
                domain = dw.utils.minMax(me.getBarColumns()),
                customRange = me.get("custom-range");        

            if (me.get('absolute-scale', false)) {
                domain = dw.utils.minMax(_.map(me.axesDef.columns, function(c) { return me.dataset.column(c); }));
            }    

            if (customRange && typeof customRange[0] !== "undefined" && customRange[0] !== null && customRange[0] !== "") {
                domain[0] = customRange[0];
            }

            if (customRange && typeof customRange[1] !== "undefined" && customRange[1] !== null && customRange[1] !== "") {
                domain[1] = customRange[1];
            }

            if (domain[0] > 0) domain[0] = 0;
            if (domain[1] < 0) domain[1] = 0;

            return domain;
        },

        initDimensions: function(r) {            
            var me = this, c = me.__canvas;

            me.__domain = me.getDomain();
            me.__scales = {
                y: d3.scale.linear().domain(me.__domain)
            };

            var lh = ($('.legend div:last').offset().top - $('.legend div:first').offset().top),
                svg = $(me._svgCanvas()),
                ch = $(svg.parent());

            $(svg).height($(svg).height());
            $(ch).height($(ch).height());

            // -- substract a few pixel to get space for the legend!
            me.__scales.y.rangeRound([0, c.h - c.bpad - c.tpad - (lh+10)]);
        },

        outerPadding: function() {
            return 40;
        },

        barAndLabelWidth: function() {
            var me = this,
                c = me.__canvas,
                n = me.getBarValues().length,
                s = barColumns.length,
                pad = me.get("series-padding", 10) / 100,
                gridLabelSpace = me.gridLabelSpace(),
                cw = c.w - c.lpad - c.rpad - gridLabelSpace - me.outerPadding();

            return {
                barWidth: cw / (s + (s-1) * pad) / n,                
                labelWidth: cw / (s + (s-1) * pad),
                seriesWidth: cw / s,
            };            
        },

        /*
         * computes x,y,w,h for each bar
         */
        barDimensions: function(column, s, r) {
            var me = this,
                sc = me.__scales,
                c = me.__canvas,
                n = me.axesDef.columns.length,
                h, x, y, i, seriesX,
                gridLabelSpace = me.gridLabelSpace(),
                barLabelWidth = me.barLabelWidth(),
                seriesSpace = me.barAndLabelWidth().seriesWidth,
                bw = me.barWidth(),
                pad = me.get("series-padding", 10) / 100,
                gridLabelPosition = me.get("grid-label-position", "left"),
                val = column.val(r);
                        
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

            var leftPad = c.lpad + me.outerPadding() / 2 + (gridLabelPosition == "left" ? gridLabelSpace : 0),
                otherBars = r * bw,
                otherSeries = s * seriesSpace,
                pad = s > 0 ? (seriesSpace * pad / n) : 0;

            x = Math.round(leftPad + otherBars + otherSeries + pad);
            seriesX = Math.round(leftPad + otherSeries + seriesSpace / 2);

            return { w: bw, h: h, x: x, y: y, bx: seriesX, bw: seriesSpace, tw: barLabelWidth };
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

                    me.__bars[key] = me.__bars[key] || me.registerElement(c.paper.rect().attr(bar_attrs), column.name(), r);

                    var valueLabels = me.get('value-labels');                                    

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

                        if (!valueLabels || valueLabels == "hover") {
                            me.__barLbls[key].hide();
                        } else if (valueLabels == "always") {
                            me.__barLbls[key].show();
                        }

                        me.__bars[key].animate(bar_attrs, 0, me.theme().easing).data('strokeCol', stroke);
                    }

                    var val_y = val >= 0 ? d.y - 10 : d.y + d.h + 10,
                        lbl_y = val < 0 ? d.y - 10 : d.y + d.h + 5,
                        lblcl = ['series'],
                        lbl_w = d.tw,
                        valign = val >= 0 ? 'top' : 'bottom',
                        halign = 'center',
                        alwaysShow = (me.chart().hasHighlight() && me.chart().isHighlighted(column.name())) || (d.w > 40);

                    if (me.chart().hasHighlight() && me.chart().isHighlighted(column.name())) {
                        lblcl.push('highlighted');
                    }

                    if (me.useSmallerLabels()) {
                        lblcl.push('smaller');
                    }
                    if (me.rotateLabels()) {                        
                        lbl_w = 100;
                        lblcl.push('rotate90');
                        $('.dw-chart-body').addClass('rotated-labels');
                        halign = 'right';
                    } else {
                        $('.dw-chart-body').removeClass('rotated-labels');
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
                                x: d.bx,
                                y: lbl_y,
                                w: lbl_w,
                                align: halign,
                                valign: valign,
                                cl: lblcl.join(' '),
                                css: {
                                    "word-break": "break-word"
                                },
                                rotate: me.rotateLabels() ? -90 : 0
                            },
                            sl = me.__series_names[column.name()] = me.__series_names[column.name()] ||
                                me.registerLabel(me.label(la.x, la.y, column.title(), la), column.name());

                        console.log(halign);

                        sl.animate(la, 0, me.theme().easing);
                    }

                    // add row label (if direct)
                    if (me.useDirectLabeling() && s == columns.length-1) {
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
        },

        useDirectLabeling: function() {
            var me = this,
                mob = me.get('same-as-desktop') || me.__canvas.w > 420 ? '' : '-mobile';
            return me._isStacked() && me.get('direct-labeling'+mob) == 'always';
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
         * highlights hovered bars and displays value labels
         */
        hover: function(hoveredSeries, row) {
            var me = this;

            // highlight legend element
            $('.dw-chart .legend > div').removeClass('hover');
            if (hoveredSeries) {
                $('.dw-chart .legend > div[data-key="row-'+row+'"]').addClass('hover');                
            }

            // show/hide the labels that show values on top of the bars            
            _.each(me.__barLbls, function(lbl, key) {
                var valueLabels = me.get('value-labels');
                if (!valueLabels || valueLabels == "hover") {
                    if (hoveredSeries && lbl.data('row') == row && hoveredSeries == lbl.data('key')) {
                        lbl.show();                        
                    } else {
                        lbl.hide();
                    }
                }
            });             
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

    });

}).call(this);
