
(function(){

    dw.visualization.register('stacked-column-chart', 'grouped-column-chart', {

        // some config
        _showValueLabels: function() { return false; },

        _isStacked: function() { return true; },

        /*
         * returns a modified version of the original columns
         * that contains stacked numbers
         */
        getBarColumns: function(sortBars, reverse) {
            var me = this,
                stackedColumns = [],
                normalize = me.is_normalized(),
                columns = me._getBarColumns(sortBars, reverse),
                sortByFirst = me.get('sort-by') != 'last';

            _.each(columns, function(column) {
                var normValues;
                if (normalize) {
                    normValues = [];
                    column.each(function(val) {
                        normValues.push(val / column.total());
                    });
                    stackedColumns.push(dw.column(column.name(), normValues).title(column.title()));
                } else {
                    stackedColumns.push(column);
                }
            });
            if (normalize && sortBars) {
                // sort agains
                stackedColumns = stackedColumns.sort(function(a, b) {
                    var aType = a.type(true),
                        bType = b.type(true),
                        r = sortByFirst ? 0 : a.length-1,
                        a_val = aType.toNum ? aType.toNum(a.val(r)) : a.val(r),
                        b_val = bType.toNum ? bType.toNum(b.val(r)) : b.val(r);
                    return a_val > b_val ? 1 : a_val < b_val ? -1 : 0;
                });
            }
            return stackedColumns;
        },

        getDomain: function() {
            var me = this,
                normalize = me.is_normalized(),
                dMin = 0, dMax = 0,
                customRange = me.get("custom-range");

            _.each(me._getBarColumns(), function(column) {
                if (normalize) {
                    dMin = 0;
                    dMax = 1;
                } else {
                    dMin = Math.min(dMin, column.range()[0]);
                    dMax = Math.max(dMax, column.total());
                }
            });

            var domain = [dMin, dMax];

            if (customRange && typeof customRange[0] !== "undefined" && customRange[0] !== null && customRange[0] !== "") {
                domain[0] = customRange[0];
            }

            if (customRange && typeof customRange[1] !== "undefined" && customRange[1] !== null && customRange[1] !== "") {
                domain[1] = customRange[1];
            }

            if (domain[0] > 0) domain[0] = 0;
            if (domain[1] < 0) domain[1] = 0;

            return normalize ? [0, 1] : domain;
        },

        initDimensions: function(r) {
            var me = this, 
                c = me.__canvas;
                
            me.__domain = me.getDomain();
            me.__scales = {
                y: d3.scale.linear().domain(me.__domain)
            };

            var lh = me.useDirectLabeling() ? 0 : ($('.legend div:last').offset().top - $('.legend div:first').offset().top),
                svg = $(me._svgCanvas()),
                ch = $(svg.parent());

            $(svg).height($(svg).height());
            $(ch).height($(ch).height());

            // -- substract a few pixel to get space for the legend!
            me.__scales.y.rangeRound([0, c.h - c.bpad - c.tpad - (!me.useDirectLabeling() ? (lh + 10) : 0)]);
            return;
        },

        outerPadding: function() {
            return 20;
        },

        barAndLabelWidth: function() {
            var me = this,
                c = me.__canvas,
                n = me.axesDef.columns.length,
                pad = me.get("padding", 30) / 100,
                gridLabelSpace = me.gridLabelSpace(),
                cw = c.w - c.lpad - c.rpad - gridLabelSpace - me.outerPadding() / 2;

            return {
                barWidth: cw / (n + (n-1) * pad),
                labelWidth: cw / n
            };            
        },

        barDimensions: function(column, s, r) {
            var me = this,
                sc = me.__scales,
                yo = me.__yoffset || 0,
                c = me.__canvas,
                n = me.axesDef.columns.length,
                w, h, x, y, i, cw, bw,
                bw = me.barWidth(),
                barLabelWidth = me.barLabelWidth(),
                gridLabelSpace = me.gridLabelSpace(),
                gridLabelPosition = me.gridLabelPosition();         
            
            if (r === 0) yo = 0;
            w = bw;

            if (sc && sc.y) {
                h = sc.y(column.val(r)) - sc.y(0);
                if (h >= 0) {
                    y = c.h - c.bpad - sc.y(0) - h;
                } else {
                    y = c.h - c.bpad - sc.y(0);
                    h *= -1;
                }
                y = y - yo;
                me.__yoffset = yo + h;
            }

            var leftPad = c.lpad + me.outerPadding() / 2 + (gridLabelPosition == "left" ? gridLabelSpace : 0),
                otherBars = s * barLabelWidth;

            x = Math.round(leftPad + otherBars);  

            return { w: w, h: h, x: x, y: y, bx: x + w/2, bw: bw, tw: barLabelWidth };
        },

        formatValue: function() {
            var me = this,
                formatter = me.chart().columnFormatter(me.axes(true).columns[0]);
            // we're overwriting this function with the actual column formatter
            // when it is first called (lazy evaluation)
            me.formatValue = function(v, b, c) {
                return me.is_normalized() ? Math.round(v * 100)+'%' : formatter(v,b,c);
            };
            return me.formatValue.apply(me, arguments);
        },

        is_normalized: function() {
            var me = this;
            return me.get('normalize', false);
        },

        checkData: function() {
            var me = this, ds = me.dataset, allPositive = true;
            _.each(me.getBarColumns(), function(column) {
                column.each(function(val) {
                    if (val < 0) {
                        allPositive = false;
                        return false;
                    }
                });
                if (!allPositive) return false;
            });
            if (!allPositive) {
                me.notify(me.translate('cannotShowNegativeValues'));
            }
        }

    });

}).call(this);
