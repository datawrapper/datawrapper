(function(){

    // Datawrapper.Theme
    // -----------------

    // Every theme will inherit the properties of this
    // theme. They can override everything or just a bit
    // of them. Also, every theme can extend any other
    // existing theme.
    Datawrapper.Themes = {};

    Datawrapper.Themes.Base = _.extend({}, {

        colors: {
            line: '#0063A5'
        },

        _colors: ['', '#5B5B5B', '#9A2020', '#737373', '#8E2B2B', '#8B8B8B', '#803838', '#5B5B5B', '#793F3F', '#737373', '#714747', '#8B8B8B', '#655252', '#A41717', '#5B5B5B', '#9A2020', '#737373', '#8E2B2B', '#8B8B8B', '#803838', '#5B5B5B', '#793F3F', '#737373', '#714747', '#8B8B8B', '#655252'],

        chart: {
            backgroundColor: '#fff',
            plotBackgroundColor: 'rgba(255, 255, 255, .9)',
            plotShadow: false,
            plotBorderWidth: 0
        },

        title: {
            style: {
                color: '#000',
                font: 'bold 16px Arial, Helvetica, sans-serif'
            }
        },

        foo: 'bar'

    });

}).call(this);