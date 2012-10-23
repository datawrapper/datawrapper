(function(){

    // Default Theme
    // -------------

    // Every theme will inherit the properties of this
    // theme. They can override everything or just a bit
    // of them. Also, every theme can extend any other
    // existing theme.

    Datawrapper.Themes.Default = _.extend({}, Datawrapper.Themes.Base, {

        colors: {
            palette: ["#1f77b4","#ff7f0e","#2ca02c","#d62728","#9467bd"],
            highlight: '#00589E',
            focus: '#0063A5',
            context: '#aaa',
            axis: '#000000',
            positive: '#85B4D4',
            'highlight-positive': '#85B4D4',
            negative: '#E31A1C',
            'highlight-negative': '#9E5800',
            background: '#ffffff'
        }

    });

}).call(this);