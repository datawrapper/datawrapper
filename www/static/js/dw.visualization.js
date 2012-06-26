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
        },

        load: function(chart, callback) {
            var me = this;
            this.chart = chart;
            chart.dataset(function(ds) {
                me.dataset = ds;
                callback.call(me, me);
            });
        },

        getMaxChartHeight: function(el) {
            var ch = 0; // summed height of children
            $('body > *').each(function(i, el) {
                var t = el.tagName.toLowerCase();
                if (t != 'script' && el.id != 'chart' && !$(el).hasClass('tooltip')) {
                    ch += $(el).outerHeight(true);
                }
            });
            // subtract body padding
            //ch += $('body').innerHeight() - $('body').height();
            return $(window).height() - ch - 30;
        }

    });

    Datawrapper.Visualizations.Base = Base.prototype;

}).call(this);