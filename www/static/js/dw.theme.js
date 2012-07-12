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
            context: '#777',
            axis: '#000000',
            grid: '#999999'
        },

        locale: 'de_DE',

        lineChart: {
            strokeWidth: {
                highlight: 3,
                normal: 1
            },
            hoverDotRadius: 3,
            maxLabelWidth: 80
        },

        barChart: {

        },

        horizontalGrid: {
            stroke: '#e9e9e9'
        },

        yTicks: false,

        yAxis: false,

        padding: {
            left: 20,
            right: 20,
            bottom: 40,
            top: 10
        },

        leftPadding: 20,
        rightPadding: 20,
        lineLabelWidth: 20,
        yLabelOffset: 8,

        bottomPadding: 40,
        xLabelOffset: 20,

        hover: true,
        tooltip: true
    });

}).call(this);