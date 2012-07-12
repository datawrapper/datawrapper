(function(){

    // Base class for Raphael charts
    // -----------------------------

    var RaphaelChart = Datawrapper.Visualizations.RaphaelChart = function() {};

    _.extend(RaphaelChart.prototype, Datawrapper.Visualizations.Base, {

        init: function() {
            this.__seriesElements = {};
            this.__seriesLabels = {};

            $('body').append('<div id="tooltip" class="tooltip"><div class="content"><span class="yval"></span></div></div>');
        },

        setRoot: function(el) {
            this.__root = el;
            el.css({
                position: 'relative'
            });
        },

        initCanvas: function(canvas) {
            var me = this, el = me.__root, w = $(document).width();
            canvas = _.extend({
                w: w,
                h: me.getMaxChartHeight(el),
                rpad: me.theme.padding.right,
                lpad: me.theme.padding.left,
                bpad: me.theme.padding.bottom,
                tpad: me.theme.padding.top
            }, canvas);
            canvas.root = el;
            canvas.paper = Raphael(el[0], canvas.w, canvas.h+2);
            //console.log(w, w-canvas.lpad-canvas.rpad);
            //canvas.paper.rect(canvas.lpad, canvas.tpad, canvas.w - canvas.lpad - canvas.rpad, canvas.h - canvas.tpad - canvas.bpad);
            el.height(canvas.h);
            $('.tooltip').hide();
            me.__canvas = canvas;
            return canvas;
        },

        onMouseMove: function(e) {
            var me = this,
                x = e.pageX,
                y = e.pageY,
                series = this.getSeriesByPoint(x, y),
                row = this.getDataRowByPoint(x, y);

            if (!series) {
                // nothing hovered
                if (me.theme.hover) me.hoverSeries();
                if (me.theme.tooltip) me.hideTooltip();
            } else {
                if (me.theme.hover) me.hoverSeries(series);
                if (me.theme.tooltip) me.showTooltip(series, row, x, y);
            }
        },

        registerSeriesElement: function(el, series) {
            el.data('series', series);
            if (!this.__seriesElements[series.name]) {
                this.__seriesElements[series.name] = [];
            }
            this.__seriesElements[series.name].push(el);
        },

        registerSeriesLabel: function(lbl, series) {
            lbl.data('series', series);
            if (!this.__seriesLabels[series.name]) {
                this.__seriesLabels[series.name] = [];
            }
            this.__seriesLabels[series.name].push(lbl);
        },

        hoverSeries: function(series) {
            var seriesElements = this.__seriesElements;
            _.each(seriesElements, function(elements, key) {
                var h = !series || key == series.name;
                _.each(elements, function(el) {
                    el.attr({ opacity: h ? 1 : 0.1 });
                });
            });

            var seriesLabels = this.__seriesLabels;
            _.each(seriesLabels, function(labels, key) {
                var h = !series || key == series.name;
                _.each(labels, function(lbl) {
                    lbl.css({ opacity: h ? 1 : 0.1 });
                    if (h) lbl.addClass('highlighted');
                });
            });
        },

        path: function(pathdata, className) {
            var p = this.__canvas.paper.path(pathdata);
            if (className && Raphael.svg) {
                $(p.node).attr('class', className);
            }
            return p;
        },

        label: function(x, y, txt, attrs) {
            var l, w, align, h;
            l = $('<div class="label'+(attrs.cl ? ' '+attrs.cl : '')+'"><span>'+txt+'</span></div>');
            w = attrs.w ? attrs.w : this.labelWidth(txt, attrs.cl);
            align = attrs.align ? attrs.align : 'left';
            x = align == 'left' ? x : align == 'center' ? x - w * 0.5 : x - w;
            l.css({
                position: 'absolute',
                left: x+'px',
                'text-align': align
            });
            if (attrs.w) {
                l.css({ width: w+'px' });
            }
            this.__canvas.root.append(l);
            h = attrs.h ? attrs.h : l.height();
            l.css({
                top: (y-h*0.5)+'px'
            });
            return l;
        },

        labelWidth: function(txt, className) {
            // returns the width of a label
            var l = $('<div class="label'+(className ? ' '+className : '')+'"><span>'+txt+'</span></div>');
            this.__root.append(l);
            var w = $('span', l).width();
            l.remove();
            return w;
        },

        orderSeriesElements: function() {
            // put highlighted lines on top
            var me = this;
            _.each(me.chart.dataSeries(), function(series) {
                if (me.chart.isHighlighted(series)) {
                    _.each(me.__seriesElements[series.name], function(el) {
                        el.toFront();
                    });
                }
            });
        },

        getSeriesByPoint: function(x, y) {
            var el = this.__canvas.paper.getElementByPoint(x, y);
            return el && el.data('series') ? el.data('series') : null;
        },

        getDataRowByPoint: function(x, y) {
            // needs to be implemented by each visualization
            throw 'getDataRowByPoint() needs to be implemented by each visualization';
        },

        getSeriesColor: function(series) {
             return this.theme.colors[this.chart.isHighlighted(series) ? 'focus' : 'context'];
        }

    });

}).call(this);