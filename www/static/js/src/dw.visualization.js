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
                callback.call(me, me);
            });
        },

        getMaxChartHeight: function(el) {
            function margin(el, type) {
                return +$(el).css('margin-' + type).replace('px', '');
            }
            var ch = 0, bottom = 0; // summed height of children, 10px for top & bottom margin
            $('body > *').each(function(i, el) {
                var t = el.tagName.toLowerCase();
                if (t != 'script' && el.id != 'chart' && !$(el).hasClass('tooltip') && !$(el).hasClass('container')) {
                    ch += $(el).outerHeight(false); // element height
                }
                ch += Math.max(margin(el, 'top'), bottom);
                bottom = margin(el, 'bottom');
            });
            ch += bottom;
            // subtract body padding
            //ch += $('body').innerHeight() - $('body').height();
            var mt = $('#chart').css('margin-top').replace('px', ''),
                mb = $('#chart').css('margin-bottom').replace('px', ''),
                maxH = $(window).height() - ch - 2;
            // IE Fix
            if ($.browser.msie) maxH -= 10;
            maxH -= $('body').css('padding-top').replace('px', '');
            maxH -= $('body').css('padding-bottom').replace('px', '');
            return maxH;
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
                'text-align': 'center',
                position: 'absolute'
            });
            $('body').prepend(warning);
            warning.hide();
            warning.fadeIn();
        }

    });

    Datawrapper.Visualizations.Base = Base.prototype;

}).call(this);