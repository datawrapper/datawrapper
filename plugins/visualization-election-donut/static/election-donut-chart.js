
(function(){

    dw.visualization.register('election-donut-chart', 'donut-chart', {

        getFullArc: function() {
            return Math.PI * 1.2;
        },

        groupAfter: function() {
            return 10;
        }

    });

}).call(this);