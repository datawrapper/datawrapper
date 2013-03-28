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

        // loads the dataset of this chart
        dataset: function(callback, ignoreTranspose) {
            var me = this, ds, dsOpts = {
                delimiter: 'auto',
                url: 'data',
                transpose: ignoreTranspose ? false : this.get('metadata.data.transpose', false),
                firstRowIsHeader: this.get('metadata.data.horizontal-header', true),
                firstColumnIsHeader: this.get('metadata.data.vertical-header', true)
            };
            me.__dataset = ds = new Datawrapper.Dataset(dsOpts);
            ds.fetch({
                success: function() {
                    callback(ds);
                    if (me.__datasetLoadedCallbacks) {
                        for (var i=0; i<me.__datasetLoadedCallbacks.length; i++) {
                            me.__datasetLoadedCallbacks[i](me);
                        }
                    }
                }
            });
            return ds;
        },

        rawData: function(rawData) {
            var me = this,
                dsOpts = {
                    rawData: rawData,
                    delimiter: 'auto',
                    transpose: this.get('metadata.data.transpose', false),
                    firstRowIsHeader: this.get('metadata.data.horizontal-header', true),
                    firstColumnIsHeader: this.get('metadata.data.vertical-header', true)
                };
            me.__dataset = ds = new Datawrapper.Dataset(dsOpts);
            ds.fetchRaw();
        },

        datasetLoaded: function(callback) {
            var me = this;
            if (me.__dataset.__loaded) {
                // run now
                callback(me);
            } else {
                if (!me.__datasetLoadedCallbacks) me.__datasetLoadedCallbacks = [];
                me.__datasetLoadedCallbacks.push(callback);
            }
        },

        dataSeries: function(sortByFirstValue, reverseOrder) {
            var me = this;
            ds = [];
            me.__dataset.eachSeries(function(series, i) {
                ds.push(series);
            });
            if (sortByFirstValue === true) {
                ds = ds.sort(function(a,b) {
                    return b.data[0] > a.data[0] ? 1 : -1;
                });
            } else if ($.type(sortByFirstValue) == "number") {
                ds = ds.sort(function(a,b) {
                    return b.origdata[sortByFirstValue] > a.origdata[sortByFirstValue] ? 1 : -1;
                });
            }
            if (reverseOrder) ds.reverse();
            return ds;
        },

        seriesByName: function(name) {
            return this.__dataset.series(name);
        },

        numRows: function() {
            return this.__dataset.numRows();
        },

        // column header is the first value of each data series
        hasColHeader:  function(invert) {
            var t = this.get('metadata.data.transpose');
            if (invert ? !t : t) {
                return this.get('metadata.data.vertical-header');
            } else {
                return this.get('metadata.data.horizontal-header');
            }
        },

        // row header is the first data series
        hasRowHeader: function() {
            return this.hasColHeader(true);
        },

        rowHeader: function() {
            var ds = this.__dataset;
            return this.hasRowHeader() ? { data: ds.rowNames() } : false;
        },

        rowLabels: function() {
            //console.warn('chart.rowLabels() is marked deprecated. Use chart.dataset().rowNames() instead');
            if (this.hasRowHeader()) {
                return this.rowHeader().data;
            } else {
                var rh = [];
                for (var i=0; i<this.numRows(); i++) rh.push('Row '+(i+1));
                return rh;
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
            if (col === undefined) return false;
            var hl = this.get('metadata.visualize.highlighted-series');
            return !_.isArray(hl) || hl.length === 0 || _.indexOf(hl, col.name) >= 0;
        },

        setLocale: function(locale, metric_prefix) {
            Globalize.culture(locale);
            this.locale = locale;
            this.metric_prefix = metric_prefix;
        },

        formatValue: function(val, full, round) {
            var me = this,
                format = me.get('metadata.describe.number-format'),
                div = Number(me.get('metadata.describe.number-divisor')),
                append = me.get('metadata.describe.number-append', '').replace(' ', '&nbsp;'),
                prepend = me.get('metadata.describe.number-prepend', '').replace(' ', '&nbsp;');

            if (div !== 0) val = Number(val) / Math.pow(10, div);
            if (format != '-') {
                if (round || val == Math.round(val)) format = format.substr(0,1)+'0';
                val = Globalize.format(val, format);
            } else if (div !== 0) {
                val = val.toFixed(1);
            }

            return full ? prepend + val + append : val;
        },

        /*
         * filter to a single row in the dataset
         */
        filterRow: function(row) {
            this.__dataset.filterRows([row]);
        },

        filterRows: function(rows) {
            this.__dataset.filterRows(rows);
        },

        hasMissingValues: function() {
            var missValues = false;
            _.each(this.dataSeries(), function(ds) {
                _.each(ds.data, function(val) {
                    if (val != Number(val)) {
                        missValues = true;
                        return false;
                    }
                });
                if (missValues) return false;
            });
            return missValues;
        }

    });

}).call(this);