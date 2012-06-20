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
            line: '#0063A5',
            axis: '#000000'
        },

        horizontalGrid: false,

        yTicks: true,

        yAxis: {
            stroke: '#000'
        },

        leftPadding: 70,
        yLabelOffset: 30,


        bottomPadding: 10,
        xLabelOffset: 20
    });

}).call(this);