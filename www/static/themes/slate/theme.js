(function(){

    // Slate Theme
    // -------------
    //

    Datawrapper.Themes.Slate = _.extend({}, Datawrapper.Themes.Base, {

        colors: {
            palette: ["#eeeeee"], // monochrome!
            highlight: '#00589E',
            focus: '#0063A5',
            context: '#aaa',
            axis: '#000000',
            positive: '#85B4D4',
            'highlight-positive': '#85B4D4',
            negative: '#E31A1C',
            'highlight-negative': '#9E5800',
            background: '#272B30'
        },

        horizontalGrid: {
            stroke: '#1C1E22'
        }

    });

}).call(this);