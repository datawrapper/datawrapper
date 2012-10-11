(function(){

    // Default Theme
    // -------------

    // Every theme will inherit the properties of this
    // theme. They can override everything or just a bit
    // of them. Also, every theme can extend any other
    // existing theme.

    Datawrapper.Themes.Default = _.extend({}, Datawrapper.Themes.Base, {

        colors: {
            palette: ['#70A8D7', '#97C2E9', '#BFDCF8'],
            highlight: '#00589E',
            focus: '#0063A5',
            context: '#aaa',
            axis: '#000000',
            grid: '#999999',
            positive: '#85B4D4',
            'highlight-positive': '#85B4D4',
            negative: '#E31A1C',
            'highlight-negative': '#9E5800',
            background: '#ffffff'
        }

    });

}).call(this);