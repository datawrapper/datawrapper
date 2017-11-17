
define([
    './visualize/highlight',
    './visualize/options',
    './visualize/themes',
    './visualize/loadVisDeferred',
    './visualize/initTabNav',
    './visualize/enableInlineEditing',
    './visualize/liveUpdate',
    'js/misc/classify',
    'js/misc/jquery.easing'],

function(initHighlightSeries, visOptions, themes, loadVisDfd, initTabNav, enableInlineEditing, liveUpdate, classify) {

    var _typeHasChanged = false,
        _themeHasChanged = false,
        _axesHaveChanged = false,
        _transposed = false,
        __thumbTimer,
        _optionsSynchronized = false,
        chart = dw.backend.currentChart,
        visMetas = {},
        iframe = $('#iframe-vis');

    function init(themesJSON, _visMetas, visJSON, mode) {
        themes.init(themesJSON);

        visMetas = _visMetas;

        dw.backend.__currentVisLoaded = loadVisDfd.promise();

        chart.onSave(function(chart) {
            var heightType = visMetas[chart.get('type')].height;
            onChartSave(chart, heightType);
        });

        syncUI();

        chart.load(dw.backend.__currentData).done(onDatasetLoaded);
        iframe.load(iframeLoaded);

        // initialize some UI actions
        initTabNav(visMetas[chart.get('type')].namespace);
        initTransposeLink();
        initVisSelector();

        initScrollToFix();

        $(window).on('keyup', function(e) {
            if (e.ctrlKey && e.keyCode == 82) {
                // reload iframe on ctrl+r
                iframe.get(0).contentWindow.location.reload();
            }
        });
    }

    function onChartSave(chart, heightType) {
        if (_themeHasChanged) {
            // update the iframe background color after theme changed
            iframe.one('load', updateVisBackground);

            dw.backend.fire('theme-changed-and-loaded');
            loadOptions().done(function() {
                loadVis();
                themes.updateUI();
            });
        }

        if (_typeHasChanged) {
            iframe.attr('src', '');
            dw.backend.fire('type-changed', [visMetas[dw.backend.currentChart.get('type')], dw.backend.currentVis.meta]);
        }

        if (_axesHaveChanged) dw.backend.fire('axes-changed');
        if (_transposed) dw.backend.fire('dataset-transposed');

        if (_axesHaveChanged || _transposed || _typeHasChanged) {
            // reload options
            loadOptions().done(function() {
                dw.backend.fire('options-reloaded');
                loadVis();
            });
            // remove all notifications
            $("#notifications .notification").fadeOutAndRemove();
        }

        _themeHasChanged = false;
        _typeHasChanged = false;
        _axesHaveChanged = false;
        _transposed = false;

        var iframeWin = iframe.get(0).contentWindow;
        if (iframeWin.__dw && iframeWin.__dw.saved) {
            iframeWin.__dw.saved();
        }

        scheduleThumbnail();
    }

    function syncUI() {
        chart.sync('#select-theme', 'theme');
        chart.sync('#text-title', 'title');
        chart.sync('#text-intro', 'metadata.describe.intro');
        chart.sync('#text-notes', 'metadata.annotate.notes');
        chart.sync('#describe-source-name', 'metadata.describe.source-name');
        chart.sync('#describe-source-url', 'metadata.describe.source-url');

        chart.onChange(function(chart, key, value) {
            if (key == 'type') _typeHasChanged = true;
            if (key == 'theme') _themeHasChanged = true;
            if (key.substr(0, 13) == 'metadata.axes' || key.substr(0, 19) == 'metadata.print.axes') _axesHaveChanged = true;
            if (key == 'metadata.data.transpose' ||key == 'metadata.print.data.transpose') _transposed = true;
            liveUpdate.update(iframe, chart.attributes());
        });
    }

    function iframeLoaded() {
        dw.backend.fire('vis-loaded');
        updateVisBackground();
        var win = iframe.get(0).contentWindow,
            chk;

        // periodically check if vis is initialized in iframe
        chk = setInterval(function() {
            if (win.__dw && win.__dw.vis) {
                clearInterval(chk);
                iframeReady();
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

        liveUpdate.init(iframe);

        dw.backend.on('vis-rendered', visualizationRendered);

        $(window).on('message', function(evt) {
            evt = evt.originalEvent;
            if (evt.source == win) {
                if (evt.data == 'datawrapper:vis:init') {
                    dw.backend.fire('vis-msg-init');
                    win.dw_alert = dw.backend.alert;
                    win.__dw.backend = dw.backend;
                }
                if (evt.data && evt.data.slice && evt.data.slice(0, 7) == 'notify:') {
                    dw.backend.notify(evt.data.slice(7));
                }
                if (evt.data == 'datawrapper:vis:rendered') {
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
        if (initHighlightSeries) initHighlightSeries();
    }

    function showLoadingIndicator() {
        $('.vis-options-refine-loading').remove();
        $('.vis-options-refine, .vis-options-annotate').append('<div class="vis-options-refine-loading"><i class="fa fa-spinner fa-spin"></i></div>');
        $('.vis-options-refine > fieldset, .vis-options-annotate > fieldset').css('opacity', '0.5');
    }

    /*
     * reload the chart specific options
     */
    function loadOptions(delay) {
        showLoadingIndicator();

        var loaded = $.Deferred();
        _optionsSynchronized = false;
        var l = 0;

        $('.vis-options-refine').load(
            '/xhr/'+chart.get('id')+'/vis-options?nocache='+Math.random(), _loaded
        );
        $('.vis-options-annotate').load(
            '/xhr/'+chart.get('id')+'/vis-options?annotate=1&nocache='+Math.random(), _loaded
        );
        function _loaded() {
            l++;
            if (l == 2) {
                loaded.resolve();
                syncUI();
                loadVis();
            }
        }

        return loaded.promise();
    }

    function initTransposeLink() {
        $('#btn-transpose').click(function(e) {
            e.preventDefault();
            chart.set('metadata.data.transpose', !chart.get('metadata.data.transpose'));
            chart.load().done(onDatasetLoaded);
            showLoadingIndicator();
            setTimeout(function() {
                loadOptions();
            }, 2000);
        });
    }

    function initVisSelector() {
        // graphical vis selector
        var unfolded = $('.vis-selector-unfolded'),
            folded = $('.vis-selector-folded'),
            thumbs = $('.vis-thumb'),
            selVis = $('.vis-selected'),
            archived = $('.vis-archive-select select');

        unfolded.show().data('h', unfolded.height()).hide();
        thumbs.click(function(e) {
            var thumb = $(e.target);
            if (!thumb.hasClass('vis-thumb')) thumb = thumb.parents('.vis-thumb');
            thumbs.removeClass('active');
            thumb.addClass('active');
            selVis.html('<img src="'+thumb.data('static-path')+thumb.data('id')+'.png" width="24" />' + thumb.data('title'));

            if (thumb.data('id') != chart.get('type')) showLoadingIndicator();

            setTimeout(function() {
                /*folded.show();
                unfolded.animate({ height: 0 }, 300, 'easeOutExpo', function() {
                    unfolded.hide();
                });*/
                chart.set('type', thumb.data('id'));
            }, 100);
            if (archived.length) {
                archived.prop('value', '');
            }
        });

        folded.click(function() {
            folded.hide();
            unfolded.height(0).show().animate({ height: unfolded.data('h') }, 300);
        });

        unfolded.show();
        folded.hide();

        if (archived.length) {
            archived.on('change', function() {
                var vis_id = archived.prop('value');
                if (vis_id && vis_id != '---') {
                    thumbs.removeClass('active');
                    chart.set('type', vis_id);
                }
            });
        }
    }

    function scheduleThumbnail() {
        clearTimeout(__thumbTimer);
        __thumbTimer = setTimeout(function() {
            dw.backend.snapshot(iframe, dw.backend.currentChart.get('id'));
        }, 1500);
    }

    function onDatasetLoaded() {
        dw.backend.fire('dataset-loaded');
        loadVis();
        if (initHighlightSeries) initHighlightSeries();
    }

    /** Set into `dw.backend.currentVis` the edited visualization (editor side) */
    function loadVis() {
        if (iframe.attr('src') === "") {
            // load vis in iframe if not done yet
            function getParameterByName(e,n){n||(n=window.location.href),e=e.replace(/[\[\]]/g,"\\$&");var r=new RegExp("[?&]"+e+"(=([^&#]*)|&|#|$)").exec(n);return r?r[2]?decodeURIComponent(r[2].replace(/\+/g," ")):"":null}
            iframe.attr('src', '/chart/'+chart.get('id')+'/preview?innersvg=1&random='+Math.floor(Math.random()*100000)+(getParameterByName('mode')=='print'?"&mode=print":""));
        }
        dw.backend.currentVis = dw.visualization(chart.get('type'));
        dw.backend.currentVis.chart(chart);
        dw.backend.currentVis.dataset = chart.dataset().reset();
        dw.backend.currentVis.meta = visMetas[chart.get('type')];
        visOptions.init(chart, visMetas[chart.get('type')]);
        if (!_optionsSynchronized) {
            _optionsSynchronized = true;
            visOptions.sync();
        }
        loadVisDfd.resolve();
    }


    function updateVisBackground() {  // and show msg if chart needs more space
        var iframe = $('#iframe-vis').contents(),
            bgcol =  $('body', iframe).css('background-color'),
            white = bgcol == 'rgb(255, 255, 255)' || bgcol == '#ffffff' || bgcol == 'white' || bgcol == 'transparent',
            border = white ? '#ffffff' : '#bbb';

        bgcol = dw.backend.currentChart.get('metadata.publish.contextBg') || dw.backend.currentChart.get('metadata.publish.background');

        $('#iframe-wrapper').css({
            'background-color': white ? '#ffffff' : bgcol,
            'border-color': border
        });
    }

    function initScrollToFix() {
        var scrollFixCont = $('.scrollfix-cont');
        scrollFixCont.scrollToFixed({
            marginTop: 0,
            limit: function() {
                var sftop =  scrollFixCont.offset().top,
                    ftminsfh = $('footer.footer').offset().top - scrollFixCont.height() - 60;
                // if (sftop > ftminsfh) return sftop+10;
                return ftminsfh;
            }
        });
    }

    return {
        init: init
    };

});
