(function(){

    // Der Standard Theme
    // -------------

    // Every theme will inherit the properties of this
    // theme. They can override everything or just a bit
    // of them. Also, every theme can extend any other
    // existing theme.

    Datawrapper.Themes.Avenir = $.extend(true, {}, Datawrapper.Themes.Base, {

        colors: {
            palette: ['#FD9417', '#42B846', '#FFD500', '#680240', '#F20559', '#1F0D67'],
            positive: '#FD9417',
            negative: '#e41f25',
        },

        lineChart: {
            strokeWidth: {
                highlight: 3,
                normal: 1
            },
            hoverDotRadius: 4,
            maxLabelWidth: 80
        },

    });

}).call(this);