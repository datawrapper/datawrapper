(function(){

    // Datawrapper.Chart
    // -----------------

    //
    var Chart = Datawrapper.Chart = function(attributes) {
        this.__attributes = attributes;
    };

    _.extend(Chart.prototype, {

        get: function(key, _default) {
            var keys = key.split('.'),
                pt = this.__attributes;

            _.each(keys, function(key) {
                if (pt === undefined) {
                    return _default;
                }
                pt = pt[key];
            });
            return _.isUndefined(pt) || _.isNull(pt) ? _default : pt;
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
                    me.__dsLoaded = true;
                    callback(this);
                    if (me.__datasetLoadedCallbacks) {
                        for (var i=0; i<me.__datasetLoadedCallbacks.length; i++) {
                            me.__datasetLoadedCallbacks[i](me);
                        }
                    }
                }
            });
            return ds;
        },

        datasetLoaded: function(callback) {
            var me = this;
            if (me.__dsLoaded) {
                // run now
                callback(me);
            } else {
                if (!me.__datasetLoadedCallbacks) me.__datasetLoadedCallbacks = [];
                me.__datasetLoadedCallbacks.push(callback);
            }
        },

        dataSeries: function(sortByFirstValue) {
            var me = this;
            ds = [];
            me.__dataview.eachColumn(function(name, col, i) {
                if (i > 0 || !me.hasRowHeader()) {
                    ds.push(col);
                }
            });
            if (sortByFirstValue) {
                ds = ds.sort(function(a,b) {
                    return b.data[0] > a.data[0] ? 1 : -1;
                });
            }
            return ds;
        },

        seriesByName: function(name) {
            return this.__dataview.column(name);
        },

        numRows: function() {
            return this.__dataview.length;
        },

        hasColHeader:  function(invert) {
            var t = this.get('metadata.data.transpose');
            if (invert ? !t : t) {
                return this.get('metadata.data.vertical-header');
            } else {
                return this.get('metadata.data.horizontal-header');
            }
        },

        hasRowHeader: function() {
            return this.hasColHeader(true);
        },

        rowHeader: function() {
            var dv = this.__dataview;
            return this.hasRowHeader() ? dv.column(dv.columnNames()[0]) : false;
        },

        rowLabels: function() {
            if (this.hasRowHeader()) {
                return this.rowHeader().data;
            } else {
                return null;
            }
        },

        rowLabel: function(r) {
            if (this.hasRowHeader()) {
                return this.rowHeader().data[r];
            } else {
                return r;
            }
        },

        hasHighlight: function() {
            var hl = this.get('metadata.visualize.highlighted-series');
            return _.isArray(hl) && hl.length > 0;
        },

        isHighlighted: function(col) {
            var hl = this.get('metadata.visualize.highlighted-series');
            return !_.isArray(hl) || hl.length === 0 || _.indexOf(hl, col.name) >= 0;
        },

        setLocale: function(locale, metric_prefix) {
            this.locale = locale;
            this.metric_prefix = metric_prefix;
        },

        formatValue: function(val, full) {
            var me = this,
                format = me.get('metadata.describe.number-format'),
                div = Number(me.get('metadata.describe.number-divisor')),
                append = me.get('metadata.describe.number-append'),
                prepend = me.get('metadata.describe.number-prepend');

            if (format != '-') {
                var culture = Globalize.culture(me.locale);
                val = Globalize.format(Number(val) / Math.pow(10, div), format);
            }
            return prepend + val + append;
        },

        filterRow: function(r) {
            var me = this;
            var ds = new Miso.Dataset({
                data: [me.__dataview.rowByPosition(r)]
            });
            ds.fetch({
                success: function() {
                    me.__dataview = this;
                    me.__dataSeries = false;
                }
            });
        }

    });

}).call(this);