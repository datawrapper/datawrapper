(function(){

    // Playfair Theme
    // --------------

    // Every theme will inherit the properties of this
    // theme. They can override everything or just a bit
    // of them. Also, every theme can extend any other
    // existing theme.

    Datawrapper.Themes.Autumn = $.extend(true, {}, Datawrapper.Themes.Base, {

        colors: {
            palette: ["#6F4139", "#96685C","#404040", "#389486", "#9A718A"],
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

        vpadding: 10

    });

}).call(this);