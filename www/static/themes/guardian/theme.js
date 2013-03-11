(function(){

    // Guardian Theme
    // -------------

    // Every theme will inherit the properties of this
    // theme. They can override everything or just a bit
    // of them. Also, every theme can extend any other
    // existing theme.

    Datawrapper.Themes.Guardian = $.extend(true, {}, Datawrapper.Themes.Base, {

        colors: {
            palette: ['#e41f25', '#96c22c', '#fdc400', '#2974b9', '#6A3D9A', '#B15928'],
            positive: '#0089c0',
            negative: '#e41f25',
            background: '#ffffff'
        },

        lineChart: {
            strokeWidth: 3,
            hoverDotRadius: 4,
            maxLabelWidth: 80
        },

        vpadding: 0

    });

}).call(this);