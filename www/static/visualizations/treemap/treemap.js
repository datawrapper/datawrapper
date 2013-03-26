
(function(){
    // Simple Treemap
    // --------------

    var Treemap = Datawrapper.Visualizations.Treemap = function() {

    };

    _.extend(Treemap.prototype, Datawrapper.Visualizations.RaphaelChart.prototype, {

        render: function(el) {

            el = $(el);
            this.setRoot(el);
            var me = this;

            var filterUI = me.getFilterUI(row);
            if (filterUI) $('#header').append(filterUI);

            var c = me.initCanvas();

        }

    });

    function parseTree(dataset, row) {
        var tree = { children: [] };

    }

}).call(this);
