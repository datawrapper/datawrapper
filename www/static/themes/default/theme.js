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
            context: '#aaa',
            axis: '#000000',
            positive: '#1f77b4',
            negative: '#d62728',
            background: '#ffffff'
        }

    });

}).call(this);