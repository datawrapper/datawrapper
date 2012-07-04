
(function(){

    // Simple perfect bar chart
    // -------------------------

    var StackedBarChart = Datawrapper.Visualizations.StackedBarChart = function() {

    };

    _.extend(StackedBarChart.prototype, Datawrapper.Visualizations.BarChart.prototype, {

        isStacked: function() {
            return true;
        }
    });

}).call(this);