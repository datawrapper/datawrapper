import { isArray, isUndefined, indexOf } from 'underscore';
import isPlainObject from 'lodash/isPlainObject.js';
import get from '@datawrapper/shared/get.js';
import set from '@datawrapper/shared/set.js';
import objectDiff from '@datawrapper/shared/objectDiff.js';
import PostEvent from '@datawrapper/shared/postEvent.js';

import json from './dataset/json.mjs';
import delimited from './dataset/delimited.mjs';
import { name, width, getMaxChartHeight } from './utils/index.mjs';
import events from './utils/events.mjs';
import reorderColumns from './dataset/reorderColumns.mjs';
import applyChanges from './dataset/applyChanges.mjs';
import addComputedColumns from './dataset/addComputedColumns.mjs';
import { outerHeight, getNonChartHeight } from './utils/getNonChartHeight.mjs';

/**
 * Chart
 * @module dw.chart
 */
export default function (attributes) {
    // private methods and properties
    let dataset;
    let theme;
    let metricPrefix;
    let locale;
    let flags = {};
    let visualization;

    const changeCallbacks = events();
    const datasetChangeCallbacks = events();

    const _assets = {};
    let _translations = {};
    let _ds;

    // public interface
    const chart = {
        /**
         * @function chart.get
         */
        get(key, _default) {
            return get(attributes, key, _default);
        },

        getMetadata(key, _default) {
            return get(attributes, `metadata.${key}`, _default);
        },

        set(key, value) {
            if (set(attributes, key, value)) {
                changeCallbacks.fire(chart, key, value);
            }
            return this;
        },

        setMetadata(key, value) {
            return chart.set(`metadata.${key}`, value);
        },

        getElementBounds(element) {
            const rootBounds = visualization.target().getBoundingClientRect();
            const elementBounds = element.getBoundingClientRect();

            return {
                top: elementBounds.top - rootBounds.top,
                right: elementBounds.right - rootBounds.left,
                bottom: elementBounds.bottom - rootBounds.top,
                left: elementBounds.left - rootBounds.left,
                width: elementBounds.width,
                height: elementBounds.height
            };
        },

        // loads the dataset and returns a deferred
        load(csv, externalData) {
            const dsopts = {
                chartId: chart.get('id'),
                firstRowIsHeader: chart.get('metadata.data.horizontal-header', true),
                transpose: chart.get('metadata.data.transpose', false)
            };

            if ((csv || csv === '') && !externalData) dsopts.csv = csv;
            else dsopts.url = externalData || 'data.csv';

            const datasource = chart.get('metadata.data.json') ? json(dsopts) : delimited(dsopts);

            return datasource.dataset().then(ds => {
                this.dataset(ds);
                datasetChangeCallbacks.fire(chart, ds);
                return ds;
            });
        },

        /**
         * Getter/setter for the dw.dataset class. This method
         * can also be used to "reset" the current dataset by passing
         * true as argument. This will re-apply changes, column sorting
         * and computed columns to the existing dataset.
         *
         * @param {dw.dataset|true}
         *
         * @returns dataset
         */
        dataset(ds) {
            if (arguments.length) {
                if (ds !== true) _ds = ds;
                dataset = chart.get('metadata.data.json')
                    ? _ds
                    : reorderColumns(chart, applyChanges(chart, addComputedColumns(chart, _ds)));
                if (ds === true) return dataset;
                return chart;
            }
            return dataset;
        },

        /**
         * This helper method is used by the chart editor to inject
         * a dataset which has computed columns, changes and column
         * ordering already applied.
         *
         * @param {dw.dataset} ds
         */
        setDataset(ds) {
            dataset = ds;
        },

        // sets or gets the theme
        theme(_theme) {
            if (arguments.length) {
                theme = _theme;
                return chart;
            }
            return theme || {};
        },

        // sets or gets the visualization
        vis(_vis) {
            if (arguments.length) {
                visualization = _vis;
                visualization.chart(chart);
                return chart;
            }
            return visualization;
        },

        // returns true if the user has set any highlights
        hasHighlight() {
            var hl = chart.get('metadata.visualize.highlighted-series');
            return isArray(hl) && hl.length > 0;
        },

        isHighlighted(obj) {
            if (isUndefined(obj) === undefined) return false;
            const hl = chart.get('metadata.visualize.highlighted-series');
            const objName = name(obj);
            return !isArray(hl) || hl.length === 0 || indexOf(hl, objName) >= 0;
        },

        locale(_locale, callback) {
            if (arguments.length) {
                locale = _locale.replace('_', '-');
                if (!locale) locale = 'en-US';
                if (typeof callback === 'function') callback();
                return chart;
            }
            return locale;
        },

        metricPrefix(_metricPrefix) {
            if (arguments.length) {
                metricPrefix = _metricPrefix;
                return chart;
            }
            return metricPrefix;
        },

        inEditor: () => {
            try {
                return (
                    window.parent !== window &&
                    window.parent.dw &&
                    window.parent.dw.backend &&
                    window.parent.dw.backend.hooks
                );
            } catch (ex) {
                return false;
            }
        },

        createPostEvent() {
            const chartId = chart.get('id');
            const { isIframe } = flags;
            return PostEvent(chartId, isIframe);
        },

        // sets or gets the flags
        flags(_flags) {
            if (arguments.length) {
                flags = _flags;
                return chart;
            }
            return flags;
        },

        render(outerContainer) {
            if (!visualization || !theme || !dataset) {
                throw new Error('cannot render the chart!');
            }

            const isIframe = flags.isIframe;
            const container = chart.vis().target();

            visualization.chart(chart);
            visualization.container(container);

            // compute chart dimensions
            const w = width(container);
            const h = isIframe
                ? getMaxChartHeight()
                : chart.getMetadata('publish.chart-height') || 400;

            const heightMode = chart.getHeightMode();

            // only render if iframe has valid dimensions
            if (heightMode === 'fixed' ? w <= 0 : w <= 0 || h <= 0) {
                console.warn('Aborting chart rendering due to invalid container dimensions');

                window.clearInterval(this.__resizingInterval);
                this.__resizingInterval = setInterval(postMessage, 1000);
                postMessage();

                return;
            }

            // set chart mode class
            [container, outerContainer].forEach(el => {
                el.classList.toggle('vis-height-fit', heightMode === 'fit');
                el.classList.toggle('vis-height-fixed', heightMode === 'fixed');
            });

            // set mobile class
            const breakpoint = get(theme, `vis.${chart.type}.mobileBreakpoint`, 450);
            outerContainer.classList.toggle('is-mobile', outerContainer.clientWidth <= breakpoint);

            // really needed?
            outerContainer.classList.add('vis-' + visualization.id);

            visualization.reset(container);
            visualization.size(w, h);
            visualization.__init();

            visualization.render(container);

            if (isIframe) {
                window.clearInterval(this.__resizingInterval);
                this.__resizingInterval = setInterval(postMessage, 1000);
                postMessage();
            }

            function postMessage() {
                if (flags && flags.fitchart) return;

                let desiredHeight;

                if (chart.getHeightMode() === 'fit') {
                    if (chart.inEditor() || !chart.getMetadata('publish.chart-height')) return;
                    desiredHeight = getNonChartHeight() + chart.getMetadata('publish.chart-height');
                } else {
                    desiredHeight = outerHeight(document.querySelector('html'), true);
                }

                if (Math.round(window.innerHeight) === Math.round(desiredHeight)) {
                    // no need to request a height change here
                    return;
                }

                const { previewId } = flags;

                // datawrapper responsive embed
                window.parent.postMessage(
                    {
                        'datawrapper-height': {
                            [chart.get().id]: desiredHeight,
                            ...(previewId ? { previewId } : {})
                        }
                    },
                    '*'
                );

                // Google AMP
                window.parent.postMessage(
                    {
                        sentinel: 'amp',
                        type: 'embed-size',
                        height: desiredHeight
                    },
                    '*'
                );

                // Medium
                window.parent.postMessage(
                    JSON.stringify({
                        src: location.href,
                        context: 'iframe.resize',
                        height: desiredHeight
                    }),
                    '*'
                );

                if (typeof window.datawrapperHeightCallback === 'function') {
                    window.datawrapperHeightCallback(desiredHeight);
                }
            }
        },

        getHeightMode() {
            const themeFitChart =
                get(visualization.theme(), 'vis.d3-pies.fitchart', false) &&
                ['d3-pies', 'd3-donuts', 'd3-multiple-pies', 'd3-multiple-donuts'].indexOf(
                    visualization.meta.id
                ) > -1;
            const urlParams = new URLSearchParams(window.location.search);
            const urlFitChart = !!urlParams.get('fitchart');

            return themeFitChart || urlFitChart || visualization.meta.height !== 'fixed'
                ? 'fit'
                : 'fixed';
        },

        attributes(attrs) {
            if (arguments.length) {
                const diff = objectDiff(attributes, attrs);
                attributes = attrs;
                // fire onChange callbacks
                getNestedObjectKeys(diff).forEach(key => {
                    changeCallbacks.fire(chart, key, get(attrs, key));
                });
                return chart;
            }
            return attributes;
        },

        // Legacy event-handling (TODO: Remove/replace?):
        onChange: changeCallbacks.add,
        onDatasetChange: datasetChangeCallbacks.add,

        dataCellChanged(column, row) {
            const changes = chart.get('metadata.data.changes', []);
            const transpose = chart.get('metadata.data.transpose', false);
            let changed = false;

            const order = dataset.columnOrder();
            column = order[column];

            changes.forEach(change => {
                let r = 'row';
                let c = 'column';
                if (transpose) {
                    r = 'column';
                    c = 'row';
                }
                if (column === change[c] && change[r] === row) {
                    changed = true;
                }
            });
            return changed;
        },

        asset(id, asset) {
            if (arguments.length === 1) {
                return _assets[id];
            }

            _assets[id] = asset;
        },

        translations(values) {
            if (arguments.length === 0) {
                return _translations;
            }

            _translations = values;

            return this;
        },

        translate(key) {
            if (!_translations[key]) return 'MISSING: ' + key;
            var translation = _translations[key];

            if (typeof translation === 'string' && arguments.length > 1) {
                // replace $0, $1 etc with remaining arguments
                translation = translation.replace(/\$(\d)/g, (m, i) => {
                    i = 1 + Number(i);
                    if (arguments[i] === undefined) return m;
                    return arguments[i];
                });
            }

            return translation;
        }
    };

    if (attributes.language) {
        chart.locale(attributes.language);
    }

    return chart;
}

/**
 * returns list of keys defined in an object
 *
 * @param {object} object
 * @returns {string[]} list of keys
 */
function getNestedObjectKeys(object) {
    const candidates = Object.keys(object);
    const keys = [];
    candidates.forEach(key => {
        if (!isPlainObject(object[key])) keys.push(key);
        else {
            getNestedObjectKeys(object[key]).forEach(subkey => {
                keys.push(`${key}.${subkey}`);
            });
        }
    });
    return keys;
}
