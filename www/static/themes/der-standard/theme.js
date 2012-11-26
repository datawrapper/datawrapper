(function(){

    // Der Standard Theme
    // -------------

    // Every theme will inherit the properties of this
    // theme. They can override everything or just a bit
    // of them. Also, every theme can extend any other
    // existing theme.

    Datawrapper.Themes.DerStandard = $.extend(true, {}, Datawrapper.Themes.Base, {

        colors: {
            palette: ['#162964', '#6FAA12', '#FFD500', '#680240', '#F20559', '#1F0D67'],
            positive: '#162964',
            negative: '#e41f25',
            background: '#ec008c',
        },

        lineChart: {
            strokeWidth: {
                highlight: 3,
                normal: 1
            },
            hoverDotRadius: 4,
            maxLabelWidth: 80
        },

        horizontalGrid: {
            stroke: "#363434"
        },

    });

}).call(this);