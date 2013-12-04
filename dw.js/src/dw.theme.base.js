
// Every theme must extend this class.
// It provides the basic API between the chart template
// page and the visualization class.

dw.theme.base = {

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
        text: '#000000',

        /*
         * gradients that might be used by color gradient selectors
         *
         * Colors from www.ColorBrewer2.org by Cynthia A. Brewer,
         * Geography, Pennsylvania State University.
         */
        gradients: [
            ['#fefaca', '#008b15'], // simple yellow to green
            ['#f0f9e8','#ccebc5','#a8ddb5','#7bccc4','#43a2ca','#0868ac'],  // GnBu
            ['#feebe2','#fcc5c0','#fa9fb5','#f768a1','#c51b8a','#7a0177'],  // RdPu
            ['#ffffcc','#c7e9b4','#7fcdbb','#41b6c4','#2c7fb8','#253494'],  // YlGnbu

            ['#8c510a','#d8b365','#f6e8c3','#f5f7ea','#c7eae5','#5ab4ac','#01665e'],  // BrBG
            ['#c51b7d','#e9a3c9','#fde0ef','#faf6ea','#e6f5d0','#a1d76a','#4d9221'],  // PiYG
            ['#b2182b','#ef8a62','#fddbc7','#f8f6e9','#d1e5f0','#67a9cf','#2166ac'],  // RdBu
            //['#b35806','#f1a340','#fee0b6','#f7f7f7','#d8daeb','#998ec3','#542788'],  // PuOr
        ],

        /*
         * presets for category colors
         *
         * Colors from www.ColorBrewer2.org by Cynthia A. Brewer,
         * Geography, Pennsylvania State University.
         */
        categories: [
            ["#7fc97f", "#beaed4", "#fdc086", "#ffff99", "#386cb0", "#f0027f", "#bf5b17", "#666666"], // Accent
            ["#fbb4ae", "#b3cde3", "#ccebc5", "#decbe4", "#fed9a6", "#ffffcc", "#e5d8bd", "#fddaec", "#f2f2f2"], // Pastel1
            ["#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99", "#e31a1c", "#fdbf6f", "#ff7f00", "#cab2d6", "#6a3d9a", "#ffff99", "#b15928"] // Paired
        ]
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
        },
        // make strokes a little darker than the fill
        darkenStroke: 18
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

};