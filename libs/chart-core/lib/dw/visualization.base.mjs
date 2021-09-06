/* globals dw */

/*
 * Every visualization extends this class.
 * It provides the basic API between the chart editor
 * and the visualization render code.
 */

import { extend, each, isEqual, isArray, filter, find, indexOf, map, range } from 'underscore';
import get from '@datawrapper/shared/get.js';
import clone from '@datawrapper/shared/clone.js';
import column from './dataset/column.mjs';
import { remove } from './utils/index.mjs';

const base = function() {}.prototype;

extend(base, {
    // called before rendering
    __init() {
        this.__renderedDfd = new Promise(resolve => {
            this.__renderedResolve = resolve;
        });
        this.__rendered = false;
        this.__colors = {};
        this.__callbacks = {};

        if (window.parent && window.parent.postMessage) {
            window.parent.postMessage('datawrapper:vis:init', '*');
        }
        return this;
    },

    render(el) {
        el.innerHTML = 'implement me!';
    },

    theme(theme) {
        if (!arguments.length) {
            if (typeof this.__theme === 'string') return dw.theme(this.__theme);
            return this.__theme;
        }

        this.__theme = theme;
        return this;
    },

    target(target) {
        if (!arguments.length) {
            return this.__target;
        }

        this.__target = target;
        return this;
    },

    size(width, height) {
        const me = this;
        if (!arguments.length) return [me.__w, me.__h];
        me.__w = width;
        me.__h = height;
        return me;
    },

    /**
     * short-cut for this.chart.get('metadata.visualize.*')
     */
    get(str, _default) {
        return get(this.chart().get(), 'metadata.visualize' + (str ? '.' + str : ''), _default);
    },

    chart(chart) {
        var me = this;
        if (!arguments.length) return me.__chart;
        me.dataset = chart.dataset();
        me.theme(chart.theme());
        me.__chart = chart;
        var columnFormat = get(chart.get(), 'metadata.data.column-format', {});
        var ignore = {};
        each(columnFormat, function(format, key) {
            ignore[key] = !!format.ignore;
        });
        if (me.dataset.filterColumns) me.dataset.filterColumns(ignore);
        return me;
    },

    axes(returnAsColumns, noCache) {
        const me = this;
        const userAxes = get(me.chart().get(), 'metadata.axes', {});

        if (!noCache && me.__axisCache && isEqual(me.__axisCache.userAxes, userAxes)) {
            return me.__axisCache[returnAsColumns ? 'axesAsColumns' : 'axes'];
        }

        const dataset = me.dataset;
        const usedColumns = {};
        const axes = {};
        const axesAsColumns = {};

        // get user preference
        each(me.meta.axes, (o, key) => {
            if (userAxes[key]) {
                let columns = userAxes[key];
                if (
                    columnExists(columns) &&
                    checkColumn(o, columns, true) &&
                    !!o.multiple === isArray(columns)
                ) {
                    axes[key] = o.multiple && !isArray(columns) ? [columns] : columns;
                    // mark columns as used
                    if (!isArray(columns)) columns = [columns];
                    each(columns, function(column) {
                        usedColumns[column] = true;
                    });
                }
            }
        });

        var checked = [];
        // auto-populate remaining axes
        each(me.meta.axes, (axisDef, key) => {
            function remainingRequiredColumns(accepts) {
                // returns how many required columns there are for the remaining axes
                // either an integer or "multiple" if there's another multi-column axis coming up
                function equalAccepts(a1, a2) {
                    if (typeof a1 === 'undefined' && typeof a2 !== 'undefined') return false;
                    if (typeof a2 === 'undefined' && typeof a1 !== 'undefined') return false;
                    if (a1.length !== a2.length) return false;

                    for (let i = 0; i < a1.length; i++) {
                        if (a2.indexOf(a1[i]) === -1) return false;
                    }
                    return true;
                }

                let res = 0;
                each(me.meta.axes, function(axisDef, key) {
                    if (checked.indexOf(key) > -1) return;
                    if (!equalAccepts(axisDef.accepts, accepts)) return;
                    if (typeof res === 'string') return;
                    if (axisDef.optional) return;
                    if (axisDef.multiple) {
                        res = 'multiple';
                        return;
                    }
                    res += 1;
                });
                return res;
            }
            function remainingAvailableColumns(dataset) {
                let count = 0;
                dataset.eachColumn(c => {
                    if (checkColumn(axisDef, c)) {
                        count++;
                    }
                });
                return count;
            }
            checked.push(key);
            if (axes[key]) return; // user has defined this axis already
            if (axisDef.optional) {
                // chart settings may override this
                if (
                    axisDef.overrideOptionalKey &&
                    get(me.chart().get(), 'metadata.' + axisDef.overrideOptionalKey, false)
                ) {
                    // now the axis is mandatory
                    axisDef.optional = false;
                }
            }
            if (!axisDef.optional) {
                // we only populate mandatory axes
                if (!axisDef.multiple) {
                    const accepted = filter(dataset.columns(), c => checkColumn(axisDef, c));
                    let firstMatch;
                    if (axisDef.preferred) {
                        // axis defined a regex for testing column names
                        const regex = new RegExp(axisDef.preferred, 'i');
                        firstMatch = find(accepted, function(col) {
                            return (
                                regex.test(col.name()) ||
                                (col.title() !== col.name() && regex.test(col.title()))
                            );
                        });
                    }
                    // simply use first colulmn accepted by axis
                    if (!firstMatch) firstMatch = accepted[0];
                    if (firstMatch) {
                        usedColumns[firstMatch.name()] = true; // mark column as used
                        axes[key] = firstMatch.name();
                    } else {
                        // try to auto-populate missing text column
                        if (indexOf(axisDef.accepts, 'text') >= 0) {
                            // try using the first text column in the dataset instead
                            const acceptedAllowUsed = filter(dataset.columns(), function(col) {
                                return indexOf(axisDef.accepts, col.type()) >= 0;
                            });
                            if (acceptedAllowUsed.length) {
                                axes[key] = acceptedAllowUsed[0].name();
                            } else {
                                // no other text column in dataset, so genetate one with A,B,C,D...
                                const col = column(
                                    key,
                                    map(range(dataset.numRows()), function(i) {
                                        return (
                                            (i > 25 ? String.fromCharCode(64 + i / 26) : '') +
                                            String.fromCharCode(65 + (i % 26))
                                        );
                                    }),
                                    'text'
                                );
                                dataset.add(col);
                                me.chart().dataset(dataset);
                                usedColumns[col.name()] = true;
                                axes[key] = col.name();
                            }
                        }
                    }
                } else {
                    const required = remainingRequiredColumns(axisDef.accepts);
                    let available = remainingAvailableColumns(dataset);

                    // fill axis with all accepted columns
                    axes[key] = [];
                    dataset.eachColumn(function(c) {
                        if (required === 'multiple' && axes[key].length) return;
                        else if (available <= required) return;

                        if (checkColumn(axisDef, c)) {
                            usedColumns[c.name()] = true;
                            axes[key].push(c.name());
                            available--;
                        }
                    });
                }
            } else {
                axes[key] = false;
            }
        });

        each(axes, (columns, key) => {
            if (!isArray(columns)) {
                axesAsColumns[key] = columns !== false ? me.dataset.column(columns) : null;
            } else {
                axesAsColumns[key] = [];
                each(columns, function(column, i) {
                    axesAsColumns[key][i] = column !== false ? me.dataset.column(column) : null;
                });
            }
        });

        me.__axisCache = {
            axes: axes,
            axesAsColumns: axesAsColumns,
            userAxes: clone(userAxes)
        };

        function columnExists(columns) {
            if (!isArray(columns)) columns = [columns];
            for (var i = 0; i < columns.length; i++) {
                if (!dataset.hasColumn(columns[i])) return false;
            }
            return true;
        }

        function checkColumn(axisDef, columns, allowMultipleUse) {
            if (!isArray(columns)) columns = [columns];
            columns = columns.map(el => (typeof el === 'string' ? dataset.column(el) : el));
            for (var i = 0; i < columns.length; i++) {
                if (
                    (!allowMultipleUse && usedColumns[columns[i].name()]) ||
                    indexOf(axisDef.accepts, columns[i].type()) === -1
                ) {
                    return false;
                }
            }
            return true;
        }

        return me.__axisCache[returnAsColumns ? 'axesAsColumns' : 'axes'];
    },

    keys() {
        const axesDef = this.axes();
        if (axesDef.labels) {
            const lblCol = this.dataset.column(axesDef.labels);
            const keys = [];
            lblCol.each(val => {
                keys.push(String(val));
            });
            return keys;
        }
        return [];
    },

    keyLabel(key) {
        return key;
    },

    /*
     * called by the core whenever the chart is re-drawn
     * without reloading the page
     */
    reset() {
        this.clear();
        const el = this.target();
        el.innerHTML = '';
        remove('.chart .filter-ui');
        remove('.chart .legend');
    },

    clear() {},

    renderingComplete() {
        if (window.parent && window.parent.postMessage) {
            setTimeout(function() {
                window.parent.postMessage('datawrapper:vis:rendered', '*');
            }, 200);
        }
        this.__renderedResolve();
        this.__rendered = true;
        this.postRendering();
    },

    postRendering() {},

    rendered() {
        return this.__renderedDfd;
    },

    /*
     * smart rendering means that a visualization is able to
     * re-render itself without having to instantiate it again
     */
    supportsSmartRendering() {
        return false;
    },

    colorMode(cm) {
        if (!arguments.length) {
            return this.__colorMode;
        }

        this.__colorMode = cm;
    },

    colorMap(cm) {
        if (!arguments.length) {
            return color => {
                this.__colors[color] = 1;
                if (this.__colorMap) {
                    return this.__colorMap(color);
                }
                return color;
            };
        }

        this.__colorMap = cm;
    },

    colorsUsed() {
        return Object.keys(this.__colors);
    },

    /**
     * register an event listener for custom vis events
     */
    on(eventType, callback) {
        if (!this.__callbacks[eventType]) {
            this.__callbacks[eventType] = [];
        }
        this.__callbacks[eventType].push(callback);
    },

    /**
     * fire a custom vis event
     */
    fire(eventType, data) {
        if (this.__callbacks && this.__callbacks[eventType]) {
            this.__callbacks[eventType].forEach(function(cb) {
                if (typeof cb === 'function') cb(data);
            });
        }
    }
});

export default base;
