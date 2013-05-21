(function(){

    // Datawrapper.Theme
    // -----------------

    // Every theme will inherit the properties of this
    // theme. They can override everything or just a bit
    // of them. Also, every theme can extend any other
    // existing theme.

    Datawrapper.Themes = {};

    Datawrapper.Themes.Base = _.extend({}, {

        /*
         * colors used in the theme
         */
        colors: {
            palette: ['#6E7DA1', '#64A4C4', '#53CCDD',  '#4EF4E8'],
            secondary: ["#000000", '#777777', '#cccccc', '#ffd500', '#6FAA12'],

            positive: '#85B4D4',
            negative: '#E31A1C',
            // colors background and text needs to be set in CSS as well!
            background: '#ffffff',
            text: '#000000'
        },

        /*
         * padding around the chart area
         */
        padding: {
            left: 0,
            right: 20,
            bottom: 30,
            top: 10
        },

        /*
         * custom properties for line charts
         */
        lineChart: {
            // stroke width used for lines, in px
            strokeWidth: 3,
            // the maximum width of direct labels, in px
            maxLabelWidth: 80,
            // the opacity used for fills between two lines
            fillOpacity: 0.2,
            // distance between labels and x-axis
            xLabelOffset: 20
        },

        /*
         * custom properties for column charts
         */
        columnChart: {
            // if set to true, the horizontal grid lines are cut
            // so that they don't overlap with the grid label.
            cutGridLines: false,
            // you can customize bar attributes
            barAttrs: {
                'stroke-width': 1
            }
        },

        /*
         * custom properties for bar charts
         */
        barChart: {
            // you can customize bar attributes
            barAttrs: {
                'stroke-width': 1
            }
        },

        /*
         * attributes of x axis, if there is any
         */
        xAxis: {
            stroke: '#333'
        },

        /*
         * attributes of y-axis if there is any shown
         */
        yAxis: {
            strokeWidth: 1
        },


        /*
         * attributes applied to horizontal grids if displayed
         * e.g. in line charts, column charts, ...
         *
         * you can use any property that makes sense on lines
         * such as stroke, strokeWidth, strokeDasharray,
         * strokeOpacity, etc.
         */
        horizontalGrid: {
            stroke: '#d9d9d9'
        },

        /*
         * just like horizontalGrid. used in line charts only so far
         *
         * you can define the grid line attributes here, e.g.
         * verticalGrid: { stroke: 'black', strokeOpacity: 0.4 }
         */
        verticalGrid: false,

        /*
         * draw a frame around the chart area (only in line chart)
         *
         * you can define the frame attributes here, e.g.
         * frame: { fill: 'white', stroke: 'black' }
         */
        frame: false,

        /*
         * if set to true, the frame border is drawn separately above
         * the other chart elements
         */
        frameStrokeOnTop: false,

        /*
         * probably deprecated
         */
        yTicks: false,


        hover: true,
        tooltip: true,

        hpadding: 0,
        vpadding: 10,

        /*
         * some chart types (line chart) go into a 'compact'
         * mode if the chart width is below this value
         */
        minWidth: 400,

        /*
         * theme locale, probably unused
         */
        locale: 'de_DE',

        /*
         * duration for animated transitions (ms)
         */
        duration: 1000,

        /*
         * easing for animated transitions
         */
         easing: 'expoInOut'

    });

}).call(this);