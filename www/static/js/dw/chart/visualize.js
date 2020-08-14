/* globals dw, define, $ */
define([
    './visualize/loadVisDeferred',
    './visualize/enableInlineEditing',
    './visualize/liveUpdate',
    'js/misc/classify',
    'js/misc/jquery.easing'
], function (loadVisDfd, enableInlineEditing, liveUpdate, classify) {
    var _typeHasChanged = false;
    var _themeHasChanged = false;
    var _axesHaveChanged = false;
    var _transposed = false;

    var chart = dw.backend.currentChart;
    var visMetas = {};
    var iframe = $('#iframe-vis');

    function init(themesJSON, _visMetas, visJSON, mode) {
        visMetas = _visMetas;

        dw.backend.__currentVisLoaded = loadVisDfd.promise();

        chart.onSave(function (chart) {
            onChartSave(chart);
        });

        dw.backend.on('dataset-changed', function () {
            iframe.attr('src', '');

            // reload options
            dw.backend.on('options-reloaded', function () {
                loadVis();
            });
            // remove all notifications
            $('#notifications .notification').fadeOutAndRemove();
        });

        dw.backend.fire('vis-metas', _visMetas);

        syncUI();

        chart.load(dw.backend.__currentData).then(onDatasetLoaded);
        iframe.load(iframeLoaded);

        if (iframe[0].contentDocument.readyState === 'complete') {
            iframeLoaded();
        }

        // initialize some UI actions
        if (!visMetas[chart.get('type')]['svelte-sidebar']) {
            initTransposeLink();
        }

        initScrollToFix();

        if (window.location.hash === '' && chart.get('metadata.visualize.chart-type-set')) {
            window.location.hash = '#refine-the-chart';
        }

        $(window).on('keyup', function (e) {
            if (e.ctrlKey && e.keyCode === 82) {
                // reload iframe on ctrl+r
                iframe.get(0).contentWindow.location.reload();
            }
        });
    }

    function onChartSave(chart) {
        var svelteControls = visMetas[dw.backend.currentChart.get('type')]['svelte-controls'];
        if (_themeHasChanged) {
            // update the iframe background color after theme changed
            iframe.one('load', updateVisBackground);

            dw.backend.fire('theme-changed-and-loaded');
        }

        if (_typeHasChanged) {
            iframe.attr('src', '');
            dw.backend.fire('type-changed', [
                visMetas[dw.backend.currentChart.get('type')],
                dw.backend.currentVis.meta
            ]);
        }

        if (_axesHaveChanged) dw.backend.fire('axes-changed');
        if (_transposed) dw.backend.fire('dataset-transposed');

        if ((_axesHaveChanged && !svelteControls) || _transposed || _typeHasChanged) {
            // remove all notifications
            $('#notifications .notification').fadeOutAndRemove();
        } else if (_axesHaveChanged && svelteControls) {
            loadVis();
            $('#notifications .notification').fadeOutAndRemove();
        }

        _themeHasChanged = false;
        _typeHasChanged = false;
        _axesHaveChanged = false;
        _transposed = false;

        var iframeWin = iframe.get(0).contentWindow;
        if (iframeWin.__dw && iframeWin.__dw.saved) {
            iframeWin.__dw.saved();
        }

        // scheduleThumbnail();
    }

    function syncUI() {
        chart.sync('#select-theme', 'theme');
        chart.sync('#text-title', 'title');
        chart.sync('#hide-title', 'metadata.describe.hide-title');
        chart.sync('#text-intro', 'metadata.describe.intro');
        chart.sync('#text-notes', 'metadata.annotate.notes');
        chart.sync('#describe-source-name', 'metadata.describe.source-name');
        chart.sync('#describe-source-url', 'metadata.describe.source-url');
        chart.sync('#describe-byline', 'metadata.describe.byline');

        $('#text-title').focus(function (evt) {
            var val = $(evt.target).val();
            if (val.substr(0, 2) === '[ ' && val.substr(val.length - 2) === ' ]') {
                evt.target.select();
            }
        });

        chart.onChange(function (chart, key, value) {
            function changed(test) {
                return (
                    key.substr(0, test.length) === test ||
                    key.replace(/metadata/, 'metadata.print').substr(0, test.length) === test
                );
            }

            if (key === 'type') _typeHasChanged = true;
            if (key === 'theme') _themeHasChanged = true;
            if (changed('metadata.data.transpose')) _transposed = true;

            if (
                changed('metadata.axes') ||
                changed('metadata.data.column-format') ||
                changed('metadata.data.changes') ||
                changed('metadata.data.column-order') ||
                changed('metadata.describe.computed-columns')
            ) {
                _axesHaveChanged = true;
            }

            liveUpdate.update(iframe, chart.attributes());
        });
    }

    function iframeLoaded() {
        dw.backend.fire('vis-loaded');
        var win = iframe.get(0).contentWindow;
        var chk;

        // periodically check if vis is initialized in iframe
        chk = setInterval(function () {
            if (win.__dw && win.__dw.vis) {
                clearInterval(chk);
                iframeReady();
                updateVisBackground();
            }
        }, 100);
    }

    /*
     * called as soon the __dw.vis object is available
     * inside the reloaded iframe
     */
    function iframeReady() {
        dw.backend.fire('vis-ready');
        var win = iframe.get(0).contentWindow;

        if (!dw.backend.currentVis) loadVis();

        liveUpdate.init(iframe);

        dw.backend.on('vis-rendered', visualizationRendered);

        $(window).on('message', function (evt) {
            evt = evt.originalEvent;
            if (evt.source === win) {
                if (evt.data === 'datawrapper:vis:init') {
                    dw.backend.fire('vis-msg-init');
                    win.dw_alert = dw.backend.alert;
                    win.__dw.backend = dw.backend;
                }
                if (evt.data && evt.data.slice && evt.data.slice(0, 7) === 'notify:') {
                    dw.backend.notify(evt.data.slice(7));
                }
                if (evt.data === 'datawrapper:vis:rendered') {
                    dw.backend.fire('vis-rendered');
                }
            }
        });
    }

    /*
     * called as soon the vis is rendered (after iframe reload)
     */
    function visualizationRendered() {
        enableInlineEditing(iframe, chart);
    }

    function initTransposeLink() {
        $('#btn-transpose').click(function (e) {
            e.preventDefault();
            chart.set('metadata.data.transpose', !chart.get('metadata.data.transpose'));
            chart.load().done(onDatasetLoaded);
        });
    }

    function onDatasetLoaded() {
        dw.backend.fire('dataset-loaded');
        loadVis();
    }

    /** Set into `dw.backend.currentVis` the edited visualization (editor side) */
    function loadVis() {
        if (iframe.attr('src') === '') {
            // load vis in iframe if not done yet
            var src =
                '/preview/' +
                chart.get('id') +
                '?innersvg=1&random=' +
                Math.floor(Math.random() * 100000);
            iframe.attr('src', src);
        }
        if (dw.visualization.has(chart.get('type'))) {
            loadVisDone(dw.visualization(chart.get('type')));
        } else {
            // we need to load the vis render code
            loadVisJS(chart.get('type'), function () {
                loadVisDone(dw.visualization(chart.get('type')));
            });
        }
        function loadVisDone(vis) {
            dw.backend.currentVis = vis;
            dw.backend.currentVis.chart(chart);
            dw.backend.currentVis.meta = visMetas[chart.get('type')];
            dw.backend.fire('backend-vis-loaded', dw.backend.currentVis);

            loadVisDfd.resolve();
        }

        function loadVisJS(type, callback) {
            if (dw.backend.__visLoaded[type]) return callback();
            if (
                dw.backend.__visDependencies[type] &&
                !dw.backend.__visLoaded[dw.backend.__visDependencies[type]]
            ) {
                // first load dependency
                loadVisJS(dw.backend.__visDependencies[type], function () {
                    // then load this type
                    loadVisJS(type, callback);
                });
            } else {
                $.getScript(dw.backend.__visRenderUrls[type], function () {
                    // if (!dw.backend.__visLoaded[type]) console.log('loaded visualization', type);
                    dw.backend.__visLoaded[type] = true;
                    callback();
                });
            }
        }
    }

    function updateVisBackground() {
        var theme = dw.theme(dw.backend.currentChart.get('theme'));
        // and show msg if chart needs more space
        var iframe = $('#iframe-vis').contents();
        var bgcol =
            theme && theme.colors && theme.colors.background
                ? theme.colors.background
                : $('body', iframe).css('background-color');
        var isTransparent = bgcol === 'transparent' || bgcol === 'rgba(0, 0, 0, 0)';

        $('#iframe-wrapper').css({
            'background-color': isTransparent ? '#ffffff' : bgcol
        });
    }

    function initScrollToFix() {
        var scrollFixCont = $('.scrollfix-cont');
        scrollFixCont.scrollToFixed({
            marginTop: 0,
            zIndex: 999,
            limit: function () {
                // var sftop = scrollFixCont.offset().top;
                var ftminsfh = $('footer.footer').offset().top - scrollFixCont.height() - 60;
                // if (sftop > ftminsfh) return sftop+10;
                return ftminsfh;
            }
        });
    }

    return {
        init: init
    };
});
