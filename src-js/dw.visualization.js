(function(){

    // Datawrapper.Visualization.Base
    // ------------------------------

    // Every visualization should extend this class.
    // It provides the basic API between the chart template
    // page and the visualization class.

    Datawrapper.Visualizations = {
        Base: (function() {}).prototype
    };

    _.extend(Datawrapper.Visualizations.Base, {

        render: function(el) {
            $(el).html('implement me!');
        },

        setTheme: function(theme) {
            if (!theme) return this;
            this.theme = theme;
            var attr_properties = ['horizontalGrid', 'verticalGrid', 'yAxis', 'xAxis'];
            _.each(attr_properties, function(prop) {
                // convert camel-case to dashes
                if (theme.hasOwnProperty(prop)) {
                    for (var key in theme[prop]) {
                        // dasherize
                        var lkey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
                        if (!theme[prop].hasOwnProperty(lkey)) {
                            theme[prop][lkey] = theme[prop][key];
                        }
                    }
                }
            });
            return this;
        },

        setSize: function(width, height) {
            var me = this;
            me.__w = width;
            me.__h = height;
            return me;
        },

        /**
         * short-cut for this.chart.get('metadata.visualize.*')
         */
        get: function(str, _default) {
            return this.chart.get('metadata.visualize.'+str, _default);
        },

        warn: function(str) {
            var warning = $('<div>' + str + '</div>');
            warning.css({
                'background-color': '#FCF8E3',
                'border': '1px solid #FBEED5',
                'border-radius': '4px 4px 4px 4px',
                'color': '#a07833',
                'margin-bottom': '18px',
                'padding': '8px 35px 8px 14px',
                'text-shadow': '0 1px 0 rgba(255, 255, 255, 0.5)',
                'left': '10%',
                'right': '10%',
                'z-index': 1000,
                'text-align': 'center',
                position: 'absolute'
            });
            $('body').prepend(warning);
            warning.hide();
            warning.fadeIn();
        },

        /**
         * returns a signature for this visualization which will be used
         * to test correct rendering of the chart in different browsers.
         * See raphael-chart.js for example implementation.
         */
        signature: function() {
            // nothing here, please overload
        },

        translate: function(str) {
            var locale = this.meta.locale, lang = this.lang;
            return locale[str] ? locale[str][lang] || locale[str] : str;
        },

        checkBrowserCompatibility: function(){
            return true;
        },

        setChart: function(chart) {
            var me = this;
            me.dataset = chart.dataset();
            me.setTheme(chart.theme());
            me.chart = chart;
            me.dataset.filterSeries(chart.get('metadata.data.ignore-columns', {}));
        },

        axes: function(returnAsColumns) {
            var me = this,
                dataset = me.dataset,
                usedColumns = {},
                defAxes = {},
                errors = [];
            _.each(me.meta.axes, function(axisDef, key) {
                function checkColumn(col) {
                    return !usedColumns[col.name()] &&
                        _.indexOf(axisDef.accepts, col.type()) >= 0;
                }
                if (!axisDef.optional) {
                    if (!axisDef.multiple) {
                        // find first colulmn accepted by axis
                        var c = _.find(dataset.columns(), checkColumn);
                        if (c) {
                            usedColumns[c.name()] = true; // mark column as used
                            defAxes[key] = c.name();
                        } else {
                            errors.push('Error: Could not populate axis <b>'+key+'</b> a data column of the type '+axisDef.accepts);
                        }
                    } else {
                        defAxes[key] = [];
                        dataset.eachColumn(function(c) {
                            if (checkColumn(c)) {
                                usedColumns[c.name()] = true;
                                defAxes[key].push(c.name());
                            }
                        });
                        if (!defAxes[key].length) {
                            errors.push('Error: Could not populate axis <b>'+key+'</b> with a column of the type '+axisDef.accepts);
                        }
                    }
                } else {
                    defAxes[key] = false;
                }
            });
            if (errors.length) {
                me.warn(errors.join('<br/>'));
                return false;
            }
            defAxes = me.chart.get('metadata.axes', defAxes);
            if (returnAsColumns) {
                _.each(defAxes, function(columns, key) {
                    if (!_.isArray(columns)) {
                        defAxes[key] = columns !== false ? me.dataset.column(columns) : null;
                    } else {
                        _.each(columns, function(column, i) {
                            defAxes[key][i] = column !== false ? me.dataset.column(column) : null;
                        });
                    }
                });
            }
            return defAxes;
        },

        keys: function() {
            var me = this,
                axesDef = me.axes();
            if (axesDef.labels) {
                var lblCol = me.dataset.column(axesDef.labels),
                    fmt = dw.utils.longDateFormat(lblCol),
                    keys = [];
                lblCol.each(function(val) {
                    keys.push(fmt(val));
                });

                return keys;
            }
            return [];
        }

    });

}).call(this);