(function(){

    // Playfair Theme
    // --------------

    // Every theme will inherit the properties of this
    // theme. They can override everything or just a bit
    // of them. Also, every theme can extend any other
    // existing theme.

    Datawrapper.Themes.Autumn = $.extend(true, {}, Datawrapper.Themes.Default, {

        colors: {
            palette: ["#B75364", "#D9A255", "#96685C","#6FAF5F", "#9A718A"],
            secondary: [],
            context: '#aaa',
            axis: '#000000',
            positive: '#389486',
            negative: '#F24405',
            background: '#FEFAF2'
        },

        horizontalGrid: {
            stroke: '#ccc5c5'
        },

        verticalGrid: {
            stroke: '#ccc5c5'
        },

        columnChart: {
            cutGridLines: true
        },

        frame: {
            stroke: '#98948C',
            'stroke-width': 2,
            fill: '#fff',
            'fill-opacity': 0.35,
            'stroke-opacity': 1
        },

        frameStrokeOnTop: true,

        vpadding: 10

    });

}).call(this);