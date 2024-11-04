import isArray from 'lodash/isArray.js';
import isUndefined from 'lodash/isUndefined.js';
import indexOf from 'lodash/indexOf.js';
import get from '@datawrapper/shared/get';
import set from '@datawrapper/shared/set';
import objectDiff from '@datawrapper/shared/objectDiff';
import { getObjectPaths } from '@datawrapper/shared/objectPaths';
import PostEvent from '@datawrapper/shared/postEvent';
import migrate from '../migrate/index.js';

import json from './dataset/json.js';
import delimited from './dataset/delimited.js';
import { name, width } from './utils/index.js';
import events from './utils/events.js';
import reorderColumns from './dataset/reorderColumns.js';
import applyChanges from './dataset/applyChanges.js';
import addComputedColumns from './dataset/addComputedColumns.js';
import { outerHeight, getNonChartHeight } from './utils/getNonChartHeight.js';
import { getHeightMode } from './utils/index.js';

/**
 * Chart
 *
 * @module dw.chart
 */
function Chart(attributes) {
    // private methods and properties
    let dataset;
    let datasetSourceUrl; // when loading external data
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
            const previousValue = get(attributes, key);
            // only fire change event if value has actually changed
            if (JSON.stringify(previousValue) !== JSON.stringify(value)) {
                set(attributes, key, value);
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

        /**
         * Returns the relative mouse position within a given node. If no node is specified,
         * returns position based on event.target of the mouse event.
         *
         * @param {MouseEvent} event
         * @param {HTMLElement} node
         *
         * @returns {[number, number]} [x, y] - the relative mouse position
         */
        getRelativeMousePosition(event, node) {
            const rect = (node || event.target).getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            return [x, y];
        },

        // loads the dataset and returns a deferred
        load(csv, externalData) {
            const dsopts = {
                chartId: chart.get('id'),
                firstRowIsHeader: chart.get('metadata.data.horizontal-header', true),
                transpose: chart.get('metadata.data.transpose', false),
                loadDataWithTimestamp: false
            };

            if ((csv || csv === '') && !externalData) dsopts.csv = csv;
            else dsopts.url = externalData || 'data.csv';

            // append a timestamp to the URL to circumvent cache
            if (externalData) {
                const ts = new Date().getTime();
                dsopts.url += `${externalData.includes('?') ? '&' : '?'}v=${
                    externalData.includes('//static.dwcdn.net') ? ts - (ts % 60000) : ts
                }`;
                datasetSourceUrl = dsopts.url;
            } else {
                datasetSourceUrl = undefined;
            }

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
         * For external data charts, returns the URL that the data was loaded from,
         * which also includes a timestamp query string.
         */
        datasetSourceUrl() {
            return datasetSourceUrl ? datasetSourceUrl : undefined;
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

        /**
         * renders the chart into the provided container element
         *
         * @param {DOMElement} outerContainer
         * @returns {Promise} resolves when the chart is rendered
         */
        render(outerContainer) {
            if (!visualization || !theme || !dataset) {
                throw new Error(
                    'Missing visualization, theme, or dataset. Chart cannot be rendered.'
                );
            }

            const isIframe = flags.isIframe;
            const fitchartMode = flags.fitchart && visualization.meta.supportsFitHeight;
            const container = chart.vis().target();

            visualization.chart(chart);
            visualization.container(container);
            visualization.outerContainer(outerContainer);

            // compute chart dimensions
            const w = width(container);
            const h =
                isIframe || fitchartMode
                    ? chart.getMaxChartHeight()
                    : chart.getMetadata('publish.chart-height') || 400;

            const heightMode = chart.getHeightMode();

            // set chart mode class
            outerContainer.classList.toggle('vis-height-fit', heightMode === 'fit');
            outerContainer.classList.toggle('vis-height-fixed', heightMode === 'fixed');

            // set mobile class
            const breakpoint = get(theme, `vis.${chart.type}.mobileBreakpoint`, 450);
            outerContainer.classList.toggle('is-mobile', container.clientWidth <= breakpoint);

            // really needed?
            outerContainer.classList.add('vis-' + visualization.id);

            visualization.reset(container);
            visualization.size(w, h);
            visualization.__beforeRender();

            const invalidDimensions = heightMode === 'fixed' ? w <= 0 : w <= 0 || h <= 0;

            // only attempt to render visualization if vis body dimensions are valid
            if (invalidDimensions) {
                console.warn('Aborting chart rendering due to invalid container dimensions');
                visualization.renderingComplete();
            } else {
                visualization.render(container);
            }

            if (isIframe) {
                window.clearInterval(this.__resizingInterval);
                this.__resizingInterval = setInterval(postMessage, chart.inEditor() ? 100 : 1000);
                postMessage();
            }

            function postMessage() {
                if (fitchartMode) return;

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
            return visualization.rendered();
        },

        getHeightMode() {
            return getHeightMode({
                themeData: visualization.theme(),
                visualizationMeta: visualization.meta,
                renderFlags: flags
            });
        },

        getMaxChartHeight() {
            const vis = chart.vis();
            const containerHeight = flags.isIframe
                ? window.innerHeight
                : vis.outerContainer().clientHeight || vis.outerContainer().offsetHeight;
            const rootContainer = chart.vis().container().getRootNode();
            const maxHeight = containerHeight - getNonChartHeight(rootContainer);
            return Math.max(maxHeight, 0);
        },

        attributes(attrs) {
            if (arguments.length) {
                const diff = objectDiff(attributes, attrs);
                attributes = attrs;
                // fire onChange callbacks
                getObjectPaths(diff).forEach(key => {
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
            return undefined;
        },

        translations(values) {
            if (arguments.length === 0) {
                return _translations;
            }

            _translations = values;

            return this;
        },

        translate(key) {
            let useEditorLocale = false;
            const additionalArgs = Array.from(arguments).slice(1);
            const replacements = additionalArgs;

            if (typeof additionalArgs[0] === 'boolean') {
                useEditorLocale = additionalArgs[0];
                additionalArgs.shift();
            }

            const translations =
                useEditorLocale &&
                chart.inEditor() &&
                window.parent.dw.backend.__messages?.chart?.[key]
                    ? window.parent.dw.backend.__messages.chart
                    : _translations;

            if (!translations[key]) return 'MISSING: ' + key;

            let translation = translations[key];

            if (typeof translation === 'string' && replacements.length) {
                // replace $0, $1 etc with remaining arguments
                translation = translation.replace(/\$(\d)/g, (m, i) => {
                    i = Number(i);
                    if (replacements[i] === undefined) return m;
                    return replacements[i];
                });
            }

            return translation;
        }
    };

    if (attributes.metadata) {
        migrate(attributes.metadata);
    }

    if (attributes.language) {
        chart.locale(attributes.language);
    }

    return chart;
}

export default Chart;
