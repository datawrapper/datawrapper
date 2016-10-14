
define([
    './visualize/highlight',
    './visualize/options',
    './visualize/themes',
    './visualize/checkChartHeight',
    './visualize/loadVisDeferred',
    './visualize/initTabNav',
    './visualize/enableInlineEditing',
    './visualize/liveUpdate',
    './visualize/updateSize',
    'js/misc/classify',
    'js/misc/jquery.easing'],

function(initHighlightSeries, visOptions, themes, checkChartHeight, loadVisDfd,
    initTabNav, enableInlineEditing, liveUpdate, updateSize, classify) {

    var _typeHasChanged = false,
        _themeHasChanged = false,
        _axesHaveChanged = false,
        _transposed = false,
        __thumbTimer,
        _optionsSynchronized = false,
        __updateSizeTimer,
        chart = dw.backend.currentChart,
        visMetas = {},
        iframe = $('#iframe-vis');

    function init(themesJSON, _visMetas, visJSON) {

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

        initResizeChart();
        initChartSize();
        initScrollToFix();

        checkChartHeight();

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
            // update iframe size according to theme default
            _.some(themes.all(), function(theme) {
                if (theme.id == chart.get('theme')) {
                    var w = theme.default_width || chart.get('metadata.publish.embed-width'),
                        h = theme.default_height || chart.get('metadata.publish.embed-height');
                    updateSize(w, h);
                    return true;
                }
            });

            // load themes
            themes.load().done(function() {
                dw.backend.fire('theme-changed-and-loaded');
                loadOptions().done(function() {
                    loadVis();
                    themes.updateUI();
                });
            });
        }

        if (_typeHasChanged) {
            iframe.attr('src', '');
            dw.backend.fire('type-changed');
            initResizeChart();
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

        checkChartHeight(heightType);
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
            if (key.substr(0, 13) == 'metadata.axes') _axesHaveChanged = true;
            if (key == 'metadata.data.transpose') _transposed = true;
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
        checkChartHeight(visMetas[chart.get('type')].height == "fixed");
        enableInlineEditing(iframe, chart);
        if (initHighlightSeries) initHighlightSeries();
    }

    /*
     * reload the chart specific options
     */
    function loadOptions() {
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
                if (vis_id) {
                    thumbs.removeClass('active');
                    chart.set('type', vis_id);
                }
            });
        }
    }

    function initResizeChart() {
        var heightType = visMetas[chart.get('type')].height;

        $('.resize-chart a').click(function(e) {
            e.preventDefault();
            var dim = $(e.target).html().split('×');
            if ($('#resize-w').val() != dim[0]) $('#resize-w').val(dim[0]);
            if ($('#resize-h').val() != dim[1]) $('#resize-h').val(dim[1]);
            updateSize(dim[0], dim[1]);
        });

        var iframe = $('#iframe-wrapper').addClass('resizable');

        iframe.find('.resizer').remove();

        if (heightType == "fixed") {
            iframe.append('<div class="resizer icon-resize-horizontal"></div>');
            $('#resize-h').prop("disabled", true);
        } else {
            iframe.append('<div class="resizer resizer-both icon-resize-horizontal"></div>');
            $('#resize-h').prop("disabled", false);
        }

        $('.resizer', iframe).on('mousedown', dragStart);

        var startX, startY, startWidth, startHeight;

        $('.size-presets .preset').click(function() {
            $('.preset').removeClass('selected');
            $(this).addClass('selected');

            if ($(this).hasClass('mobile-s')) {
                $('#resize-w').val(280);
            } else if ($(this).hasClass('mobile-l')) {
                $('#resize-w').val(370);
            } else if ($(this).hasClass('desktop')) {
                $('#resize-w').val(600);
            }

            updateSize();
        });

        function dragStart(e) {
            startX = e.clientX;
            startY = e.clientY;
            startWidth = iframe.width();
            startHeight = iframe.height();
            $(document).on('mousemove', doDrag);
            $(document).on('mouseup', stopDrag);
            $('#iframe-vis').addClass('resizing');
        }

        function doDrag(e) {
            if (heightType != "fixed") {
                iframe.height(startHeight + e.clientY - startY);
            }

            iframe.width(startWidth + e.clientX - startX);
            iframe.css('pointer-events', 'none');
            e.preventDefault();
            return false;
        }

        function stopDrag(e) {
            $(document).unbind('mousemove', doDrag);
            $(document).unbind('mouseup', stopDrag);
            updateSize($('#iframe-vis').width(), $('#iframe-vis').height());
            iframe.css('pointer-events', 'initial');
            $('#iframe-vis').removeClass('resizing');
        }
    }

    function initChartSize() {
        var cw = chart.get('metadata.publish.embed-width', $('#iframe-wrapper').width()),
            ch = chart.get('metadata.publish.embed-height', $('#iframe-wrapper').height());
        if ($('#resize-w').val() != cw) $('#resize-w').val(cw);
        if ($('#resize-h').val() != ch) $('#resize-h').val(ch);
        $('.resize-chart input').change(_updateSize);
        $('#iframe-wrapper').width(cw);
        $('#iframe-wrapper').height(ch);
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
        _.each(themes.all(), function(theme) {
            if (theme.id == chart.get('theme')) {
                var w = chart.get('metadata.publish.embed-width', theme.default_width || 560),
                    h = chart.get('metadata.publish.embed-height', theme.default_height || 400);
                updateSize(w, h);
                return false;
            }
        });
        themes.load();
    }

    /** Set into `dw.backend.currentVis` the edited visualization (editor side) */
    function loadVis() {
        if (iframe.attr('src') === "") {
            // load vis in iframe if not done yet
            iframe.attr('src', '/chart/'+chart.get('id')+'/preview?innersvg=1&random='+Math.floor(Math.random()*100000));
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

    // chart resizing
    function _updateSize() {
        clearTimeout(__updateSizeTimer);
        __updateSizeTimer = setTimeout(updateSize, 300);
    }

    return {
        init: init
    };

});
