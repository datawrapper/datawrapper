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
                        dataType: "text", // NOTE (edouard): Without that jquery try to parse the content and return a Document
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
            me.__data = data;
            me.__loaded = true;
            me.__parser = parser;
            me._processData(data);
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
            // then we let parse the numbers
            _.each(data.series, function(s) {
                s.min = Number.MAX_VALUE;
                s.max = -Number.MAX_VALUE;
                s.total = 0;
                _.each(s.data, function(number, i) {
                    s.data[i] = numParser.parse(number);
                    if (!isNaN(s.data[i])) {
                        // this is buggy in IE7
                        s.min = Math.min(s.min, s.data[i]);
                        s.max = Math.max(s.max, s.data[i]);
                        s.total += s.data[i];
                    }
                });
                // store copy of original data in origdata
                s.origdata = s.data.slice();
            });
            // check if row names contain dates
            if (me.hasRowNames()) {
                var dateParser = new DateParser();
                me.eachRow(function(i) {
                    dateParser.learn(me.rowName(i));
                });
                if (dateParser.validFormat()) {
                    me.__dateFormat = dateParser.__format;
                    me.__rowDates = [];
                    me.eachRow(function(i) {
                        me.__rowDates.push(dateParser.parse(me.rowName(i)));
                    });
                }
            }
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
            var me = this, k;
            if (!me.hasRowNames()) return '';
            k = me.__data.rowNames.length;
            return me.__data.rowNames[(i + k) % k];
        },

        rowNameLabel: function() {
            return this.__data.rowNameLabel !== undefined ? this.__data.rowNameLabel : '';
        },

        /*
         * removes every row except the one with index i
         * and updates min, max and total of each series
         */
        filterRows: function(rows) {
            this.eachSeries(function(s) {
                var d = [];
                s.total = 0;
                s.min = Number.MAX_VALUE;
                s.max = Number.MAX_VALUE*-1;
                _.each(rows, function(i) {
                    d.push(s.origdata[i]);
                    s.total += s.origdata[i];
                    s.min = Math.min(s.min, s.origdata[i]);
                    s.max = Math.max(s.max, s.origdata[i]);
                });
                s.data = d;
            });
        },

        /*
         * returns a tree data structure from this dataset
         */
        parseTree: function(row) {
            var tree = { children: [], depth: 0 };
            this.eachSeries(function(s) {
                var parts = s.name.split('>');
                var node = tree;
                _.each(parts, function(p, i) {
                    parts[i] = p = p.trim();
                    var found = false;
                    _.each(node.children, function(c) {
                        if (c.name.trim() == p) {
                            node = c;
                            found = true;
                            return false;
                        }
                    });
                    if (!found) { // child not found, create new one
                        var n = { name: p, children: [], _series: s, _row: 0, depth: i+1 };
                        if (i == parts.length-1) n.value = s.data[row];
                        node.children.push(n);
                        node = n;
                    }
                });
            });
            return tree;
        },

        serializeDelimited: function() {
            var me = this;
            var data = [[]];

            if (me.hasRowNames()) data[0].push('');

            function isNone(val) {
                return val === null || val === undefined || (_.isNumber(val) && isNaN(val));
            }

            _.each(me.series(), function(s) {
                data[0].push((!isNone(s.name) ? s.name : ''));
            });

            me.eachRow(function(row) {
                var tr = [];
                if (me.hasRowNames()) {
                    tr.push(!isNone(me.rowName(row)) ? me.rowName(row) : '');
                }
                me.eachSeries(function(s, i) {
                    var val = s.data[row];
                    tr.push((!isNone(s.data[row]) ? val : 'n/a'));
                });
                data.push(tr);
            });

            return data.map(function(row) { return row.join(me.__parser.delimiter); }).join('\n');
        },

        /*
         * removes ignored series from dataset
         */
        filterSeries: function(ignore) {
            var me = this;
            me.__data.series = me.__data.series.filter(function(s) {
                return !ignore[s.name];
            });
        },

        /**
         * Returns true if the datasets row labels could
         * correctly be parsed as date values.
         */
        isTimeSeries: function() {
            return this.__rowDates !== undefined;
        },

        /**
         * Returns a Date object for a given row.
         */
        rowDate: function(i) {
            if (i < 0) i += this.__rowDates.length;
            return this.__rowDates[i];
        },

        /**
         * Returns (a copy of) the list of all rows Date objects.
         */
        rowDates: function() {
            return this.__rowDates.slice(0);
        },

        /**
         * Returns array of min/max values
         */
        minMax: function() {
            var minmax = [Number.MAX_VALUE, -Number.MAX_VALUE];
            this.eachSeries(function(s) {
                minmax[0] = Math.min(minmax[0], s.min);
                minmax[1] = Math.max(minmax[1], s.max);
            });
            return minmax;
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
            if (raw === null || raw === undefined || raw === '') return 'n/a';
            if (fmt === undefined) {
                fmt = this.__format = this._getFormat();
            }
            // normalize number
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

    var DateParser = function() {
        var me = this;
        me.__dates = [];
        me.__knownFormats = {
            'year': /^([12][0-9]{3})$/,
            'quarter': /^([12][0-9]{3}) ?[\-\/Q|]([1234])$/,
            'month': /^([12][0-9]{3}) ?[-\/\.M](0[1-9]|1[0-2])$/,
            'date': /^([12][0-9]{3})[-\/](0[1-9]|1[0-2])[-\/]([0-2][0-9]|3[01])$/
        };
    };

    _.extend(DateParser.prototype, {
        // get some input numbers
        learn: function(date_str) {
            this.__dates.push(date_str);
        },

        // test all strings against the known formats
        _getFormat: function() {
            var me = this, format = false;
            _.each(me.__knownFormats, function(regex, fmt) {
                var valid = true;
                _.each(me.__dates, function(n) {
                    if (!regex.test(n)) {
                        valid = false;
                        return false;
                    }
                });
                if (valid) {
                    format = fmt;
                    return false;
                }
            });
            return format;
        },

        validFormat: function() {
            var me = this;
            me.__format = me._getFormat();
            return me.__format !== false;
        },

        parse: function(raw) {
            var me = this,
                date = raw,
                fmt = me.__format = me.__format === undefined ? me._getFormat() : me.__format;

            if (fmt === false) return raw;
            var regex = me.__knownFormats[fmt],
                m = raw.match(regex);

            if (!m) return raw;
            switch (fmt) {
                case 'year': return new Date(m[1], 0, 1);
                case 'quarter': return new Date(m[1], (m[2]-1) * 3, 1);
                case 'month': return new Date(m[1], (m[2]-1), 1);
                case 'date': return new Date(m[1], (m[2]-1), m[3]);
            }
            return raw;
        }
    });

}).call(this);