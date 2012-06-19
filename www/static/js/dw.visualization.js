(function(){

    // Datawrapper.Theme
    // -----------------

    // Every theme will inherit the properties of this
    // theme. They can override everything or just a bit
    // of them. Also, every theme can extend any other
    // existing theme.
    Datawrapper.Visualizations = {};

    var Base = function() {

    };

    _.extend(Base.prototype, {

        render: function(el) {
            $(el).html('implement me!');
        },

        load: function(chart, callback) {
            var me = this;
            this.chart = chart;
            chart.dataset(function(ds) {
                me.dataset = ds;
                callback.call(me, me);
            });
        },

        hasColHeader: function(invert) {
            var t = this.chart.get('metadata.data.transpose');
            if (invert ? !t : t) {
                return this.chart.get('metadata.data.vertical-header');
            } else {
                return this.chart.get('metadata.data.horizontal-header');
            }
        },

        hasRowHeader: function() {
            return this.hasColHeader(true);
        },

        // returns a list of columns that contain data (no vertical headers)
        dataColumns: function() {
            var me = this;
            if (me.__dataColumns) return me.__dataColumns;
            me.__dataColumns = [];
            me.dataset.eachColumn(function(name, col, i) {
                if (i > 0 || !me.hasRowHeader()) {
                    me.__dataColumns.push(col);
                }
            });
            return me.__dataColumns;
        }

    });

    Datawrapper.Visualizations.Base = Base.prototype;

}).call(this);