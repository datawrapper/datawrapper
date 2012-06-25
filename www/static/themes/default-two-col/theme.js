(function(){

    // Default Theme
    // -------------

    // Every theme will inherit the properties of this
    // theme. They can override everything or just a bit
    // of them. Also, every theme can extend any other
    // existing theme.

    Datawrapper.Themes.DefaultTwoCol = _.extend({}, Datawrapper.Themes.Default, {

        leftPadding: 70,
        rightPadding: 20

    });

}).call(this);