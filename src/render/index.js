import getBrowser from '@datawrapper/polyfills';

/* globals dw, __dw, $ */

export default function({ chartId, themeId, visId,
    visJSON, chartJSON, chartData, isPreview,
    chartLocale, lang, metricPrefix, templateJS }) {

    // load polyfills
    var availablePolyfills = {
        firefox: [30, 51], chrome: [20, 54], ie: [6,11],
        edge: [12,18], safari: [6,12]
    };

    var dev = getBrowser();
    var script = document.createElement("script");
    script.type = 'text/javascript';
    script.async = true;
    script.onload = run;
    script.onerror = run;
    if (dev.browser && availablePolyfills[dev.browser] &&
        dev.version >= availablePolyfills[dev.browser][0]) {
        if (dev.version > availablePolyfills[dev.browser][1]) {
            // no need for polyfill, browser is quite new
            return run();
        }
        // use cached polyfill.io polyfills
        script.src = 'https://datawrapper.dwcdn.net/lib/polyfills/'+dev.browser+'-'+dev.version+'.js';
    } else {
        // fall back to core js
        script.src = 'https://datawrapper.dwcdn.net/lib/polyfills/core.min.js';
    }

    document.getElementsByTagName('head')[0].appendChild(script);

    function run() {
        __dw.init(Object.assign({
            visJSON,
            chartJSON,
            data: chartData,
            preview: isPreview,
            chartLocale,
            themeId,
            visId,
            lang,
            metricPrefix
        }, window.__dwParams || {}));

        // iPhone/iPad fix
        if (/iP(hone|od|ad)/.test(navigator.platform)) {
            window.onload = __dw.render();
        }

        setInterval(function() {
            let desiredHeight;
            if (visJSON.height === "fixed") {
                desiredHeight = $('html').outerHeight(true);
            } else {
                if (__dw.params.preview || !__dw.vis.chart().get('metadata.publish.chart-height')) {
                    return;
                }

                desiredHeight = dw.utils.getNonChartHeight() +
                    __dw.vis.chart().get('metadata.publish.chart-height');
            }

            // datawrapper responsive embed
            window.parent.postMessage({
                'datawrapper-height': {
                    [chartId]: desiredHeight
                }
            }, "*");

            // Google AMP
            window.parent.postMessage({
                sentinel: 'amp',
                type: 'embed-size',
                height: desiredHeight
            }, '*');

            // Medium
            window.parent.postMessage(JSON.stringify({
                src: window.location.toString(),
                context: 'iframe.resize',
                height: desiredHeight
            }), '*');

        }, 1000);

        if (typeof templateJS === 'function') {
            templateJS();
        }
    }

}