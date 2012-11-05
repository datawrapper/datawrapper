//      Datawrapper
(function(){

    // Initial Setup
    // -------------
    var root = this;

    // The top-level namespace. All public Backbone classes and modules will be
    // attached to this. Exported for both CommonJS and the browser.
    var Datawrapper;
    if (typeof exports !== 'undefined') {
        Datawrapper = exports;
    } else {
        Datawrapper = root.Datawrapper = { Parsers: {} };
    }

    // Current version of the library
    Datawrapper.VERSION = '0.7.1';


    // Datawrapper.Core
    // ----------------

    var Core = Datawrapper.Core = function() {
    };

    _.extend(Core, {

        initialize: function() {
            this.initLanguageLinks();
        },

        initLanguageLinks: function() {
            $('a[href|=#lang]').click(function(evt) {
                evt.preventDefault();
                $.ajax({
                    url: '/api/account/lang',
                    type: 'PUT',
                    data: JSON.stringify({ lang: $(evt.target).attr('href').substr(6) }),
                    processData: false,
                    success: function(data) {
                        location.reload();
                    }
                });
            });
        }

    });



}).call(this);(function(){

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

}).call(this);(function(){

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
            if (sortByFirstValue) {
                ds = ds.sort(function(a,b) {
                    return b.data[0] > a.data[0] ? 1 : -1;
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
            if (col === undefined) return false;
            var hl = this.get('metadata.visualize.highlighted-series');
            return !_.isArray(hl) || hl.length === 0 || _.indexOf(hl, col.name) >= 0;
        },

        setLocale: function(locale, metric_prefix) {
            this.locale = locale;
            this.metric_prefix = metric_prefix;
        },

        formatValue: function(val, full, round) {
            var me = this,
                format = me.get('metadata.describe.number-format'),
                div = Number(me.get('metadata.describe.number-divisor')),
                append = me.get('metadata.describe.number-append', '').replace(' ', '&nbsp;'),
                prepend = me.get('metadata.describe.number-prepend', '').replace(' ', '&nbsp;');

            if (format != '-') {
                var culture = Globalize.culture(me.locale);
                val = Number(val) / Math.pow(10, div);
                if (round || val == Math.round(val)) format = format.substr(0,1)+'0';
                val = Globalize.format(val, format);
            }

            return full ? prepend + val + append : val;
        },

        filterRow: function(row) {
            this.__dataset.filterRows([row]);
        },

        filterRows: function(rows) {
            this.__dataset.filterRows(rows);
        }

    });

}).call(this);(function(){

    // Datawrapper.Theme
    // -----------------

    // Every theme will inherit the properties of this
    // theme. They can override everything or just a bit
    // of them. Also, every theme can extend any other
    // existing theme.
    Datawrapper.Themes = {};

    Datawrapper.Themes.Base = _.extend({}, {

        colors: {
            palette: ['#6E7DA1', '#64A4C4', '#53CCDD',  '#4EF4E8'],
            positive: '#85B4D4',
            negative: '#E31A1C',
            // colors background and text needs to be set in CSS as well!
            background: '#ffffff',
            text: '#000000'
        },

        locale: 'de_DE',

        lineChart: {
            strokeWidth: {
                highlight: 3,
                normal: 1
            },
            hoverDotRadius: 3,
            maxLabelWidth: 80
        },

        barChart: {

        },

        columnChart: {
            cutGridLines: false
        },

        horizontalGrid: {
            stroke: '#e9e9e9'
        },

        yTicks: false,

        xAxis: {
            stroke: '#333'
        },

        yAxis: {
            'stroke-width': 1
        },

        padding: {
            left: 0,
            right: 20,
            bottom: 30,
            top: 10
        },

        leftPadding: 20,
        rightPadding: 20,
        lineLabelWidth: 20,
        yLabelOffset: 8,

        bottomPadding: 40,
        xLabelOffset: 20,

        hover: true,
        tooltip: true,

        hpadding: 0,
        vpadding: 10,

        minWidth: 400
    });

}).call(this);(function(){

      // Datawrapper.Parsers.Delimited
      // -----------------------------

   /**
    * Smart delimited data parser.
    * - Handles CSV and other delimited data.
    * Includes auto-guessing of delimiter character
    * Parameters:
    *   options
    *     delimiter : ","
    */
   Datawrapper.Parsers.Delimited = function(options) {
      options = options || {};

      this.delimiter = options.delimiter || ",";

      this.quoteChar = options.quoteChar || "\"";

      this.skipRows = options.skipRows || 0;

      this.emptyValue = options.emptyValue || null;

      this.transpose = options.transpose || false;

      this.firstRowIsHeader = options.firstRowIsHeader !== undefined ? options.firstRowIsHeader : true;

      this.firstColumnIsHeader = options.firstRowIsHeader !== undefined ? options.firstColumnIsHeader : true;

      this.getDelimiterPatterns = function(delimiter, quoteChar) {
         return new RegExp(
            (
            // Delimiters.
            "(\\" + delimiter + "|\\r?\\n|\\r|^)" +
            // Quoted fields.
            "(?:" + quoteChar + "([^" + quoteChar + "]*(?:" + quoteChar + "\"[^" + quoteChar + "]*)*)" + quoteChar + "|" +
            // Standard fields.
            "([^" + quoteChar + "\\" + delimiter + "\\r\\n]*))"), "gi");
      };

      this.__delimiterPatterns = this.getDelimiterPatterns(this.delimiter, this.quoteChar);
   };


   _.extend(Datawrapper.Parsers.Delimited.prototype, Datawrapper.Parsers.prototype, {

      parse: function(data) {

         this.__rawData = data;

         if (this.delimiter == 'auto') {
            this.delimiter = this.guessDelimiter(data, this.skipRows);
            this.__delimiterPatterns = this.getDelimiterPatterns(this.delimiter, this.quoteChar);

         }
         var columns = [],
            closure = this.delimiter != '|' ? '|' : '#',
            arrData;

         data = closure + data.replace(/\s+$/g, '') + closure;

         var parseCSV = function(delimiterPattern, strData, strDelimiter) {
            // implementation and regex borrowed from:
            // http://www.bennadel.com/blog/1504-Ask-Ben-Parsing-CSV-Strings-With-Javascript-Exec-Regular-Expression-Command.htm

            // Check to see if the delimiter is defined. If not,
            // then default to comma.
            strDelimiter = (strDelimiter || ",");

            // Create an array to hold our data. Give the array
            // a default empty first row.
            var arrData = [
               []
            ];

            // Create an array to hold our individual pattern
            // matching groups.
            var arrMatches = null,
               strMatchedValue;

            // Keep looping over the regular expression matches
            // until we can no longer find a match.
            while (arrMatches = delimiterPattern.exec(strData)) {
               // Get the delimiter that was found.
               var strMatchedDelimiter = arrMatches[1];

               // Check to see if the given delimiter has a length
               // (is not the start of string) and if it matches
               // field delimiter. If id does not, then we know
               // that this delimiter is a row delimiter.
               if (
               strMatchedDelimiter.length && (strMatchedDelimiter != strDelimiter)) {

                  // Since we have reached a new row of data,
                  // add an empty row to our data array.
                  arrData.push([]);

               }


               // Now that we have our delimiter out of the way,
               // let's check to see which kind of value we
               // captured (quoted or unquoted).
               if (arrMatches[2]) {

                  // We found a quoted value. When we capture
                  // this value, unescape any double quotes.
                  strMatchedValue = arrMatches[2].replace(new RegExp("\"\"", "g"), "\"");

               } else {

                  // We found a non-quoted value.
                  strMatchedValue = arrMatches[3];

               }


               // Now that we have our value string, let's add
               // it to the data array.
               arrData[arrData.length - 1].push(strMatchedValue);
            }

            // remove closure
            if (arrData[0][0].substr(0,1) == closure) {
               arrData[0][0] = arrData[0][0].substr(1);
            }
            var p = arrData.length-1,
               q = arrData[p].length-1,
               r = arrData[p][q].length-1;
            if (arrData[p][q].substr(r) == closure) {
               arrData[p][q] = arrData[p][q].substr(0, r);
            }

            // Return the parsed data.
            return (arrData);
         },

         transpose = function(arrMatrix) {
            // borrowed from:
            // http://www.shamasis.net/2010/02/transpose-an-array-in-javascript-and-jquery/
            var a = arrMatrix,
               w = a.length ? a.length : 0,
               h = a[0] instanceof Array ? a[0].length : 0;
            if (h === 0 || w === 0) {
               return [];
            }
            var i, j, t = [];
            for (i = 0; i < h; i++) {
               t[i] = [];
               for (j = 0; j < w; j++) {
                  t[i][j] = a[j][i];
               }
            }
            return t;
         };

         parseDataArray = function(arrData, skipRows, emptyValue, firstRowIsHeader, firstColIsHeader) {
            var series = [],
               seriesNames = {},
               rowCount = arrData.length,
               columnCount = arrData[0].length,
               rowIndex = skipRows;

            // compute series
            var srcColumns = [];
            if (firstRowIsHeader) {
               srcColumns = arrData[rowIndex];
               rowIndex++;
            }

            // check that columns names are unique and not empty

            for (var c=0; c<columnCount; c++) {
               var col = _.isString(srcColumns[c]) ? srcColumns[c].replace(/^\s+|\s+$/g, '') : '',
                  suffix = col !== '' ? '' : 1;
               col = col !== '' ? col : 'X.';
               while (seriesNames[col+suffix] !== undefined) {
                  suffix = suffix === '' ? 1 : suffix + 1;
               }
               series.push({ name: col+suffix, data: [] });
               seriesNames[col+suffix] = true;
            }

            for (; rowIndex < rowCount; rowIndex++) {
               _.each(series, function(s, i) {
                  s.data.push(arrData[rowIndex][i] !== '' ? arrData[rowIndex][i] : emptyValue);
               });
            }

            var header;
            if (firstColIsHeader) {
               header = series[0];
               series = series.slice(1);
            }

            return {
               series: series,
               rowNames: header ? header.data : undefined,
               rowNameLabels: header ? header.name : undefined
            };
         }, // end parseDataArray

         arrData = parseCSV(this.__delimiterPatterns, data, this.delimiter);
         if (this.transpose) {
            arrData = transpose(arrData);
            // swap row/column header setting
            var t = this.firstRowIsHeader;
            this.firstRowIsHeader = this.firstColumnIsHeader;
            this.firstColumnIsHeader = t;
         }
         return parseDataArray(arrData, this.skipRows, this.emptyValue, this.firstRowIsHeader, this.firstColumnIsHeader);
      },

      guessDelimiter: function(strData) {
         // find delimiter which occurs most often
         var maxMatchCount = 0,
            k = -1,
            me = this,
            delimiters = ['\t', ',',';','|'];
         _.each(delimiters, function(delimiter, i) {
            var regex = me.getDelimiterPatterns(delimiter, me.quoteChar),
               c = strData.match(regex).length;
            if (c > maxMatchCount) {
               maxMatchCount = c;
               k = i;
            }
         });
         return delimiters[k];
      }

   });


}(this, _));(function(){

    // Datawrapper.Visualization.Base
    // ------------------------------

    // Every visualization should extend this class.
    // It provides the basic API between the chart template
    // page and the visualization class.

    Datawrapper.Visualizations = {};

    var Base = function() {

    };

    _.extend(Base.prototype, {

        render: function(el) {
            $(el).html('implement me!');
        },

        setTheme: function(theme) {
            this.theme = theme;
        },

        load: function(chart, callback) {
            var me = this;
            this.chart = chart;
            chart.dataset(function(ds) {
                me.dataset = ds;
                callback.call(me, me);
            });
        },

        getMaxChartHeight: function(el) {
            var ch = 0; // summed height of children, 10px for top & bottom margin
            $('body > *').each(function(i, el) {
                var t = el.tagName.toLowerCase();
                if (t != 'script' && el.id != 'chart' && !$(el).hasClass('tooltip')) {
                    ch += $(el).outerHeight(true);
                }
            });
            // subtract body padding
            //ch += $('body').innerHeight() - $('body').height();
            var m = $('#chart').css('margin-top'),
                maxH = $(window).height() - ch - Number(m.substr(0, m.length-2));
            // IE Fix
            if ($.browser.msie) maxH -= 10;
            return maxH;
        },

        /**
         * short-cut for this.chart.get('metadata.visualizes.*')
         */
        get: function(str, _default) {
            return this.chart.get('metadata.visualize.'+str, _default);
        },

        warn: function(str) {
            var warning = $('<div>' + str + '</div>');
            warning.css({
                'background-color': '#FCF8E3',
                'border': '1px solid #FBEED5',
                'border-radius': '4px 4px 4px 4px',
                'color': '#a07833',
                'margin-bottom': '18px',
                'padding': '8px 35px 8px 14px',
                'text-shadow': '0 1px 0 rgba(255, 255, 255, 0.5)',
                'left': '10%',
                'right': '10%',
                'text-align': 'center',
                position: 'absolute'
            });
            $('body').prepend(warning);
            warning.hide();
            warning.fadeIn();
        }

    });

    Datawrapper.Visualizations.Base = Base.prototype;

}).call(this);