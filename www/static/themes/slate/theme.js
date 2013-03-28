(function(){

    // Slate Theme
    // -------------
    //

    Datawrapper.Themes.Slate = $.extend(true, {}, Datawrapper.Themes.Base, {

        colors: {
            palette: ['#9ab', '#cde', '#678', '#d34', '#bcd'], // monochrome!
            secondary: [], // monochrome!
            positive: '#85B4D4',
            negative: '#E31A1C',
            background: '#272B30',
            text: '#eeeeee'
        },

        horizontalGrid: {
            stroke: '#456'
        },

        xAxis: {
            stroke: '#9ab'
        }

    });

}).call(this);