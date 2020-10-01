import App from './App.html';
import Chart from '@datawrapper/chart-core/lib/dw/svelteChart';
import { getJSON } from '@datawrapper/shared/fetch';

export default { init };

/* globals dw, $, _ */

function init({
    chartData,
    data,
    target,
    theme,
    themeData,
    visData,
    user,
    locales,
    themes,
    visualizations,
    visArchive,
    defaultVisType
}) {
    var chart = new Chart(chartData);

    const themeCache = {};
    const visCache = {};
    themeCache[theme] = themeData;
    dw.theme.register(theme, themeData);
    visCache[visData.id] = visData;

    dw.backend.currentChart = chart;

    chart.set({
        writable: true,
        themeData: themeData,
        user,
        locales,
        themes,
        visualization: visCache[visData.id]
    });

    chart.compute('axes', ['visualization'], function (visualization) {
        if (!visualization) {
            return [];
        }
        return _.values(visualization.axes || {});
    });

    let app;

    chart.load(dw.backend.__currentData).then(function (ds) {
        // remove ignored columns
        var columnFormat = chart.getMetadata('data.column-format', {});
        var ignore = {};
        _.each(columnFormat, function (format, key) {
            ignore[key] = !!format.ignore;
        });
        if (ds.filterColumns) ds.filterColumns(ignore);

        chart.set({ dataset: ds });

        target.innerHTML = '';

        app = new App({
            store: chart,
            target,
            data: {
                visualizations,
                visArchive,
                defaultVisType
            }
        });
    });

    const editHistory = [];
    let dontPush = false;
    let historyPos = 0;

    chart.on('update', function ({ changed, current, previous }) {
        // observe theme changes and load new theme data if needed
        if (changed.themeId) {
            // console.log('theme has changed', current.theme);
            if (themeCache[current.themeId]) {
                // re-use cached theme
                chart.set({ themeData: themeCache[current.themeId] });
            } else {
                // load new theme data
                getJSON(
                    '//' +
                        dw.backend.__api_domain +
                        '/v3/themes/' +
                        current.themeId +
                        '?extend=true',
                    function (res) {
                        themeCache[current.themeId] = res.data;
                        dw.theme.register(current.themeId, res.data);
                        chart.set({ themeData: res.data });
                    }
                );
            }
        }

        if (
            previous &&
            (changed.title ||
                changed.themeId ||
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
