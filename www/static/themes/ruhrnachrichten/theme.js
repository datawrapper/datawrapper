(function(){

    // Ruhrnachrichten Theme
    // ---------------------

    // Every theme will inherit the properties of this
    // theme. They can override everything or just a bit
    // of them. Also, every theme can extend any other
    // existing theme.

    Datawrapper.Themes.Ruhrnachrichten = $.extend(true, {}, Datawrapper.Themes.Default, {

        colors: {
            palette: ['#00A3DA', '#A59E89', '#CF233B', '#667E86'],
            secondary: ["#000000", '#ffd500', '#6FAA12',"#ff7f0e"],
            positive: '#00A3DA',
            negative: '#CF233B',
            background: '#ffffff'
        },

        lineChart: {
            strokeWidth: {
                highlight: 2,
                normal: 1
            },
            hoverDotRadius: 3,
            maxLabelWidth: 80
        },

        vpadding: 10,
        minWidth: 350

    });

}).call(this);