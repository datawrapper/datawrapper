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
            context: '#676',
            axis: '#000000'
        },

        lineWidth: {
            focus: 3,
            context: 2
        },

        horizontalGrid: false,

        yTicks: true,

        yAxis: {
            stroke: '#000'
        },

        leftPadding: 70,
        rightPadding: 70,
        lineLabelWidth: 50,
        yLabelOffset: 30,

        bottomPadding: 10,
        xLabelOffset: 20
    });

}).call(this);