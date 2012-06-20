(function(){

    // WSJ Theme
    // ---------

    // Every theme will inherit the properties of this
    // theme. They can override everything or just a bit
    // of them. Also, every theme can extend any other
    // existing theme.

    Datawrapper.Themes.Wsj = _.extend({}, Datawrapper.Themes.Base, {

        colors: {
            line: '#D21E1D',
            altBg: '#EDE1C7'
        },

        horizontalGrid: {
            stroke: '#333',
            'stroke-dasharray': '. '
        },

        yAxis: false,
        yTicks: false,
        yLabelOffset: 8,

        leftPadding: 50,
        bottomPadding: 10,
        xLabelOffset: 20

    });

}).call(this);