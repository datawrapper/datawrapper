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
            palette: ['#6E7DA1', '#64A4C4', '#53CCDD',  '#4EF4E8'],
            positive: '#85B4D4',
            negative: '#E31A1C',
            // colors background and text needs to be set in CSS as well!
            background: '#ffffff',
            text: '#000000'
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

        yAxis: {
            'stroke-width': 1
        },

        padding: {
            left: 0,
            right: 20,
            bottom: 30,
            top: 10
        },

        leftPadding: 20,
        rightPadding: 20,
        lineLabelWidth: 20,
        yLabelOffset: 8,

        bottomPadding: 40,
        xLabelOffset: 20,

        hover: true,
        tooltip: true,

        hpadding: 0,
        vpadding: 10
    });

}).call(this);