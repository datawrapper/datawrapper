import App from './App.html';
import Chart from '@datawrapper/chart-core/lib/dw/svelteChart';
import { getJSON } from '@datawrapper/shared/fetch';
import get from 'lodash/get';
import assign from 'assign-deep';

export default { init };

/* globals dw,_ */

const defaultChartMetadata = {
    data: {},
    describe: {
        intro: '',
        byline: '',
        'aria-description': '',
        'source-name': '',
        'source-url': ''
    },
    visualize: {},
    publish: {}
};

function init({
    target,
    csv,
    chartData,
    externalMetadata,
    namespace,
    defaultVisType,
    visualizations,
    visArchive,
    webToPrint,
    theme,
    themes,
    themeData,
    teamSettings,
    customLayouts,
    flags
}) {
    let externalRawMetadata;

    try {
        externalRawMetadata = JSON.parse(externalMetadata);
        externalMetadata = JSON.parse(externalMetadata);
        delete externalRawMetadata.title;
    } catch (ex) {
        externalMetadata = {};
        externalRawMetadata = {};
    }

    const chart = new Chart({
        ...chartData,
        title: externalMetadata.title || chartData.title,
        metadata: assign(
            defaultChartMetadata,
            chartData.metadata,
            typeof externalRawMetadata === 'object' ? externalRawMetadata : {}
        )
    });
    let app;
    const themeCache = {};
    themeCache[theme] = themeData;
    dw.theme.register(theme, themeData);

    dw.backend.currentChart = chart;

    chart.locale(chart.get().language || 'en-US');

    chart.set({
        writable: true,
        themeData: themeData,
        teamSettings,
        externalMetadata,
        themes,
        customLayouts,
        flags,
        visualization: visualizations[chartData.type]
    });

    if (chart.get().lastEditStep < 3) {
        chart.set({ lastEditStep: 3 });
    }

    chart.compute('axes', ['visualization'], function (visualization) {
        if (!visualization) {
            return [];
        }
        return _.values(visualization.axes || {});
    });

    function initializeDataset(ds) {
        // remove ignored columns
        var columnFormat = chart.getMetadata('data.column-format', {});
        var ignore = {};
        _.each(columnFormat, function (format, key) {
            ignore[key] = !!format.ignore;
        });
        if (ds.filterColumns) ds.filterColumns(ignore);

        chart.set({ dataset: ds });
    }

    chart.load(csv).then(function (ds) {
        initializeDataset(ds);

        target.innerHTML = '';

        app = new App({
            store: chart,
            target,
            data: {
                visualizations,
                namespace,
                visArchive,
                defaultVisType,
                webToPrint
            }
        });
    });

    const editHistory = [];
    let dontPush = false;
    let historyPos = 0;

    // Reload dataset when table is transposed
    chart.observeDeep('metadata.data.transpose', (currentValue, previousValue) => {
        if (previousValue === undefined) return;
        chart.load(csv).then(initializeDataset);
    });

    chart.on('update', function ({ changed, current, previous }) {
        // observe theme changes and load new theme data if needed
        if (changed.theme) {
            if (themeCache[current.theme]) {
                // re-use cached theme
                chart.set({ themeData: themeCache[current.theme] });
            } else {
                // load new theme data
                getJSON(
                    '//' + dw.backend.__api_domain + '/v3/themes/' + current.theme + '?extend=true',
                    function (res) {
                        themeCache[current.theme] = res.data;
                        dw.theme.register(current.theme, res.data);
                        chart.set({ themeData: res.data });
                    }
                );
            }
        }

        if (changed.type) {
            const oldVis = visualizations.filter(el => el.id === previous.type)[0];
            const newVis = visualizations.filter(el => el.id === current.type)[0];

            if (
                oldVis.height === 'fixed' &&
                newVis.height === 'fit' &&
                get(current, 'metadata.publish.embed-height') > 800
            ) {
                const { metadata } = current;
                metadata.publish['embed-height'] = 600;
                this.set({ metadata });

                if (app && app.refs.resizer) {
                    app.set({ loading: true });
                    app.refs.resizer.set({ height: 600 });
                    app.refs.resizer.updateSize();
                }
            }
        }

        if (
            previous &&
            (changed.title ||
                changed.theme ||
                changed.type ||
                changed.metadata ||
                changed.language ||
                changed.lastEditStep)
        ) {
            chart.store();

            if (!dontPush) {
                var s = JSON.stringify(chart.serialize());
                if (historyPos > 0) {
                    // throw away edit history until the current pos
                    editHistory.splice(0, historyPos);
                }
                if (editHistory[0] !== s) editHistory.unshift(s);
                editHistory.length = Math.min(editHistory.length, 50);
                historyPos = 0;
            }
        }
    });

    window.addEventListener('keypress', function (evt) {
        if (evt.key === 'z' && evt.ctrlKey) {
            var oldPos = historyPos;
            historyPos += evt.altKey ? -1 : 1;
            if (editHistory[historyPos]) {
                dontPush = true;
                chart.set(JSON.parse(editHistory[historyPos]));
                dontPush = false;
            } else {
                historyPos = oldPos;
            }
        }
    });

    return {
        app
    };
}
