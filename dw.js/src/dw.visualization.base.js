
// Every visualization must extend this class.
// It provides the basic API between the chart template
// page and the visualization class.

dw.visualization.base = (function() {}).prototype;

_.extend(dw.visualization.base, {

    // called before rendering
    __init: function() {
        this.__renderedDfd = $.Deferred();
        if (window.parent && window.parent['postMessage']) {
            window.parent.postMessage('datawrapper:vis:init', '*');
        }
        return this;
    },

    render: function(el) {
        $(el).html('implement me!');
    },

    theme: function(theme) {
        if (!arguments.length) return this.__theme;
        this.__theme = theme;
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

    size: function(width, height) {
        var me = this;
        if (!arguments.length) return [me.__w, me.__h];
        me.__w = width;
        me.__h = height;
        return me;
    },

    /**
     * short-cut for this.chart.get('metadata.visualize.*')
     */
    get: function(str, _default) {
        return this.chart().get('metadata.visualize.'+str, _default);
    },

    notify: function(str) {
        if (dw.backend && _.isFunction(dw.backend.notify)) {
            return dw.backend.notify(str);
        } else {
            if (window.parent && window.parent['postMessage']) {
                window.parent.postMessage('notify:'+str, '*');
            } else if (window['console']) {
                console.log(str);
            }
        }
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

    chart: function(chart) {
        var me = this;
        if (!arguments.length) return me.__chart;
        me.dataset = chart.dataset();
        me.theme(chart.theme());
        me.__chart = chart;
        var columnFormat = chart.get('metadata.data.column-format', {});
        var ignore = {};
        _.each(columnFormat, function(format, key) {
            ignore[key] = !!format.ignore;
        });
        me.dataset.filterColumns(ignore);
        return me;
    },

    axes: function(returnAsColumns) {
        var me = this,
            dataset = me.dataset,
            usedColumns = {},
            axes = {},
            axesDef,
            axesAsColumns = {},
            errors = [];

        // get user preference
        axesDef = me.chart().get('metadata.axes', {});
        _.each(me.meta.axes, function(o, key) {
            if (axesDef[key]) {
                var columns = axesDef[key];
                if (columnExists(columns)) {
                    axes[key] = columns;
                    // mark columns as used
                    if (!_.isArray(columns)) columns = [columns];
                    _.each(columns, function(column) {
                        usedColumns[column] = true;
                    });
                }
            }
        });

        // auto-populate remaining axes
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
            if (axes[key]) return;  // user has defined this axis already
            if (!axisDef.optional) {
                if (!axisDef.multiple) {
                    // find first colulmn accepted by axis
                    var c = _.find(dataset.columns(), checkColumn);
                    if (c) {
                        usedColumns[c.name()] = true; // mark column as used
                        axes[key] = c.name();
                    } else {
                        // try to auto-populate missing text column
                        if (_.indexOf(axisDef.accepts, 'text') >= 0) {
                            var col = dw.column(key, _.map(_.range(dataset.numRows()), function(i) {
                                return (i > 25 ? String.fromCharCode(64+i/26) : '') + String.fromCharCode(65+(i%26));
                            }), 'text');
                            dataset.add(col);
                            me.chart().dataset(dataset);
                            usedColumns[col.name()] = true;
                            axes[key] = col.name();
                        } else {
                            errMissingColumn();
                        }
                    }
                } else {
                    axes[key] = [];
                    dataset.eachColumn(function(c) {
                        if (checkColumn(c)) {
                            usedColumns[c.name()] = true;
                            axes[key].push(c.name());
                        }
                    });
                    if (!axes[key].length) {
                        errMissingColumn();
                    }
                }
            } else {
                axes[key] = false;
            }
        });

        if (errors.length) {
            me.notify(errors.join('<br />'));
        }

        _.each(axes, function(columns, key) {
            if (!_.isArray(columns)) {
                axesAsColumns[key] = columns !== false ? me.dataset.column(columns) : null;
            } else {
                axesAsColumns[key] = [];
                _.each(columns, function(column, i) {
                    axesAsColumns[key][i] = column !== false ? me.dataset.column(column) : null;
                });
            }
        });

        me.axes = function(returnAsColumns) {
            return returnAsColumns ? axesAsColumns : axes;
        };

        function columnExists(columns) {
            if (!_.isArray(columns)) columns = [columns];
            for (var i=0; i<columns.length; i++) {
                if (!dataset.hasColumn(columns[i])) return false;
            }
            return true;
        }

        return me.axes(returnAsColumns);
    },

    keys: function() {
        var me = this,
            axesDef = me.axes();
        if (axesDef.labels) {
            var lblCol = me.dataset.column(axesDef.labels),
                fmt = me.chart().columnFormatter(lblCol),
                keys = [];
            lblCol.each(function(val) {
                keys.push(String(fmt(val)));
            });
            return keys;
        }
        return [];
    },

    keyLabel: function(key) {
        return key;
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
        if (window.parent && window.parent['postMessage']) {
            window.parent.postMessage('datawrapper:vis:rendered', '*');
        }
        this.__renderedDfd.resolve();
    },

    rendered: function() {
        return this.__renderedDfd.promise();
    },

    /*
     * smart rendering means that a visualization is able to
     * re-render itself without having to instantiate it again
     */
    supportsSmartRendering: function() {
        return false;
    },

    /*
     * this hook is used for optimizing the thumbnails on Datawrapper
     * the function is expected to return the svg element that contains
     * the elements to be rendered in the thumbnails
     */
    _svgCanvas: function() {
        return false;
    }

});

