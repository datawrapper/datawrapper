
(function(){

    // ABZV Theme
    // ----------

    // Every theme will inherit the properties of this
    // theme. They can override everything or just a bit
    // of them. Also, every theme can extend any other
    // existing theme.

    var LineChart = Datawrapper.Visualizations.LineChart = function() {

    };

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
                    el.width() / me.computeAspectRatio() : 330,
                rpad: 120,
                lpad: 70,
                bpad: 50,
                tpad: 10
            },
            styles = me.__styles = {
                labels: {
                    'text-anchor': 'start',
                    'font-family': 'Ubuntu',
                    'font-size': 12,
                    'font-weight': 400
                }
            };

            scales.x = scales.x.range([c.lpad, c.w-c.rpad]);
            scales.y = scales.y.range([c.h-c.bpad, c.tpad]);

            c.paper = Raphael(el[0], c.w, c.h);

            el.height(c.h+10);
            // init canvas

            // draw lines
            _.each(me.dataColumns(), function(col) {
                var path = [], x, y;
                _.each(col.data, function(val, i) {
                    x = scales.x(i);
                    y = scales.y(val);
                    path.push([path.length> 0 ? 'L' : 'M', x, y]);
                });
                c.paper.path(path).attr({
                    'stroke-width': 3,
                    'stroke-linecap': 'round',
                    'stroke-opacity': 1,
                    'stroke': '#0063A5'
                });
                me.label(x+15, y, col.name);
            });

            me.yaxis();

            // draw x scale labels
            if (me.hasRowHeader()) {
                _.each(ds.column(ds.columnNames()[0]).data, function(val, i) {
                    var x = scales.x(i), y = c.h-10;
                    me.label(x, y, val, 'center');
                });
            }
            window.ds = me.dataset;
            window.vis = me;
        },

        computeAspectRatio: function() {
            var me = this, slopes = [], M, Rx, Ry;
            _.each(me.dataColumns(), function(col) {
                var lval;
                _.each(col.data, function(val, i) {
                    if (i > 0) {
                        slopes.push(Math.abs(val-lval));
                    }
                    lval = val;
                });
            });
            console.log(slopes);
            M = d3.median(slopes);
            Rx = me.dataset.length * me.dataColumns().length;
            Ry = me.__domain[1] - me.__domain[0];
            console.log(M, Rx, Ry, M*Rx/Ry);
            return M*Rx/Ry;
        },

        xScale: function() {
            return d3.scale.linear().domain([0, this.dataset.length-1]);
        },

        yScale: function() {
            var me = this, scale,
            // find min/max value of each data series
            domain = [Number.MAX_VALUE, Number.MAX_VALUE * -1];
            _.each(me.dataColumns(), function(col) {
                domain[0] = Math.min(domain[0], col._min());
                domain[1] = Math.max(domain[1], col._max());
            });
            me.__domain = domain;
            if (me.chart.get('metadata.visualize.baseline') == 'zero') {
                domain[0] = 0;
            }
            scale = me.chart.get('metadata.visualize.scale') || 'linear';
            return d3.scale[scale]().domain(domain);
        },

        yaxis: function() {
            // draw tick marks and labels
            var yscale = this.__scales.y,
                me = this,
                c = this.__canvas,
                domain = this.__domain,
                styles = this.__styles,
                ticks = yscale.ticks(10),
                bt = yscale(ticks[0]),
                tt = yscale(ticks[ticks.length-1]);

            if (Math.abs(yscale(domain[0]) - yscale(bt)) < 30) ticks.shift();
            if (Math.abs(yscale(tt) - yscale(domain[0])) < 30) ticks.pop();

            ticks.unshift(domain[0]);
            ticks.push(domain[1]);

            _.each(ticks, function(val) {
                var y = yscale(val), x = c.lpad-30;
                if (val >= domain[0] && val <= domain[1]) {
                    // c.paper.text(x, y, val).attr(styles.labels).attr({ 'text-anchor': 'end' });
                    me.label(x, y, val, 'right', 60);
                    me.path([['M', c.lpad-25, y], ['L', c.lpad-20,y]], 'axis');
                }
            });
            // draw axis line

            this.path([
                ['M', c.lpad-20, yscale(domain[0])],
                ['L', c.lpad-20, yscale(domain[1])]
            ], 'axis');
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