
(function(){


    dw.visualization.register('pie-chart', 'raphael-chart', {

        isDonut: function() {
            return false;
        },

        getFullArc: function() {
            return TWO_PI;
        },

        groupAfter: function() {
            return 5;
        },

        render: function(el) {
            el = $(el);

            this.setRoot(el);

            var me = this,
                dataset = me.dataset,
                sort = true,
                donut = me.isDonut(),
                row = 0;

            // 2d -> 1d
            if (!_.isUndefined(me.get('selected-row'))) {
                row = me.get('selected-row', 0);
                if (row > dataset.numRows() || row === undefined) row = 0;
            }

            me.axesDef = me.axes();
            if (!me.axesDef) return;

            var sliceColumns = _.map(me.axesDef.slices, function(i) { return dataset.column(i); });
                filter = dw.utils.filter(dw.utils.columnNameColumn(sliceColumns), row),
                filterUI = filter.ui(me);

            if (filterUI) {
                $('#header').append(filterUI);
                filter.change(function(val, i) {
                    me.update(i);
                });
            }

            var c = me.initCanvas({}, 0, filterUI ? filterUI.height()+10 : 0),
                chart_width = c.w,
                chart_height = c.h,
                FA = me.getFullArc(); // full arc

            c.cx = chart_width * 0.5;
            c.cy = chart_height * (FA < TWO_PI ? 0.69 : 0.5); // 1:1 1.5:1
            c.or = Math.min(FA == TWO_PI ? chart_height * 0.5 : chart_height * 0.66, chart_width * 0.5) - 3;
            c.ir = donut ? c.or * 0.3 : 0;
            c.or_sq = c.or * c.or;
            c.ir_sq = c.ir * c.ir;

            me.init();

            $('.tooltip').hide();

            me.__initialRow = row;
            me.update(row);

            // enable mouse events
            el.mousemove(_.bind(me.onMouseMove, me));
            me.renderingComplete();
        },

        /*
         * updates the chart according to the given row
         */
        update: function(row) {
            var me = this,
                dataset = me.dataset,
                groupAfter = me.groupAfter(),
                c = me.__canvas,
                donut = me.isDonut(),
                showTotal = donut && me.get('show-total', false),
                FA = me.getFullArc(),
                slices = me.__slices = me.__slices ? me.__slices : {};

            var column = dataset.column(me.axesDef.slices[row]),
                labels = dataset.column(me.axesDef.labels),
                total = 0, min = Number.MAX_VALUE, max = 0,
                reverse,
                slices,
                others = 0,
                ocnt = 0,
                hasNegativeValues = column.range()[0] < 0,
                values = [],
                fmt = labels.type() == 'date' ? dw.utils.longDateFormat(labels) : _.identity;

            // pull values and labels from columns
            column.each(function(val, i) {
                values.push({
                    name: String(fmt(labels.val(i))),
                    value: val,
                    index: i
                });
            });

            // sort values by first slice column
            if (me.get('sort-values', true)) {
                values.sort(function(a, b) {
                    return dataset.column(me.axesDef.slices[0]).val(b.index) -
                        dataset.column(me.axesDef.slices[0]).val(a.index);
                });
            }

            // now group small series into one big chunk named 'others'
            slices = me.__values = [];
            _.each(values, function(o, i) {
                if (i < groupAfter) slices.push(o);
                else {
                    ocnt += 1;
                    others += o.value;
                }
            });

            if (hasNegativeValues) {
                me.warn('<b>Warning:</b> Pie charts are not suitable for displaying negative values.');
            }

            // add slice 'others' to the slices array
            if (ocnt > 0) {
                slices.push({ name: me.translate('other'), value: others });
            }

            _.each(slices, function(s) {
                total += s.value;
                min = Math.min(min, s.value);
                max = Math.max(max, s.value);
            });
            reverse = min < total / slices.length * 0.66 || max > total/slices.length * 1.5;
            sa = -HALF_PI;
            if (reverse) sa += FA * (slices[0].value / total);

            if (FA < TWO_PI) {
                reverse = false;
                sa = -HALF_PI - FA * 0.5;
            }

            sa = -HALF_PI*0.7;
            reverse = true;

            me.__seriesAngles = {};

            function normalize(a0, a1) {
                a0 += HALF_PI;
                a1 += HALF_PI;
                if (a0 < 0) {
                    a0 += TWO_PI;
                    a1 += TWO_PI;
                }
                return [a0, a1];
            }

            me.__sliceKeys = [];

            _.each(slices, function(o) {

                var da = o.value / total * FA,
                    fill = me.getKeyColor(o.name, 0),
                    stroke = chroma.color(fill).darken(15).hex(),
                    a0 = reverse ? sa - da : sa,
                    a1 = reverse ? sa : sa + da,
                    value = showTotal ? Math.round(o.value / total * 100)+'%' : me.chart.formatValue(o.value, true);

                if (o.value === 0) return;

                me.__sliceKeys.push(o.name);

                if (!slices[o.name]) {
                    var lblcl = me.chart.hasHighlight() && me.chart.isHighlighted(o.name) ? 'series highlighted' : 'series';
                    if (me.invertLabel(fill)) lblcl += ' inverted';

                    var lbl = me.registerLabel(me.label(0, 0, '<b>'+o.name+'</b><br />'+value, {
                        w: 80, cl: lblcl, align: 'center', valign: 'middle'
                    }), o.name);

                    slice = slices[o.name] = Slice(c.paper, c.cx, c.cy, c.or, c.ir, a0, a1, lbl, me.theme);
                    slice.path.attr({
                        'stroke': me.theme.colors.background,
                        'stroke-width': 2,
                        'fill': fill
                    });
                    slice.path.data('slice', slice);
                    me.registerElement(slice.path, o.name);
                } else {
                    slice = slices[o.name];
                    slice.label.text('<b>'+o.name+'</b><br />'+value);
                    slice.animate(c.cx, c.cy, c.or, c.ir, a0, a1, me.theme.duration, me.theme.easing);
                }

                me.__seriesAngles[o.name] = normalize(a0, a1);
                sa += reverse ? -da : da;

            });

            if (showTotal) {
                if (me.get('custom-total')) {
                    total = me.get('custom-total-value', '');
                } else {
                    total = me.chart.formatValue(total, true);
                }
                if (me.__labelTotal) me.__labelTotal.remove();
                me.__labelTotal = me.label(c.cx, c.cy, '<strong>Total:</strong><br />'+total, {
                    w: 50,
                    align: 'center',
                    valign: 'middle'
                });
            }
        },

        getSeriesByPoint: function(x, y) {
            var me = this, c = me.__canvas, a, match;
            x -= c.root.offset().left + c.cx;
            y -= c.root.offset().top + c.cy;
            dist = x*x + y*y;
            if (dist > c.or_sq || dist < c.ir_sq) return false;
            a = Math.atan2(y, x) + HALF_PI;
            if (a < 0) a += TWO_PI;

            _.each(me.__seriesAngles, function(range, sname) {
                if (a >= range[0] && a < range[1]) {
                    match = sname;
                    return false;
                }
            });
            return _.find(me.__values, function(v) { return v.name() == match; });
        },

        getDataRowByPoint: function(x, y) {
            return 0;
        },

        showTooltip: function() {

        },

        hideTooltip: function() {

        },

        hover: function(hovered_key) {
            var me = this,
                bg = chroma.color(me.theme.colors.background);
            _.each(me.__sliceKeys, function(key) {
                _.each(me.__labels[key], function(lbl) {
                    if (hovered_key !== undefined && key == hovered_key) {
                        lbl.addClass('hover');
                    } else {
                        lbl.removeClass('hover');
                    }
                });
                _.each(me.__elements[key], function(el) {
                    var h = !hovered_key || key == hovered_key;
                    el.stop().animate({ opacity: h ? 1 : 0.5 }, 100);
                });
            });
        },

        unhoverSeries: function() {
            this.hoverSeries();
        }

    });

    var TWO_PI = Math.PI * 2, HALF_PI = Math.PI * 0.5;

    var Slice = function(paper, cx, cy, or, ir, startAngle, endAngle, label) {
        var me = {
            cx: cx,
            cy: cy,
            or: or,
            ir: ir,
            startAngle: startAngle,
            endAngle: endAngle
        };

        function arcPath() {
            var cx = me.cx, cy = me.cy, ir = me.ir, or = me.or,
                startAngle = me.startAngle, endAngle = me.endAngle;

            var x0 = cx+Math.cos(startAngle)*ir,
                y0 = cy+Math.sin(startAngle)*ir,
                x1 = cx+Math.cos(endAngle)*ir,
                y1 = cy+Math.sin(endAngle)*ir,
                x2 = cx+Math.cos(endAngle)*or,
                y2 = cy+Math.sin(endAngle)*or,
                x3 = cx+Math.cos(startAngle)*or,
                y3 = cy+Math.sin(startAngle)*or,
                largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

            if (ir > 0)
                return "M"+x0+" "+y0+" A"+ir+","+ir+" 0 "+largeArc+",1 "+x1+","+y1+" L"+x2+" "+y2+" A"+or+","+or+" 0 "+largeArc+",0 "+x3+" "+y3+" Z";
            else
                return "M"+cx+" "+cy+" L"+x2+" "+y2+" A"+or+","+or+" 0 "+largeArc+",0 "+x3+" "+y3+" Z";
        }

        function updateLabelPos() {
            lx = me.cx + Math.cos((me.startAngle + me.endAngle) * 0.5) * me.or * 0.7,
            ly = me.cy + Math.sin((me.startAngle + me.endAngle) * 0.5) * me.or * 0.7;
            label.attr({ x: lx, y: ly });
        }

        var running;
        function frame() {
            path.attr({ path: arcPath() });
            updateLabelPos();
            if (running) requestAnimationFrame(frame);
        }

        var path = paper.path(arcPath());
        updateLabelPos();

        var slice = { path: path, label: label };
        slice.animate = function(cx, cy, or, ir, sa, ea, duration, easing) {
            running = true;
            $(me).animate(
                { cx: cx, cy: cy, or: or, ir: ir, startAngle: sa, endAngle: ea },
                { easing: easing, duration: duration, complete: function() {
                    running = false;
                    frame();
                }
            });
            requestAnimationFrame(frame);
        };
        return slice;
    };

}).call(this);