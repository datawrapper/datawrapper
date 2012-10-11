(function(){

    // Default Theme
    // -------------

    // Every theme will inherit the properties of this
    // theme. They can override everything or just a bit
    // of them. Also, every theme can extend any other
    // existing theme.

    Datawrapper.Themes.DeutscheWelle = _.extend({}, Datawrapper.Themes.Base, {

        hpadding: 20,
        vpadding: -10,

        colors: {
            palette: ['#BE232D', '#EB6E14', '#F0AA00', '#82141E'],
            highlight: '#00589E',
            axis: '#000000',
            positive: '#009BFF',
            'highlight-positive': '#85B4D4',
            negative: '#DC0F6E',
            'highlight-negative': '#9E5800',
            background: '#E6E3E0'
        },

        horizontalGrid: {
            stroke: '#D2CEC7'
        }
    });

}).call(this);