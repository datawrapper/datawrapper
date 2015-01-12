
(function(){

    var MAX_LABEL_WIDTH = 160;

    dw.visualization.register('bar-chart', 'raphael-chart', {

        render: function(el) {
            this.setRoot(el);

            var me = this, row = 0,
                dataset = me.dataset,
                sortBars = me.get('sort-values', false),
                reverse = me.get('reverse-order');
                // useNegativeColor = me.get('negative-color', false),
                // filterMissing = me.get('filter-missing-values', true);

            me.axesDef = me.axes();
            if (!me.axesDef) return;  // stop rendering here

            if (!_.isUndefined(me.get('selected-row'))) {
                row = me.get('selected-row', 0);
                row = row > me.axesDef.bars.length ? 0 : row;
            }
            me.__lastRow = row;
            if (!me.getBarColumn()) return;

            var sliceColumns = _.map(me.axesDef.bars, function(i) { return dataset.column(i); }),
                filter = dw.utils.filter(dw.utils.columnNameColumn(sliceColumns), row),
                filterUI = filter.ui(me);

            if (filterUI) {
                $('#header').append(filterUI);
                filter.change(function(val, i) {
                    me.__lastRow = i;
                    me.update(i);
                });
            }

            var frameHeight = dw.utils.getMaxChartHeight(el)-5,
                chartHeight = 18 * 1.35 * me.getMaxNumberOfBars() + 5;
                c = me.initCanvas({ h: Math.max(frameHeight, chartHeight) });

            // only do this if in iframe
            $('body.chart').css('overflow-y', frameHeight > chartHeight ? 'hidden' : 'visible');

            var barvalues = me.getBarValues(sortBars, reverse);

            me.init();
            me.initDimensions();

            $('.tooltip').hide();

            c.lastBarY = 0;

            var barGroups = _.groupBy(barvalues, function(bar, i) {
                bar.__i = i;
                return Math.floor(i/10);
            });

            var render = me.renderBar(row);

            _.each(barGroups, function(bars) {
                // defer rendering if we got plenty of bars
                // to prevent UI blocking
                _.defer(function() {
                    _.each(bars, function(bar, i) {
                        render(bar, bar.__i);
                    });
                    complete();
                });
            });

            // complete is called as soon all bars are rendered
            function complete() {
                if (me.__domain[0] < 0) {
                    var x = c.lpad + c.zero ;
                    // add y-axis
                    me.__yaxis = me.path('M' + [x, c.tpad] + 'V' + c.lastBarY, 'axis')
                        .attr(me.theme().yAxis);
                }
                // enable mouse events
                el.mousemove(_.bind(me.onMouseMove, me));
                me.renderingComplete();
            }
        },

        renderBar: function(row) {
            var me = this, c = me.__canvas,
                formatValue = me.chart().columnFormatter(me.getBarColumn());
            return function(barv, s) {
                var d = me.barDimensions(barv, s, row),
                    lpos = me.labelPosition(barv, s, row),
                    fill = me.getKeyColor(barv.name, barv.value, me.get('negative-color', false)),
                    stroke = chroma.color(fill).darken(14).hex();

                // draw bar
                var bar = me.registerElement(c.paper.rect(d.x, d.y, d.width, d.height).attr({
                    'stroke': stroke,
                    'fill': fill
                }).data('strokeCol', stroke), barv.name);
                if (me.theme().barChart.barAttrs) {
                    bar.attr(me.theme().barChart.barAttrs);
                }

                if (lpos.show_val) {
                    me.registerLabel(me.label(lpos.val_x, lpos.top, formatValue(barv.value, true),{
                        // w: 40,
                        align: lpos.val_align,
                        cl: 'value' + lpos.lblClass
                    }), barv.name);
                }

                if (lpos.show_lbl) {
                    me.registerLabel(me.label(lpos.lbl_x , lpos.top, barv.name, {
                        w: Math.min(me.labelWidth(barv.name, 'series')+20, MAX_LABEL_WIDTH),
                        align: lpos.lbl_align,
                        valign: 'middle',
                        cl: 'series' + lpos.lblClass
                    }), barv.name, me.axes().labels, barv.row);
                }

                c.lastBarY = Math.max(c.lastBarY, d.y + d.height);
            };
        },

        getBarValues: function(sortBars, reverse, forceAll) {
            var me = this,
                values = [],
                filter = me.__lastRow,
                labels = me.axes(true).labels,
                column = me.getBarColumn(filter),
                filterMissing = !forceAll && me.get('filter-missing-values', true),
                fmt = me.chart().columnFormatter(labels);

            column.each(function(val, i) {
                if (filterMissing && typeof val != 'number') return;
                values.push({
                    name: fmt(labels.val(i)),
                    value: val,
                    row: i
                });
            });
            if (sortBars) values.sort(function(a,b) { return (isNaN(b.value) ? 0 : b.value) - (isNaN(a.value) ? 0 : a.value); });
            if (reverse) values.reverse();
            return values;
        },

        getBarColumn: function() {
            var me = this,
                filter = me.__lastRow;
            if (_.isUndefined(filter)) throw 'filter must not be undefined';
            return me.axes(true).bars[filter];
        },

        getMaxNumberOfBars: function() {
            var me = this,
                filterMissing = me.get('filter-missing-values', true),
                bars = me.axes(true).bars,
                maxNum = 0;
            if (!filterMissing) maxNum = bars[0].length;
            else {
                _.each(bars, function(bar) {
                    var notNaN = 0;
                    bar.each(function(val) {
                        if (typeof val == 'number') notNaN++;
                    });
                    maxNum = Math.max(maxNum, notNaN);
                });
            }
            return maxNum;
        },

        update: function(row) {
            var me = this,
                formatValue = me.chart().columnFormatter(me.getBarColumn());

            // update scales
            me.initDimensions();

            // tag for hiding
            _.each(me.__elements, function(elements) {
                elements.__hide = true;
            });

            var render = me.renderBar(row);

            // update bar heights and labels
            _.each(me.getBarValues(me.get('sort-values', false), me.get('reverse-order')), function(bar, s) {

                // don't hide this element because we have data for it
                if (me.__elements[bar.name]) me.__elements[bar.name].__hide = false;

                // register new element if it does not exists yet
                if (!me.__elements[bar.name]) {
                    render(bar, s);
                }

                _.each(me.__elements[bar.name], function(rect) {
                    var dim = me.barDimensions(bar, s, row);
                    dim.fill = me.getKeyColor(bar.name, bar.value, me.get('negative-color', false));
                    dim.stroke = chroma.color(dim.fill).darken(14).hex();
                    rect.animate(dim, me.theme().duration, me.theme().easing);
                });

                _.each(me.__labels[bar.name], function(lbl) {
                    var pos = me.labelPosition(bar, s, row), lpos;
                    if (lbl.hasClass('value')) {
                        // update value
                        lbl.text(formatValue(bar.value, true));
                        lpos = { halign: pos.val_align, left: pos.val_x, top: pos.top };
                    } else if (lbl.hasClass('series')) {
                        // update series label position
                        lpos = { halign: pos.lbl_align, left: pos.lbl_x, top: pos.top };
                    }
                    if (lpos) {
                        lbl.animate({
                            align: lpos.halign,
                            x: lpos.left,
                            y: lpos.top
                        }, me.theme().duration, me.theme().easing);
                    }
                });
            });
            if (me.__domain[0] < 0) {
                var c = me.__canvas,
                    x = c.lpad + c.zero,
                    p = 'M' + [x, c.tpad] + 'V' + c.lastBarY;
                // add y-axis
                if (me.__yaxis) {
                    me.__yaxis.animate({ path: p, opacity: 1 }, me.theme().duration, me.theme().easing);
                } else {
                    me.__yaxis = me.path(p, 'axis').attr(me.theme().yAxis);
                }
            } else if (me.__yaxis) {
                me.__yaxis.animate({ opacity: 0 }, me.theme().duration * 0.5, me.theme().easing);
            }

            // hide elements and labels that are marked for hiding
            _.each(me.__elements, function(elements, k) {
                if (elements.__hide) {
                    _.each(elements, function(el) { if (el && el.hide) el.hide(); });
                    _.each(me.__labels[k], function(el) { if (el && el.hide) el.hide(); });
                } else {
                   _.each(elements, function(el) { if (el && el.show) el.show(); });
                    _.each(me.__labels[k], function(el) { if (el && el.show) el.show(); });
                }
            });
        },

        initDimensions: function() {
            //
            var me = this, c = me.__canvas,
                w = c.w - c.lpad - c.rpad - 30,
                column = me.getBarColumn(),
                bars = me.getBarValues(false, false, true),
                formatValue = me.chart().columnFormatter(column),
                domain = me.get('absolute-scale', false) ?
                    dw.utils.minMax(_.map(me.axesDef.bars, function(c) { return me.dataset.column(c); })) :
                    column.range();

            if (domain[0] > 0) domain[0] = 0;
            if (domain[1] < 0) domain[1] = 0;

            me.__domain = domain;
            me.__scales = {
                y: d3.scale.linear().domain(domain)
            };
            /* how maxw works:
             *
             * maxw[0] .. max series name label width      \
             * maxw[1] .. max formatted value label width   } positive
             * largestVal[0] .. max absolute value         /
             * maxw[2] .. max series name label width      \
             * maxw[3] .. max formatted value label width   } negative
             * largestVal[1] .. max absolute value         /
             */
            var maxw = [0, 0, 0, 0], ratio, largestVal = [0, 0], lw;
            _.each(bars, function(bar) {
                if (isNaN(bar.value)) return;
                var neg = bar.value < 0;
                largestVal[neg ? 1 : 0] = Math.max(largestVal[neg ? 1 : 0], Math.abs(bar.value));
            });
            me.__longLabels = false;
            // instead of measuring all bars (slow!) we just
            // look at a random sample of 50 bars
            _.each(_.first(bars, 50), function(bar) {
                if (isNaN(bar.value)) return;
                var neg = bar.value < 0,
                    t = neg ? 2 : 0,
                    bw;
                bw = Math.abs(bar.value) / (largestVal[0] + largestVal[1]) * w;
                lw = me.labelWidth(bar.name, 'series');
                if (lw > MAX_LABEL_WIDTH) me.__longLabels = true;
                maxw[t] = Math.max(maxw[t], Math.min(lw, MAX_LABEL_WIDTH) + 20);
                maxw[t+1] = Math.max(maxw[t+1], me.labelWidth(me.chart().formatValue(bar.value, true), 'value') + 20 + bw);
            });

            c.left = 0;
            c.right = 0;
            c.zero = largestVal[1] / (largestVal[0] + largestVal[1]) * w;

            var maxNegBar = c.zero;
            c.left = Math.max(maxw[0], maxw[3]) - c.zero;
            c.right = Math.max(maxw[1], maxw[2]) - (w - c.zero); // Math.max((maxw[2] + maxw[1]) - (w - c.zero), 0);
            w -= c.left + c.right;
            c.zero = c.left + largestVal[1] / (largestVal[0] + largestVal[1]) * w;

            c.maxSeriesLabelWidth = [maxw[0], maxw[2]];
            c.maxValueLabelWidth = [maxw[1], maxw[3]];

            me.__scales.y.rangeRound([c.lpad, w]);
        },

        barDimensions: function(bar, s, r) {
            var me = this, w, h, x, y, i, cw, n = me.getMaxNumberOfBars(),
                sc = me.__scales, c = me.__canvas, bw, pad = 0.35, vspace = 0.1,
                val = bar.value;

            if (isNaN(val)) val = 0;
            //
            cw = c.h - c.bpad - c.tpad;
            //
            bw = 18; //Math.max(18, Math.min(23, cw / (n + (n-1) * pad)));
            w = sc.y(val) - sc.y(0);
            h = bw;
            if (w > 0) {
                x = c.lpad + c.zero;
            } else {
                x = c.lpad + c.zero + w;
                w *= -1;
            }
            if (val !== 0) w = Math.max(1, w);
            y = Math.round(c.tpad + s * (bw + bw * pad));
            return { width: w, height: h, x: x, y: y };
        },

        labelPosition: function(bar, s, r) {
            var me = this,
                d = me.barDimensions(bar, s, r),
                formatValue = me.chart().columnFormatter(me.getBarColumn()),
                c = me.__canvas,
                val = bar.value,
                lbl_left = val >= 0 || isNaN(val),
                lbl_x = lbl_left ? c.zero - 10 : c.zero + 10,
                lbl_align = lbl_left ? 'right' : 'left',
                val_x = lbl_left ?
                    d.x + d.width + 10
                    : d.x - 10,
                val_align = lbl_left ? 'left' : 'right',
                show_lbl = true,
                show_val = true,
                lblClass = me.chart().hasHighlight() && me.chart().isHighlighted(bar) ? ' highlighted' : '';

            if (me.__longLabels && me.__domain[0] >= 0) {
                lbl_align = lbl_left ? 'left' : 'right';
                lbl_x = c.lpad;
            }

            return { lblClass: lblClass, val_align: val_align, show_lbl: show_lbl,
                show_val: show_val, lbl_align: lbl_align, lbl_x: lbl_x, val_x: val_x,
                top: d.y + d.height * 0.5 };
        },

        getDataRowByPoint: function(x, y) {
            return 0;
        },

        showTooltip: function() {

        },

        hideTooltip: function() {

        },

        hover: function(hover_key) {
            var me = this,
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
                if (l > 50) return; // no color animation for big data
                _.each(me.__elements[bar.name], function(el) {
                    var fill = me.getKeyColor(bar.name, bar.value, me.get('negative-color', false)), stroke;
                    if (hover_key !== undefined && bar.name == hover_key) fill = chroma.color(fill).darken(14).hex();
                    stroke = chroma.color(fill).darken(14).hex();
                    if (el.attrs.fill != fill || el.attrs.stroke != stroke)
                        el.animate({ fill: fill, stroke: stroke }, 50);
                });
            });
        },

        unhoverSeries: function() {
            this.hoverSeries();
        }

    });


}).call(this);
