(function(){

    // WSJ Theme
    // ---------

    // Every theme will inherit the properties of this
    // theme. They can override everything or just a bit
    // of them. Also, every theme can extend any other
    // existing theme.

    Datawrapper.Themes.Wsj = $.extend(true, {}, Datawrapper.Themes.Base, {

        colors: {
            main: '#E8B3A4',
            highlight: '#C72535',
            negative: '#A4B3E8',
            'negative-highlight': '#3525C7',
            altBg: '#EDE1C7'
        },

        horizontalGrid: {
            stroke: '#bbb',
            'stroke-dasharray': '- '
        },

        yAxis: false,
        yTicks: false,
        yLabelOffset: 8,

        bottomPadding: 10,
        xLabelOffset: 20

    });

}).call(this);