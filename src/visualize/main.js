import App from './App.html';
import Chart from '@datawrapper/chart-core/lib/dw/svelteChart';
import { getJSON } from '@datawrapper/shared/fetch';

export default { init };

/* globals dw, $, _ */

function init({
    chartData,
    data,
    target,
    themeId,
    themeData,
    visData,
    user,
    locales,
    themes,
    visualizations,
    visArchive,
    defaultVisType
}) {
    chartData.mode = getQueryVariable('mode') || 'web';
    var chart = new Chart(chartData);
    window.chart2 = chart;

    const themeCache = {};
    const visCache = {};
    themeCache[themeId] = themeData;
    visCache[visData.id] = visData;

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

    let app, passiveMode;

    chart.load(dw.backend.__currentData).then(function (ds) {
        // remove ignored columns
        var columnFormat = chart.getMetadata('data.column-format', {});
        var ignore = {};
        _.each(columnFormat, function (format, key) {
            ignore[key] = !!format.ignore;
        });
        if (ds.filterColumns) ds.filterColumns(ignore);

        chart.set({ dataset: ds });

        getContext(function (win, doc) {
            chart.set({ vis: win.__dw.vis });

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

            // observe changes to old chart object
            dw.backend.currentChart.onChange(function (ds, changed) {
                passiveMode = true;
                var attr = dw.backend.currentChart.attributes();
                chart.set(attr);
                // if (changed == 'metadata.data.changes') {
                //     const dataset = chart.dataset(true);
                //     chart.set({ dataset });
                // }
                setTimeout(function () {
                    passiveMode = false;
                }, 100);
            });
        });
    });

    const editHistory = [];
    let dontPush = false;
    let historyPos = 0;

    chart.on('state', function (_ref) {
        var changed = _ref.changed;
        var current = _ref.current;
        var previous = _ref.previous;

        // observe theme changes and load new theme data if needed
        if (changed.theme) {
            // console.log('theme has changed', current.theme);
            if (themeCache[current.theme]) {
                // re-use cached theme
                chart.set({ themeData: themeCache[current.theme] });
            } else {
                // load new theme data
                getJSON(
                    '//' + dw.backend.__api_domain + '/v3/themes/' + current.theme + '?extend=true',
                    function (res) {
                        themeCache[current.theme] = res.data;
                        chart.set({ themeData: res.data });
                    }
                );
            }
        }

        if (changed.type) {
            if (app && app.destroy) {
                app.destroy();
            }
            if (visCache[current.type]) {
                // re-use cached visualization
                chart.set({ visualization: visCache[current.type] });
            } else {
                // load new vis data
                getJSON('/api/visualizations/' + current.type, function (res) {
                    if (res.status === 'ok') {
                        visCache[current.type] = res.data.data;
                        chart.set({ visualization: visCache[current.type] });
                    } else {
                        console.warn('vis not loaded', res);
                    }
                });
            }
        }

        if (
            (previous && changed.title) ||
            changed.theme ||
            changed.type ||
            changed.metadata ||
            changed.language ||
            changed.lastEditStep
        ) {
            chart.store(function () {
                var iframe = document.querySelector('#iframe-vis');
                if (iframe && iframe.contentWindow) {
                    var win = iframe.contentWindow;
                    if (win.__dw && win.__dw.saved) {
                        win.__dw.saved();
                    }
                }
            });
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
            if (!passiveMode && dw && dw.backend && dw.backend.currentChart) {
                var iframe = document.querySelector('#iframe-vis');
                if (iframe && iframe.contentWindow) {
                    var win = iframe.contentWindow;
                    if (win.__dw && win.__dw.attributes) {
                        win.__dw.attributes({
                            id: current.id,
                            title: current.title,
                            theme: current.theme,
                            type: current.type,
                            externalData: current.externalData,
                            language: current.language,
                            metadata: current.metadata
                        });
                    }
                }

                // set metadata directly without saving again
                dw.backend.currentChart.attributes().metadata = JSON.parse(
                    JSON.stringify(current.metadata)
                );
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
}

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) === variable) {
            return decodeURIComponent(pair[1]);
        }
    }
}

function getContext(callback) {
    var win = $('#iframe-vis').get(0).contentWindow;
    var doc = $('#iframe-vis').get(0).contentDocument;
    if (!win || !win.__dw || !win.__dw.vis) {
        return setTimeout(function () {
            getContext(callback);
        }, 200);
    }
    callback(win, doc);
}
