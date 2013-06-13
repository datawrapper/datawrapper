(function(){

    // Datawrapper.Visualization.Base
    // ------------------------------

    // Every visualization should extend this class.
    // It provides the basic API between the chart template
    // page and the visualization class.

    Datawrapper.Visualizations = {};

    var Base = function() {

    };

    _.extend(Base.prototype, {

        render: function(el) {
            $(el).html('implement me!');
        },

        setTheme: function(theme) {
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

        load: function(chart, callback) {
            var me = this;
            this.chart = chart;
            chart.dataset(function(ds) {
                me.dataset = ds;
                me.dataset.filterSeries(chart.get('metadata.data.ignore-series', {}));
                callback.call(me, me);
            });
        },

        /**
         * short-cut for this.chart.get('metadata.visualizes.*')
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
        }

    });

    Datawrapper.Visualizations.Base = Base.prototype;

}).call(this);