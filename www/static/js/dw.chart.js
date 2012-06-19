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
                    //console.warn('pt is undefined', pt, keys, this.__attributes);
                    return null;
                }
                pt = pt[key];
            });
            return pt;
        },

        dataset: function(callback, ignoreTranspose) {
            var me = this, ds, dsOpts = {
                parser: Miso.Parsers.Delimited,
                delimiter: 'auto',
                transpose: ignoreTranspose ? false : this.get('metadata.data.transpose'),
                firstRowIsHeader: this.get('metadata.data.horizontal-header')
            };
            if (!this.__dataview) {
                dsOpts.url = '/chart/' + this.get('id') + '/data';
            } else {
                dsOpts.data = this.__dataview.parser.__rawData;
            }
            ds = new Miso.Dataset(dsOpts);
            window.ds = ds;
            ds.fetch({
                success: function() {
                    me.__dataview = this;
                    callback(this);
                }
            });
            return ds;
        },

        dataColumns: function() {
            var me = this;
            if (me.__dataColumns) return me.__dataColumns;
            me.__dataColumns = [];
            me.__dataview.eachColumn(function(name, col, i) {
                if (i > 0 || !me.hasRowHeader()) {
                    me.__dataColumns.push(col);
                }
            });
            return me.__dataColumns;
        },

        hasColHeader: function(invert) {
            var t = this.get('metadata.data.transpose');
            if (invert ? !t : t) {
                return this.get('metadata.data.vertical-header');
            } else {
                return this.get('metadata.data.horizontal-header');
            }
        },

        hasRowHeader: function() {
            return this.hasColHeader(true);
        }
    });

}).call(this);