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
    var chart = new Chart(chartData);

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

        getContext(function (win, doc) {
            chart.set({ vis: win.__dw.vis });
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
                    // update iframe

                    var win = iframe.contentWindow;
                    if (win.__dw && win.__dwUpdate) {
                        const __dw = win.__dw;

                        const attributes = {
                            id: current.id,
                            title: current.title,
                            theme: current.theme,
                            type: current.type,
                            externalData: current.externalData,
                            language: current.language,
                            metadata: current.metadata
                        };

                        __dw.vis.chart().attributes(attributes);
                        __dw.old_attrs = JSON.parse(JSON.stringify(attributes));
                        __dw.vis.chart().load(__dw.params.data);
                        __dw.render();

                        win.__dwUpdate({
                            chart: attributes
                        });
                    }
                }
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
