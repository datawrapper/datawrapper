
(function(){
    // Election Donut
    // -------------------------

    var ElectionDonutChart = Datawrapper.Visualizations.ElectionDonutChart = function() {

    };

    _.extend(ElectionDonutChart.prototype, Datawrapper.Visualizations.DonutChart.prototype, {

        getFullArc: function() {
            return Math.PI * 1.2;
        },

        groupAfter: function() {
            return 10;
        }

    });

}).call(this);