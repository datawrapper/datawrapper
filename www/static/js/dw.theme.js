(function(){

    // Datawrapper.Theme
    // -----------------

    // Every theme will inherit the properties of this
    // theme. They can override everything or just a bit
    // of them. Also, every theme can extend any other
    // existing theme.
    Datawrapper.Themes = {};

    Datawrapper.Themes.Base = _.extend({}, {

        colors: {
            focus: '#0063A5',
            context: '#bbbbbb',
            axis: '#000000',
            grid: '#999999'
        },

        lineWidth: {
            focus: 3,
            context: 2
        },

        lineChart: {

        },

        barChart: {

        },

        horizontalGrid: false,

        yTicks: true,

        yAxis: {
            stroke: '#000'
        },

        leftPadding: 80,
        rightPadding: 70,
        lineLabelWidth: 50,
        yLabelOffset: 30,

        bottomPadding: 20,
        xLabelOffset: 20,

        hover: true,
        tooltip: true,

        lineHoverDotRadius: 4
    });

}).call(this);