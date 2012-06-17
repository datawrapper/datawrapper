(function(){

    // Datawrapper.Chart
    // -----------------

    //
    var Chart = Datawrapper.Chart = function(attributes) {
        this.__attributes = attributes;
    };

    _.extend(Chart.prototype, {

        get: function(key) {
            var keys = key.split('.'),
                pt = this.__attributes;

            _.each(keys, function(key) {
                if (pt === undefined) {
                    console.warn('pt is undefined', pt, keys, this.__attributes);
                }
                pt = pt[key];
            });
            return pt;
        },

        dataset: function(callback) {
            var ds = new Miso.Dataset({
            url : '/chart/' + this.get('id') + '/data',
                delimiter : "auto",
                transpose: this.get('metadata.data.transpose'),
                firstRowIsHeader: this.get('metadata.data.horizontal-header')
            }).fetch({
                success: function() {
                    callback(this);
                }
            });
        }
    });

}).call(this);