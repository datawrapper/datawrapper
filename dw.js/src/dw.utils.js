

dw.utils = {

    /*
     * returns the min/max range of a set of columns
     */
    minMax: function (columns) {
        var minmax = [Number.MAX_VALUE, -Number.MAX_VALUE];
            _.each(columns, function(column) {
                minmax[0] = Math.min(minmax[0], column.range()[0]);
                minmax[1] = Math.max(minmax[1], column.range()[1]);
            });
        return minmax;
    }

};



