(function(){

    // WSJ Theme
    // ---------

    // Every theme will inherit the properties of this
    // theme. They can override everything or just a bit
    // of them. Also, every theme can extend any other
    // existing theme.

    Datawrapper.Themes.Wsj = _.extend({}, Datawrapper.Themes.Base, {

        colors: {
            line: '#D21E1D',
            altBg: '#EDE1C7'
        },

        horzLines: {
            color: '#fff',
            dashed: '- '
        }


    });

}).call(this);