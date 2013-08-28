(function(){

    // Default Theme
    // -------------

    dw.theme.register('default', {

        colors: {
            // primary colors
            palette: ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd"],
            // secondary colors, used in custom color dialog
            // this should contain colors that might be useful
            secondary: ["#000000", '#777777', '#cccccc', '#ffd500', '#6FAA12'],
            context: '#aaa',
            axis: '#000000',
            positive: '#1f77b4',
            negative: '#d62728',
            background: '#ffffff'
        },

        lineChart: {
            fillOpacity: 0.2
        },

        vpadding: 10,

        frame: false,

        verticalGrid: false,

        columnChart: {
            darkenStroke: 5
        }

    });

}).call(this);