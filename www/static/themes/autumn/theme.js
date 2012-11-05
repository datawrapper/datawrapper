(function(){

    // Autumn Theme
    // -------------

    // Every theme will inherit the properties of this
    // theme. They can override everything or just a bit
    // of them. Also, every theme can extend any other
    // existing theme.

    Datawrapper.Themes.Autumn = _.extend({}, Datawrapper.Themes.Base, {

        colors: {
            palette: ["#F24405", "#96685C","#404040", "#389486", "#9A718A"],
            context: '#aaa',
            axis: '#000000',
            positive: '#389486',
            negative: '#F24405',
            background: '#F2F2F2'
        },

        horizontalGrid: {
            stroke: '#ccc'
        },

        columnChart: {
            cutGridLines: true
        },

        vpadding: 10

    });

}).call(this);