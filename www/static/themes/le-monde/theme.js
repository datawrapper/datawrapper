(function(){

    // Le Monde Theme
    // -------------

    // Every theme will inherit the properties of this
    // theme. They can override everything or just a bit
    // of them. Also, every theme can extend any other
    // existing theme.

    Datawrapper.Themes.LeMonde = _.extend({}, Datawrapper.Themes.Base, {

        colors: {
            highlight: '#e41f25',
            focus: '#e41f25',
            context: '#aaa',
            axis: '#000000',
            grid: '#999999',
            positive: '#0089c0',
            negative: '#e41f25',
            'highlight-negative': '#801100',
            background: '#ffffff',
            palette: ['#e41f25', '#96c22c', '#fdc400', '#2974b9', '#6A3D9A', '#B15928']
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