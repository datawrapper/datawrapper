
(function(){

    dw.visualization.register('column-chart', 'raphael-chart', {

        checkDataset: function(el) {
            var me = this,
                dataset = me.dataset;

            if (dataset.numRows() > 40 || dataset.numColumns() > 50) {
                console.log('limit');
                me.notify('Your dataset is too big for this chart type. You may want to consider using a different one (e.g. line chart or scatterplot).');
            }

            dataset.limitRows(100);
            dataset.limitColumns(500);            
            me.setRoot(el);
            me.axesDef = me.axes();
            me.__lastRow = 0;            
        },

        render: function(el) {
            var me = this, 
                dataset = me.dataset,
                theme = me.theme(),
                filter, 
                filterUI, 
                c,                 
                chart_width,
                barColumns = _.map(me.axes().columns, function(i) { return dataset.column(i); }),
                filter = dw.utils.filter(dw.utils.columnNameColumn(barColumns), 0),
                filterUI = filter.ui(me),
                filterH = 0;

            me.checkDataset(el);
            if (!me.axesDef) return;
                               
            if (filterUI) {
                (function() {
                    var $h = $('#header'),
                        oldHeaderHeight = $h.height();
                    $h.append(filterUI);
                    filterH = $h.height() - oldHeaderHeight;
                    filter.change(function(val, i) {
                        me.__lastRow = i;
                        me.update(i);
                    });
                })();
            }

            c = me.initCanvas({ tpad: 20 }, 0, filterH);
            c.rpad = 0;
            c.lpad = 0;
            c.bpad = 10;    
            if (filterUI) c.tpad += 5;

            me.renderChart(el, c);
            
            me.renderingComplete();
        },

        renderChart: function(el, c, chart_width) {            
            var me = this,
                column = me.getBarColumn(),
                bars = me.getBarValues(),
                sortBars = me.get('sort-values'), 
                reverse = me.get('reverse-order'),
                chart_width = c.w - c.lpad - c.rpad;

            me.init();

            if (!column) return;            

            me.calculateGridLabelSpace();
            me.addSeriesLabelSpace(c, bars);    
            
            me.initDimensions();
            me.horzGrid();

            var barValues = me.getBarValues(sortBars, reverse);

            _.each(barValues, _.bind(me.__barEnter, me));        

            // enable mouse events
            el.mousemove(_.bind(me.onMouseMove, me));            
            
            if (me.__gridLines && me.__gridLines['0']) me.__gridLines['0'].toFront();
        },

        addSeriesLabelSpace: function(c, bars) {
            var me = this,
                mm = me.getDomain(),
                mm_r = mm[0] >= 0 ? 1 : mm[1] <= 0 ? 0 : mm[1] / (mm[1] - mm[0]),
                maxLabelHeight = 0,
                labelSpace = me.barLabelWidth(),                
                labelClass = 'label series x-tick-values chart-text' + (me.useSmallerLabels() ? " smaller" : "");

            if (me.rotateLabels()) {                
                maxLabelHeight = Math.min(d3.max(bars, function(d) {
                    return me.labelWidth(d.name, labelClass);
                }) + 10, 100);
            } else {                
                maxLabelHeight = d3.max(bars, function(d) {         
                    return me.labelHeight(d.name, labelClass, labelSpace);
                });                                      
            }       

            c.bpad += maxLabelHeight * mm_r;
            c.tpad += maxLabelHeight * (1-mm_r);
        },

        calculateGridLabelSpace: function() {
            /* we can't use the real ticks yet as they depend on the chart height,
                which depends on the label height, which depends on the label width,
                which depends on the grid tick space, which we're calculating here */
            var me = this,
                ticks = me.getDomain();

            if (me._isStacked && me._isStacked() && me.is_normalized()) {
                ticks = [0, 100];
            }

            me.__gridLabelSpace = d3.max(ticks, function(val, t) {
                var formatter = me.chart().columnFormatter(me.getBarColumn()),
                    txt = formatter(val, t == ticks.length-1, false);

                return me.labelWidth(txt, 'label axis');
            }) + 14;
        },    

        getDataRowByPoint: function(x, y) {
            return 0;
        },

        showTooltip: function() {

        },

        hideTooltip: function() {

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
                bar,
                formatter = chart.columnFormatter(me.getBarColumn()),
                cm = me.colorMap(),
                rectD = JSON.parse(JSON.stringify(d));
            
            rectD.x = d.bx;

            if (typeof barv.value == "undefined" || barv.value == null) barv.value = "";

            // create bar
            bar = me.registerElement(c.paper.rect().attr(rectD).attr({
                // 'stroke': stroke,
                stroke: null,
                fill: cm(fill)
            }), barv.name);

            if (theme.columnChart.barAttrs) {
                bar.attr(theme.columnChart.barAttrs);
            }

            var val_y  = val > 0 ? d.y - 10 : d.y + d.height + 10,
                lbl_y  = val <= 0 ? d.y - 10 : d.y + d.height + 5,
                f_val  = formatter(val, true),
                vlbl_w = me.labelWidth(f_val, 'value'),
                bw     = (d.width + d.width * d.pad),
                lblcl  = ['series x-tick-values chart-text'],
                lbl_w  = c.w / (n+2),
                valign = val > 0 ? 'top' : 'bottom',
                halign = 'center',
                is_local_max = (!barv._prev || Math.abs(barv._prev.value) < Math.abs(val)) &&
                    (!barv._next || Math.abs(barv._next.value) < Math.abs(val)),
                vlbl_space = bw * (is_local_max ? 3 : 1),
                valueLabels = me.get('value-labels');

            var lpos = me.labelPosition(barv, s, 'value'),
                spos = me.labelPosition(barv, s, 'series', barv.name);

            // add value labels
            if (valueLabels != "hide") {                
                me.registerLabel(me.label(lpos.left, lpos.top, formatter(barv.value, true),{
                    w: lpos.width,
                    align: 'center',
                    cl: 'value outline direct-value-label chart-text' + (valueLabels == "hover" ? ' only-on-hover' : "")
                }), barv.name);
            }

            if (chart.hasHighlight() && chart.isHighlighted(barv.name)) {
                lblcl.push('highlighted');
            }            
            if (me.useSmallerLabels()) {
                lblcl.push('smaller');
            }
            if (me.rotateLabels()) {
                lblcl.push('rotate90');
            }

            // add column label
            if (!/^X\.\d+$/.test(barv.name)) {
                me.registerLabel(me.label(spos.left, spos.top, d.bw < 10 && s % 2 === 1 ? '' : barv.name, {
                    w: spos.width,
                    align: spos.halign,
                    valign: spos.valign,
                    cl: lblcl.join(' '),
                    rotate: me.rotateLabels() ? -90 : 0,
                    css: {
                        "word-break": "break-word"
                    }
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

        useSmallerLabels: function() {
            return this.barLabelWidth() < 30;
        },

        rotateLabels: function() {
            var me = this,
                rotateLabels = me.get("rotate-labels", "auto"),
                barLabelWidth = me.barLabelWidth();

            if (rotateLabels === true || rotateLabels == "on") {
                return true;
            } else if (rotateLabels === "off") {
                return false;
            } else {
                return barLabelWidth < 30;
            }
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
            // add pointers to prev/next values
            values.forEach(function(v,i) {
                if (i) v._prev = values[i-1];
                if (i < values.length-1) v._next = values[i+1];
            });
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

            me.calculateGridLabelSpace();

            // update scales
            me.initDimensions();

            // update axis and grid
            me.horzGrid(true);

            var n = me.__n = me.getBarValues().length,
                updated_bars = {},
                cm = this.colorMap();

            // update bar heights and labels
            _.each(me.getBarValues(me.get('sort-values'), me.get('reverse-order')), function(bar, s) {
                // enter new bar
                if (!me.__elements[bar.name]) me.__barEnter(bar, s);

                _.each(me.__elements[bar.name], function(rect) {
                    var dim = me.barDimensions(bar, s, 0);
                    rect.animate(dim, theme.duration, theme.easing);

                    var fill = me.getKeyColor(bar.name, bar.value, me.get('negative-color', false)), stroke;
                    if (rect.attrs.fill != fill) rect.attr({ fill: cm(fill) });
                });

                _.each(me.__labels[bar.name], function(lbl) {
                    var lpos;
                    if (lbl.hasClass('value')) {
                        // update value    
                        if (typeof bar.value == "undefined" || bar.value == null || bar.value == "undefined") bar.value = "";
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

                        if (!lbl.hasClass('value')) {
                            if (lpos.valign == "bottom") {
                                $(lbl.el).addClass("lbl-align-left").removeClass("lbl-align-right");
                            } else if (lpos.valign == "top") {
                                $(lbl.el).addClass("lbl-align-right").removeClass("lbl-align-left");
                            }
                        }
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

        getDomain: function() {
            var me = this,
                domain = me.getBarColumn().range(),
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
            var me = this,
                c = me.__canvas,
                domain = me.getDomain();

            me.__domain = domain;
            me.__scales = {
                y: d3.scale.linear().domain(domain)
            };
            me.__scales.y.rangeRound([0, c.h - c.bpad - c.tpad]);
        },

        barAndLabelWidth: function() {
            var me = this,
                c = me.__canvas,
                n = me.getBarValues().length,
                pad = me.get("bar-padding", 30) / 100,
                gridLabelSpace = me.gridLabelSpace(),
                cw = c.w - c.lpad - c.rpad - gridLabelSpace;

            return {
                barWidth: cw / (n + (n > 2 ? (n - 1) : (n)) * pad),
                labelWidth: cw / n
            };            
        },

        barWidth: function() {
            return this.barAndLabelWidth().barWidth;            
        },

        barLabelWidth: function() {
            return this.barAndLabelWidth().labelWidth;
        },

        gridLabelSpace: function() {
            var me = this,
                position = me.get('grid-labels', 'outside'),
                gridVisible = me.gridVisible();

            if (gridVisible && position == "outside") {
                return me.__gridLabelSpace;             
            } else {
                return 5;
            }
        },

        gridLabelPosition: function() {
            var me = this;

            if (me._isStacked && me._isStacked() && me.useDirectLabeling()) {
                return "left"
            }

            return me.get("grid-label-position", "left");
        },

        barDimensions: function(bar, s) {
            var me = this,
                sc = me.__scales,
                c = me.__canvas,
                n = me.getBarValues().length,
                w, h, x, y, i, cw, bw,                
                gridLabelSpace = me.gridLabelSpace(),
                val = bar.value,
                bw = me.barWidth(),
                barLabelWidth = me.barLabelWidth(),                
                pad = me.get("bar-padding", 30) / 100,
                gridLabelPosition = me.gridLabelPosition();

            if (isNaN(val)) val = 0;           
           
            h = sc.y(val) - sc.y(0);
            
            if (h >= 0) {
                y = c.h - c.bpad - sc.y(0) - h;
            } else {
                y = c.h - c.bpad - sc.y(0);
                h *= -1;
            }

            if (h !== 0) h = Math.max(1, h);

            var leftPad = c.lpad + (gridLabelPosition == "left" ? gridLabelSpace : 0),
                otherBars = s * barLabelWidth,
                pad = bw * pad;

            x = Math.round(leftPad + otherBars + pad/2);        

            return { width: Math.round(bw), height: h, x: x, y: y, bx: x, bw: bw, pad: pad };
        },

        labelPosition: function(bar, s, type, txt) {
            var me = this,
                d = me.barDimensions(bar, s), 
                lbl_w,
                val = bar.value,
                c = me.__canvas,
                lbl_top = val >= 0 || isNaN(val),
                valign = lbl_top ? 'top' : 'bottom',
                halign = 'center',
                val_y = lbl_top ? d.y - 10 : d.y + d.height + 10,
                lbl_y = !lbl_top ? d.y - 5 : d.y + d.height + 5,
                pad = pad = me.get("bar-padding", 30) / 100,
                gridLabelPosition = me.get("grid-label-position", "left");
                formatter = me.chart().columnFormatter(me.getBarColumn()),
                left = d.bx + d.width * 0.5;

            if (type == "value") {
                lbl_w = me.labelWidth(formatter(val, true), 'value outline hover');

                if (gridLabelPosition == "right") {
                    left = Math.max(0 + lbl_w * 0.5, d.bx + d.width * 0.5)
                } else {
                    left = Math.min(c.w - lbl_w * 0.5, d.bx + d.width * 0.5)
                }

                return { left: left, top: val_y, width: lbl_w };
            } else if (type == "series") {
                lbl_w = me.barLabelWidth();

                if (me.rotateLabels()) {
                    var height = me.labelHeight(txt, "label series x-tick-values chart-text" + (me.useSmallerLabels() ? " smaller" : ""), 100);                    

                    lbl_y -= 10;  // move towards zero axis
                    lbl_w = 100;
                    
                    left = left - height/3 + 5;
                    halign = 'right'; // lbl_top ? 'right' : 'left';
                }

                return { left: left, top: lbl_y, width: lbl_w, halign: halign, valign: valign };
            }
        },

        getYGridTicks: function() {
            var me = this,
                yscale = me.__scales.y,
                c = me.__canvas,
                ticks = me.getYTicks(yscale, c.h, true),
                customTicks = me.get('custom-ticks'),
                gridVisible = me.gridVisible(),
                domain = me.__domain
        
            if (typeof customTicks !== "undefined" && customTicks !== null && customTicks !== "") {
                ticks = customTicks.split(",");
                ticks.forEach(function (el, i) {
                    ticks[i] = Number(el);
                });
            }

            if (!gridVisible) ticks = [];

            ticks = ticks.filter(function(val, t) {
                return val >= domain[0] && val <= domain[1];
            });

            if (!ticks.length) ticks = [0];

            return ticks;
        },
 
        horzGrid: function(animate, column) {
            // draw tick marks and labels
            var me = this,
                yscale = me.__scales.y,
                c = me.__canvas,
                domain = me.__domain,
                styles = me.__styles,
                theme = me.theme(),
                ticks = me.getYGridTicks(),
                tickLabels = me.__tickLabels = me.__tickLabels || {},
                gridLines = me.__gridLines = me.__gridLines || {},
                position = me.get('grid-labels', 'outside'),
                formatter = me.chart().columnFormatter(column ? column : me.getBarColumn()),
                duration = animate ? theme.duration : 0,
                gridVisible = me.gridVisible(),
                gridLabelPosition = me.gridLabelPosition();


            _.each(ticks, function(val, t) {
                var y = c.h - c.bpad - yscale(val),                     
                    ly = y-(position == "inside" ? 10 : 0),
                    key = String(val);

                if (gridLabelPosition == "left") {
                    if (position == "outside") {
                        align = "right";
                        x = c.lpad + me.__gridLabelSpace - 8;
                    } else {
                        align = "left";
                        x = 0;
                    }
                } else {
                    if (position == "outside") {
                        align = "left";                        
                        x = c.w - me.__gridLabelSpace + 8;
                    } else {
                        align = "right";
                        x = c.w;
                    }
                }

                // show or update label
                if (val !== 0 && position != "hidden") {
                    var lbl = tickLabels[key] = tickLabels[key] ||
                        me.label(x, ly, formatter(val, t == ticks.length-1, false),
                            { align: align,  cl: 'axis y-tick-values chart-text', css: { opacity: 0 } });

                    if (me._isStacked && me._isStacked() && me.is_normalized()) {
                        lbl.text(me.formatValue(val, true));
                    } else {
                        lbl.text(formatter(val, t == ticks.length-1, false));
                    }                    

                    lbl.animate({ x: x, y: ly, css: { opacity: 1 } }, duration, theme.easing);
                }
                if (theme.yTicks) {
                    me.path([['M', c.lpad-25, y], ['L', c.lpad-20,y]], 'tick');
                }
                if (theme.horizontalGrid) {       
                    var x = c.lpad,
                        x2 = c.w - c.rpad;

                    if (gridVisible) {
                        if (position == "outside") {
                            if (gridLabelPosition == "left") {
                                x += me.__gridLabelSpace;
                            } else if (gridLabelPosition == "right") {
                                x2 -= me.__gridLabelSpace;
                            }                            
                        }
                    }                 

                    var lattrs = { path: [['M', x, y], ['L', x2, y]], opacity: 1 },
                        l = gridLines[key] = gridLines[key] || me.path(lattrs.path, 'grid y-gridline');
                    l.toBack();
                    if (val === 0) {
                        l.node.setAttribute("class","grid x-axis");
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
                    l.animate(lattrs, duration * (me.__lastTicks ? 1 : 0.2), theme.easing);
                }
            });
            // hide invisible grid lines
            $.each(gridLines, function(val, line) {
                if (_.indexOf(ticks, +val) < 0) {
                    var y = c.h - c.bpad - yscale(val), props = {};
                    $.extend(props, theme.horizontalGrid, { path: [['M', c.lpad, y], ['L', c.w - c.rpad, y]], opacity: 0 });
                    line.animate(props, duration, theme.easing);
                    if (tickLabels[val]) {
                        var lbl = tickLabels[val];

                        tickLabels[val].animate({
                            x: c.lpad+2,
                            y: y,
                            css: {
                                opacity: 0
                            }
                        }, duration, theme.easing );
                    }
                }
            });

            me.__lastTicks = ticks;
            me.__lastDomain = domain.slice(0);
        },   

        hover: function(hover_key) {
            var me = this,
                cm = this.colorMap(),
                barvalues = me.getBarValues(),
                l = barvalues.length;
 
            _.each(barvalues, function(bar) {
                _.each(me.__labels[bar.name], function(lbl) {
                    if (hover_key !== undefined && bar.name == hover_key) {
                        lbl.addClass('hover');                        
                    } else {
                        lbl.removeClass('hover');                        
                    }
                });
                _.each(me.__elements[bar.name], function(el) {
                    var fill = me.getKeyColor(bar.name, bar.value, me.get('negative-color', false)),
                        stroke;
                    if (hover_key !== undefined && bar.name == hover_key) fill = chroma.color(fill).darken(14).hex();
                    if (el.attrs.fill != fill) el.attr({ fill: cm(fill) });
                });
            });
        },

        unhoverSeries: function() {
            this.hoverSeries();
        },

        gridVisible: function() {
            var me = this;
            return me.get('grid-lines', 'show') == 'show' || me.get('grid-lines', 'show') == true  ? true :
                me.get('grid-lines') == 'hide' || me.get('grid-lines') == 'axis' ? false :
                (me.__canvas.w / me.getBarValues().length) < 50 ||
                me.getBarValues().length > 8 || me.get('value-labels') == 'hide';
        },

    });

}).call(this);
