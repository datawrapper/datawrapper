
(function(){

    // Simple perfect line chart
    // -------------------------

    var LineChart = Datawrapper.Visualizations.LineChart = function() {};

    _.extend(LineChart.prototype, Datawrapper.Visualizations.Base, {

        render: function(el) {
            el = $(el);
            el.css({
                position: 'relative'
            });
            var
            me = this,
            ds = me.dataset,
            scales = me.__scales = {
                x: me.xScale(),
                y: me.yScale()
            },
            c = me.__canvas = {
                root: el,
                w: el.width(),
                h: me.chart.get('metadata.visualize.force-banking') ?
                    el.width() / me.computeAspectRatio() : me.getMaxChartHeight(el),
                rpad: me.chart.dataColumns().length > 1 ? 120 : 50,
                lpad: me.theme.leftPadding,
                bpad: me.theme.bottomPadding,
                tpad: 0
            };

            scales.x = scales.x.range([c.lpad, c.w-c.rpad]);
            scales.y = scales.y.range([c.h-c.bpad, 2]);

            c.paper = Raphael(el[0], c.w, c.h+2);

            el.height(c.h);
            // init canvas

            me.yAxis();

            // draw lines
            _.each(me.chart.dataColumns(), function(col) {
                var path = [], x, y;
                _.each(col.data, function(val, i) {
                    x = scales.x(i);
                    y = scales.y(val);
                    path.push([path.length> 0 ? 'L' : 'M', x, y]);
                });
                c.paper.path(path).attr({
                    'stroke-width': 3,
                    'stroke-linecap': 'round',
                    'stroke-linejoin': 'round',
                    'stroke-opacity': 1,
                    'stroke': me.theme.colors.line
                });
                if (me.chart.dataColumns().length > 1 && me.chart.dataColumns().length < 10)
                    me.label(x+15, y, col.name);
            });


            // draw x scale labels
            if (me.chart.hasRowHeader()) {
                var last_label_x = -100, min_label_distance = 50;
                _.each(ds.column(ds.columnNames()[0]).data, function(val, i) {
                    var x = scales.x(i), y = c.h-c.bpad+me.theme.xLabelOffset;
                    if (x - last_label_x < min_label_distance) return;
                    last_label_x = x;
                    me.label(x, y, val, 'center');
                });
            }
            window.ds = me.dataset;
            window.vis = me;
        },

        computeAspectRatio: function() {
            var me = this, slopes = [], M, Rx, Ry;
            _.each(me.chart.dataColumns(), function(col) {
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

        xScale: function() {
            return d3.scale.linear().domain([0, this.dataset.length-1]);
        },

        yScale: function() {
            var me = this, scale,
            // find min/max value of each data series
            domain = [Number.MAX_VALUE, Number.MAX_VALUE * -1];
            _.each(me.chart.dataColumns(), function(col) {
                domain[0] = Math.min(domain[0], col._min());
                domain[1] = Math.max(domain[1], col._max());
            });
            me.__domain = domain;
            if (me.chart.get('metadata.visualize.baseline') == 'zero') {
                domain[0] = 0;
            }
            scale = me.chart.get('metadata.visualize.scale') || 'linear';
            if (scale == 'log' && domain[0] === 0) domain[0] = 0.03;
            return d3.scale[scale]().domain(domain);
        },

        yAxis: function() {
            // draw tick marks and labels
            var yscale = this.__scales.y,
                me = this,
                c = this.__canvas,
                domain = this.__domain,
                styles = this.__styles,
                ticks = yscale.ticks(c.h/50),
                bt = yscale(ticks[0]),
                tt = yscale(ticks[ticks.length-1]);

            if (Math.abs(yscale(domain[0]) - bt) < 30) ticks.shift();
            if (Math.abs(tt - yscale(domain[1])) < 30) ticks.pop();

            ticks.unshift(domain[0]);
            ticks.push(domain[1]);

            _.each(ticks, function(val) {
                var y = yscale(val), x = c.lpad-me.theme.yLabelOffset;
                if (val >= domain[0] && val <= domain[1]) {
                    // c.paper.text(x, y, val).attr(styles.labels).attr({ 'text-anchor': 'end' });
                    me.label(x, y, val, 'right', 60);
                    if (me.theme.yTicks) {
                        me.path([['M', c.lpad-25, y], ['L', c.lpad-20,y]], 'tick');
                    }
                    if (me.theme.horizontalGrid) {
                        me.path([['M', c.lpad, y], ['L', c.w - c.rpad,y]], 'grid')
                            .attr(me.theme.horizontalGrid);
                    }
                }
            });
            // draw axis line

            if (me.theme.yAxis) {
                this.path([
                    ['M', c.lpad-20, yscale(domain[0])],
                    ['L', c.lpad-20, yscale(domain[1])]
                ], 'axis').attr(me.theme.yAxis);
            }
        },

        path: function(path, className) {
            var p = this.__canvas.paper.path(path);
            if (className && Raphael.svg) {
                $(p.node).attr('class', className);
            }
            return p;
        },

        label: function(x, y, txt, align, w, h) {
            var l = $('<div class="label">'+txt+'</span>');
            w = w ? w : 80;
            align = align ? align : 'left';
            x = align == 'left' ? x : align == 'center' ? x - w * 0.5 : x - w;
            l.css({
                position: 'absolute',
                left: x+'px',
                width: w+'px',
                'text-align': align
            });
            this.__canvas.root.append(l);
            h = h ? h : l.height();
            l.css({
                top: (y-h*0.5)+'px'
            });
        }
    });

}).call(this);