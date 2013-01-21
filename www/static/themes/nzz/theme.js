(function(){

    // Neue Zürcher Zeitung Theme
    // -------------

    // Every theme will inherit the properties of this
    // theme. They can override everything or just a bit
    // of them. Also, every theme can extend any other
    // existing theme.
    Datawrapper.Themes.Nzz = $.extend(true, {}, Datawrapper.Themes.Base, {
        colors: {
            palette: ['#ff6666', '#008d86', '#b90772', '#b3b345', '#7e3929', '#d73047', '#5d669f', '#eeb948'],
            positive: '#008d86',
            negative: '#b90772',
            background: '#ffffff'
        },

        lineChart: {
            strokeWidth: {
                highlight: 3,
                normal: 1
            },
            hoverDotRadius: 4,
            maxLabelWidth: 80
        },

        vpadding: 0

    });
}).call(this);