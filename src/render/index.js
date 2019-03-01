/* globals dw, __dw, $ */

/*
 * This is the JS code we ship with *every* published Datawrapper chart.
 * It's main purpose is to load polyfills for older browsers and handle
 * the postMessage calls for automatic resizing etc.
 */
import getBrowser from '@datawrapper/polyfills';

import observeFonts from '../shared/observe-fonts';

export default function({ visJSON, chartJSON, chartData, isPreview, chartLocale, metricPrefix, themeId, templateJS, fontsJSON, typographyJSON }) {
    window.visJSON = visJSON;

    // load polyfills
    var availablePolyfills = {
        firefox: [30, 51],
        chrome: [20, 54],
        ie: [6, 11],
        edge: [12, 18],
        safari: [6, 12]
    };

    // see https://github.com/datawrapper/polyfills/blob/master/src/getBrowser.js
    var environment = getBrowser();
    // create script tag for polyfill
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.onload = run;
    // render the chart even if load fails!
    script.onerror = run;

    if (environment.browser && availablePolyfills[environment.browser] && environment.version >= availablePolyfills[environment.browser][0]) {
        if (environment.version > availablePolyfills[environment.browser][1]) {
            // no need for polyfill, browser is quite new
            return run();
        }
        // use cached polyfill.io polyfills
        script.src = 'https://datawrapper.dwcdn.net/lib/polyfills/' + environment.browser + '-' + environment.version + '.js';
    } else {
        // unknown browser, fall back to generic polyfill
        script.src = 'https://datawrapper.dwcdn.net/lib/polyfills/all.js';
    }

    document.getElementsByTagName('head')[0].appendChild(script);

    function run() {
        __dw.init(
            Object.assign(
                {
                    visJSON,
                    chartJSON,
                    data: chartData,
                    preview: isPreview,
                    chartLocale,
                    themeId: themeId,
                    visId: chartJSON.type,
                    lang: chartLocale.substr(0, 2),
                    metricPrefix
                },
                window.__dwParams || {}
            )
        );

        observeFonts(fontsJSON, typographyJSON)
            .then(() => __dw.render())
            .catch(() => __dw.render());

        // iPhone/iPad fix
        if (/iP(hone|od|ad)/.test(navigator.platform)) {
            window.onload = __dw.render();
        }

        setInterval(function() {
            let desiredHeight;
            if (visJSON.height === 'fixed') {
                desiredHeight = $('html').outerHeight(true);
            } else {
                if (__dw.params.preview || !__dw.vis.chart().get('metadata.publish.chart-height')) {
                    return;
                }

                desiredHeight = dw.utils.getNonChartHeight() + __dw.vis.chart().get('metadata.publish.chart-height');
            }

            // datawrapper responsive embed
            window.parent.postMessage(
                {
                    'datawrapper-height': {
                        [chartJSON.id]: desiredHeight
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
                    src: window.location.toString(),
                    context: 'iframe.resize',
                    height: desiredHeight
                }),
                '*'
            );
        }, 1000);

        if (typeof templateJS === 'function') {
            templateJS();
        }
    }
}
