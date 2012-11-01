(function(){

    // Slate Theme
    // -------------
    //

    Datawrapper.Themes.Slate = _.extend({}, Datawrapper.Themes.Base, {

        colors: {
            palette: ["#eeeeee"], // monochrome!
            positive: '#85B4D4',
            negative: '#E31A1C',
            background: '#272B30',
            text: '#eeeeee'
        },

        horizontalGrid: {
            stroke: '#1C1E22'
        }

    });

}).call(this);