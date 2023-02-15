/* globals dw */

/*
 * Every visualization extends this class.
 * It provides the basic API between the chart editor
 * and the visualization render code.
 */

import { extend, isEqual, debounce } from 'underscore';
import get from '@datawrapper/shared/get.js';
import clone from '@datawrapper/shared/clone.js';
import events from './utils/events.mjs';
import { remove } from './utils/index.mjs';
import populateVisAxes from './utils/populateVisAxes.mjs';
import filterDatasetColumns from './utils/filterDatasetColumns.mjs';

const base = function () {}.prototype;

extend(base, {
    // visualizations can override these timeouts when it makes sense
    __rejectRenderedAfter: 5000,
    __resolveRenderedAfter: 300,

    setup() {
        this.__renderEvents = { resolve: events(), reject: events() };
        this.renderingComplete = debounce(this.__renderingComplete, this.__resolveRenderedAfter);
    },

    __beforeRender() {
        if (this.__rejectTimeout) clearTimeout(this.__rejectTimeout);
        this.__rejectTimeout = setTimeout(() => {
            // if the visualization didn't complete rendering within 5s
            // we want to reject the rendered() Promise
            this.__renderEvents.reject.fire(
                new Error(`timeout after ${this.__rejectRenderedAfter}ms`)
            );
        }, this.__rejectRenderedAfter);
        this.__rendered = false;
        // reset internal properties
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

    libraries(libraries) {
        if (!arguments.length) {
            return this.__libraries || {};
        }

        this.__libraries = libraries;
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
        // reset visualization cache to make sure
        // auto-populated columns get re-created
        me.__axisCache = undefined;
        filterDatasetColumns(chart, me.dataset);

        // set locale
        const { numeral } = me.libraries();
        if (numeral && chart.locales && chart.locales.numeral) {
            try {
                numeral.register('locale', 'dw', chart.locales.numeral);
            } catch (e) {
                if (e instanceof TypeError) {
                    // already registered
                } else {
                    throw e;
                }
            }
            numeral.locale('dw');
        }

        return me;
    },

    /**
     * Get or set the container element the vis was last rendered in
     * @param {HTMLElement} el
     * @returns {HTMLElement|void}
     */
    container(el) {
        if (!arguments.length) return this.__container;
        this.__container = el;
    },

    /**
     * Get or set the vis's outer container element
     */
    outerContainer(el) {
        if (!arguments.length) return this.__outerContainer;
        this.__outerContainer = el;
    },

    axes(returnAsColumns, noCache) {
        const me = this;
        const userAxes = get(me.chart().get(), 'metadata.axes', {});
        const visAxes = clone(me.meta.axes);

        const overrideKeys = Object.fromEntries(
            Object.entries(visAxes)
                .filter(([, axis]) => axis.optional && axis.overrideOptionalKey)
                .map(([, axis]) => [
                    axis.overrideOptionalKey,
                    me.chart().getMetadata(axis.overrideOptionalKey, false)
                ])
        );

        if (
            !noCache &&
            me.__axisCache &&
            isEqual(me.__axisCache.userAxes, userAxes) &&
            isEqual(me.__axisCache.overrideKeys, overrideKeys) &&
            me.__axisCache.transpose === me.chart().getMetadata('data.transpose')
        ) {
            return me.__axisCache[returnAsColumns ? 'axesAsColumns' : 'axes'];
        }

        const dataset = me.chart().dataset();

        const { axes, axesAsColumns } = populateVisAxes({
            dataset,
            userAxes,
            visAxes,
            overrideKeys
        });

        me.__axisCache = {
            axes: axes,
            axesAsColumns: axesAsColumns,
            userAxes: clone(userAxes),
            overrideKeys,
            transpose: me.chart().getMetadata('data.transpose')
        };

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

    __renderingComplete() {
        this.__renderEvents.resolve.fire();
        if (window.parent && window.parent.postMessage) {
            setTimeout(function () {
                window.parent.postMessage('datawrapper:vis:rendered', '*');
            }, 200);
        }
        clearTimeout(this.__rejectTimeout);
        this.__rendered = true;
        this.postRendering();
    },

    postRendering() {},

    /**
     * Use this to wait until a visualization has finished rendering
     *
     * @returns {Promise} resolves when the rendering is completed
     */
    rendered() {
        return new Promise((resolve, reject) => {
            this.__renderEvents.resolve.add(resolve);
            this.__renderEvents.reject.add(reject);
        });
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
            return (...args) => {
                let color = args[0];
                const applyDarkModeMap = this.__darkMode && this.__darkModeColorMap;
                this.__colors[color] = 1;
                if (this.__colorMap) {
                    if (applyDarkModeMap) color = this.__darkModeColorMap(...args);
                    return this.__colorMap(color);
                } else if (applyDarkModeMap) {
                    color = this.__darkModeColorMap(...args);
                }
                return color;
            };
        }

        this.__colorMap = cm;
    },

    initDarkMode(cb, cm) {
        this.__onDarkModeChange = cb;
        this.__darkModeColorMap = cm;
    },

    /**
     * set or get dark mode state of vis
     */
    darkMode(dm) {
        // can't initialize in __beforeRender because that sets it back to false on each render
        if (this.__darkMode === undefined) this.__darkMode = false;
        if (!arguments.length) return this.__darkMode;
        if (!this.__onDarkModeChange) return;

        this.__darkMode = dm;
        this.__onDarkModeChange(dm);
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
            this.__callbacks[eventType].forEach(function (cb) {
                if (typeof cb === 'function') cb(data);
            });
        }
    },

    /**
     * log error message
     * @param {string} message
     */
    showError(message) {
        const { allowEditing } = this.chart().flags();
        if (allowEditing) {
            // inside editor we show the error to the user directly
            this.container().innerHTML = `<div class="error"><p>${message}</p></div>`;
        }
        console.warn(message);
    }
});

export default base;
