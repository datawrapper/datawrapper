
// Every visualization must extend this class.
// It provides the basic API between the chart template
// page and the visualization class.

dw.visualization.base = (function() {}).prototype;

_.extend(dw.visualization.base, {

    // called before rendering
    __init: function() {
        this.__renderedDfd = $.Deferred();
        parent.$('body').trigger('datawrapper:vis:init');
    },

    render: function(el) {
        $(el).html('implement me!');
    },

    setTheme: function(theme) {
        if (!theme) return this;
        this.theme = theme;
        var attr_properties = ['horizontalGrid', 'verticalGrid', 'yAxis', 'xAxis'];
        _.each(attr_properties, function(prop) {
            // convert camel-case to dashes
            if (theme.hasOwnProperty(prop)) {
                for (var key in theme[prop]) {
                    // dasherize
                    var lkey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
                    if (!theme[prop].hasOwnProperty(lkey)) {
                        theme[prop][lkey] = theme[prop][key];
                    }
                }
            }
        });
        return this;
    },

    setSize: function(width, height) {
        var me = this;
        me.__w = width;
        me.__h = height;
        return me;
    },

    /**
     * short-cut for this.chart.get('metadata.visualize.*')
     */
    get: function(str, _default) {
        return this.chart.get('metadata.visualize.'+str, _default);
    },

    warn: function(str) {
        if (dw.backend && _.isFunction(dw.backend.notify)) dw.backend.notify(str);
    },

    /**
     * returns a signature for this visualization which will be used
     * to test correct rendering of the chart in different browsers.
     * See raphael-chart.js for example implementation.
     */
    signature: function() {
        // nothing here, please overload
    },

    translate: function(str) {
        var locale = this.meta.locale, lang = this.lang;
        return locale[str] ? locale[str][lang] || locale[str] : str;
    },

    checkBrowserCompatibility: function(){
        return true;
    },

    setChart: function(chart) {
        var me = this;
        me.dataset = chart.dataset();
        me.setTheme(chart.theme());
        me.chart = chart;
        me.dataset.filterSeries(chart.get('metadata.data.ignore-columns', {}));
    },

    axes: function(returnAsColumns) {
        var me = this,
            dataset = me.dataset,
            usedColumns = {},
            defAxes = {},
            errors = [];
        _.each(me.meta.axes, function(axisDef, key) {
            function checkColumn(col) {
                return !usedColumns[col.name()] &&
                    _.indexOf(axisDef.accepts, col.type()) >= 0;
            }
            function errMissingColumn() {
                var msg = dw.backend ?
                        dw.backend.messages.insufficientData :
                        'The visualization needs at least one column of the type %type to populate axis %key';
                errors.push(msg.replace('%type', axisDef.accepts).replace('%key', key));
            }
            if (!axisDef.optional) {
                if (!axisDef.multiple) {
                    // find first colulmn accepted by axis
                    var c = _.find(dataset.columns(), checkColumn);
                    if (c) {
                        usedColumns[c.name()] = true; // mark column as used
                        defAxes[key] = c.name();
                    } else {
                        errMissingColumn();
                    }
                } else {
                    defAxes[key] = [];
                    dataset.eachColumn(function(c) {
                        if (checkColumn(c)) {
                            usedColumns[c.name()] = true;
                            defAxes[key].push(c.name());
                        }
                    });
                    if (!defAxes[key].length) {
                        errMissingColumn();
                    }
                }
            } else {
                defAxes[key] = false;
            }
        });
        if (errors.length) {
            if (dw.backend) me.warn(errors.join('<br />'));
            return false;
        }
        defAxes = me.chart.get('metadata.axes', defAxes);
        if (returnAsColumns) {
            _.each(defAxes, function(columns, key) {
                if (!_.isArray(columns)) {
                    defAxes[key] = columns !== false ? me.dataset.column(columns) : null;
                } else {
                    _.each(columns, function(column, i) {
                        defAxes[key][i] = column !== false ? me.dataset.column(column) : null;
                    });
                }
            });
        }
        return defAxes;
    },

    keys: function() {
        var me = this,
            axesDef = me.axes();
        if (axesDef.labels) {
            var lblCol = me.dataset.column(axesDef.labels),
                fmt = me.chart.columnFormatter(lblCol),
                keys = [];
            lblCol.each(function(val) {
                keys.push(String(fmt(val)));
            });
            return keys;
        }
        return [];
    },

    /*
     * called by the core whenever the chart is re-drawn
     * without reloading the page
     */
    reset: function() {
        this.clear();
        $('#chart').html('').off('click').off('mousemove').off('mouseenter').off('mouseover');
        $('.chart .filter-ui').remove();
        $('.chart .legend').remove();
    },

    clear: function() {

    },

    renderingComplete: function() {
        this.__renderedDfd.resolve();
    },

    rendered: function() {
        return this.__renderedDfd.promise();
    }

});

