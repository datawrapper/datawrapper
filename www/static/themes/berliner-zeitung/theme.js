(function(){

    // Berliner Zeitung Theme
    // -------------

    // Every theme will inherit the properties of this
    // theme. They can override everything or just a bit
    // of them. Also, every theme can extend any other
    // existing theme.

    Datawrapper.Themes.BerlinerZeitung = $.extend(true, {}, Datawrapper.Themes.Base, {

        colors: {
            palette: ['#184E8A', '#6FAA12', '#FFD500', '#680240', '#F20559', '#1F0D67'],
            positive: '#184E8A',
            negative: '#e41f25',
            background: '#ffffff'
        },

        lineChart: {
            strokeWidth: {
                highlight: 3,
                normal: 1
            },
            hoverDotRadius: 4,
            maxLabelWidth: 80
        }

    });

}).call(this);