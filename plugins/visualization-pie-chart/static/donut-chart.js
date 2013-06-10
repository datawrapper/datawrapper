
(function(){

    var DonutChart = Datawrapper.Visualizations.DonutChart = function() {

    };

    _.extend(DonutChart.prototype, Datawrapper.Visualizations.PieChart.prototype, {

        isDonut: function() {
            return true;
        }

    });

}).call(this);