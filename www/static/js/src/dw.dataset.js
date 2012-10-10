(function(){

    // Datawrapper.Dataset
    // -------------------

    //
    var Dataset = Datawrapper.Dataset = function(options) {
        _.extend(options, {
            type: 'delimited'
        });
        this.__options = options;

    };

    _.extend(Dataset.prototype, {

        _initialize: function() {
            var me = this,
                opts = me.__options;
        },

        _fetchDelimited: function(callbacks) {
            var me = this,
                opts = me.__options;

            if (opts.url !== undefined) {
                if (me.__lastUrl == opts.url) {
                    // use cached data
                    loaded(me.__rawData);
                } else {
                    // load data from url
                    $.ajax({
                        url: opts.url,
                        method: 'GET',
                        success: function(raw) {
                            me._delimtedLoaded(raw);
                            if (_.isFunction(callbacks.success)) {
                                callbacks.success();
                            }
                        }
                    });
                }
            }
        },

        _delimtedLoaded: function(raw, callbacks) {
            var me = this, opts = me.__options;
            me.__rawData = raw;
            // parse data
            var parser = new Datawrapper.Parsers.Delimited(opts),
                data = parser.parse(raw);
            me._processData(data);
            me.__data = data;
            me.__loaded = true;
        },

        _processData: function(data) {
            var me = this,
                numParser = new NumberParser();
            me.__seriesByName = {};
            // at first we teach the parser all numbers we have
            _.each(data.series, function(s) {
                me.__seriesByName[s.name] = s;
                s._min = function() {
                    //console.warn('series._min() is deprecated, use series.min instead.');
                    return s.min;
                };
                s._max = function() {
                    //console.warn('series._max() is deprecated, use series.max instead.');
                    return s.max;
                };
                _.each(s.data, function(number) {
                    numParser.learn(number);
                });
            });
            // then we let him parse the numbers
            _.each(data.series, function(s) {
                s.min = Number.MAX_VALUE;
                s.max = -Number.MAX_VALUE;
                s.total = 0;
                _.each(s.data, function(number, i) {
                    s.data[i] = numParser.parse(number);
                    if (!isNaN(s.data[i])) {
                        s.min = Math.min(s.min, s.data[i]);
                        s.max = Math.max(s.max, s.data[i]);
                        s.total += s.data[i];
                    }
                });
            });
        },


        // PUBLIC API

        /*
         * loads a new dataset
         */
        fetch: function(callbacks) {
            var me = this, opts = me.__options;

            if (opts.type == "delimited") {
                me._fetchDelimited(callbacks);
            }
        },

        /*
         *
         */
        fetchRaw: function() {
            var me = this, opts = me.__options;
            if (opts.type == "delimited") {
                me._delimtedLoaded(opts.rawData);
            }
        },

        /*
         * returns either a single series by name or index, or a list of
         * all series, if no parameter x is given
         */
        series: function(x) {
            var me = this;
            if (_.isString(x)) {
                // single series by name
                if (me.__seriesByName[x] !== undefined) return me.__seriesByName[x];
                throw 'No series found with that name: "'+x+'"';
            }
            if (x !== undefined) {
                // single series by index
                if (me.__data.series[x] !== undefined) return me.__data.series[x];
                throw 'No series found with that index: '+x;
            }
            return this.__data.series;
        },

        hasRowNames: function() {
            return this.__data.rowNames !== undefined;
        },

        numRows: function() {
            return this.__data.series[0].data.length;
        },

        eachRow: function(func) {
            var i;
            for (i=0; i<this.numRows(); i++) {
                func(i);
            }
        },

        eachSeries: function(func) {
            _.each(this.series(), func);
        },

        rowNames: function() {
            return this.__data.rowNames;
        },

        rowName: function(i) {
            return this.__data.rowNames[i];
        },

        rowNameLabel: function() {
            return this.__data.rowNameLabel !== undefined ? this.__data.rowNameLabel : '';
        },

        // removes every row except the one with index i
        filterRows: function(rows) {
            this.eachSeries(function(s) {
                var d = [];
                s.total = 0;
                s.min = Number.MAX_VALUE;
                s.max = Number.MAX_VALUE*-1;
                _.each(rows, function(i) {
                    d.push(s.data[i]);
                    s.total += s.data[i];
                    s.min = Math.min(s.min, s.data[i]);
                    s.max = Math.max(s.max, s.data[i]);
                });
                s.data = d;
            });
        }
    });

    var NumberParser = function() {
        this.__numbers = [];
        this.__knownFormats = {
            '-.': /^[\-\.]?[0-9]+(\.[0-9]+)?$/,
            '-,': /^[\-,]?[0-9]+(,[0-9]+)?$/,
            ',.': /^[0-9]{1,3}(,[0-9]{3})(\.[0-9]+)?$/,
            '.,': /^[0-9]{1,3}(\.[0-9]{3})(,[0-9]+)?$/,
            ' .': /^[0-9]{1,3}( [0-9]{3})(\.[0-9]+)?$/,
            ' ,': /^[0-9]{1,3}( [0-9]{3})(,[0-9]+)?$/
        };
    };

    _.extend(NumberParser.prototype, {

        // get some input numbers
        learn: function(number) {
            this.__numbers.push(number);
        },

        // test all numbers against certain
        _getFormat: function() {
            var me = this,
                matches = {},
                bestMatch = ['', 0];
            _.each(me.__numbers, function(n) {
                _.each(me.__knownFormats, function(regex, fmt) {
                    if (matches[fmt] === undefined) matches[fmt] = 0;
                    if (regex.test(n)) {
                        matches[fmt] += 1;
                        if (matches[fmt] > bestMatch[1]) {
                            bestMatch[0] = fmt;
                            bestMatch[1] = matches[fmt];
                        }
                    }
                });
            });
            return bestMatch[0];
        },

        parse: function(raw) {
            var me = this,
                number = raw,
                fmt = this.__format;
            if (fmt === undefined) {
                fmt = this.__format = this._getFormat();
            }
            // clean number
            if (fmt[0] == ',' || fmt[0] == '.' || fmt[0] == ' ') {
                // remove kilo seperator
                number = number.replace(fmt[0], '');
            }
            if (fmt[1] != '.') {
                // replace decimal char w/ point
                number = number.replace(fmt[1], '.');
            }
            number = Number(number);
            return isNaN(number) ? raw : number;
        }
    });

}).call(this);