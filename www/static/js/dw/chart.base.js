
/*
 * This piece of code is inserted at the bottom of every Datawrapper
 * chart. It's main purpose is to trigger the chart rendering.
 */

// fullscreen
(function(){var a={supportsFullScreen:!1,nonNativeSupportsFullScreen:!1,isFullScreen:function(){return!1},requestFullScreen:function(){},cancelFullScreen:function(){},fullScreenEventName:"",prefix:""},b="webkit moz o ms khtml".split(" ");if(typeof document.cancelFullScreen!="undefined")a.supportsFullScreen=!0;else for(var c=0,d=b.length;c<d;c++){a.prefix=b[c];if(typeof document[a.prefix+"CancelFullScreen"]!="undefined"){a.supportsFullScreen=!0;break}}a.supportsFullScreen?(a.fullScreenEventName=a.prefix+"fullscreenchange",a.isFullScreen=function(){switch(this.prefix){case"":return document.fullScreen;case"webkit":return document.webkitIsFullScreen;default:return document[this.prefix+"FullScreen"]}},a.requestFullScreen=function(a){return this.prefix===""?a.requestFullScreen():a[this.prefix+"RequestFullScreen"]()},a.cancelFullScreen=function(a){return this.prefix===""?document.cancelFullScreen():document[this.prefix+"CancelFullScreen"]()}):typeof window.ActiveXObject!="undefined"&&(a.nonNativeSupportsFullScreen=!0,a.requestFullScreen=a.requestFullScreen=function(a){var b=new ActiveXObject("WScript.Shell");b!==null&&b.SendKeys("{F11}")},a.isFullScreen=function(){return document.body.clientHeight==screen.height&&document.body.clientWidth==screen.width}),typeof jQuery!="undefined"&&(jQuery.fn.requestFullScreen=function(){return this.each(function(){a.supportsFullScreen&&a.requestFullScreen(this)})}),window.fullScreenApi=a})();

(function() {

    var chart,
        old_chart_attributes,
        reload_timer;

    function renderChart() {
        if (__dw.vis && !__dw.vis.supportsSmartRendering()) {
            // a current visualization exists but it is not smart
            // enough to re-render itself properly, so we need to
            // reset and remove it
            __dw.vis.reset();
        }

        // compute chart dimensions
        var w = $('#chart').innerWidth(),
            h = dw.utils.getMaxChartHeight($('#chart'));

        if (!$.support.leadingWhitespace) w -= 10; // IE Fix
        w -= $('body').css('padding-left').replace('px', '');
        w -= $('body').css('padding-right').replace('px', '');

        var vis;
        if (__dw.vis && __dw.vis.supportsSmartRendering()) {
            // a current visualization exists and it is smart enough
            // to re-render itself
            vis = __dw.vis;
        } else {
            // we have to create a new vis
            vis = __dw.vis = getVis();
            chart.vis(vis);
        }

        vis.size(w, h);

        initResizeHandler();
        initFullscreen();

        // update data link to point to edited dataset
        if (!window['__ltie9']) {
            $('a[href=data]')
                .addClass('dw-data-link')
                .attr('download', 'data-'+chart.get('id')+'.csv')
                .attr('href', 'data:application/octet-stream;charset=utf-8,' +
                    encodeURIComponent(chart.dataset().toCSV()));
        }

        chart.render($('#chart'));
    }

    function chartLoaded() {
        chart = dw.chart(__dw.params.chartJSON)
                .locale(__dw.params.chartLocale)
                .metricPrefix(__dw.params.metricPrefix)
                .theme(dw.theme(__dw.params.themeId));
        return chart.load();
    }

    function getVis() {
        var vis = dw.visualization(__dw.params.visId);
        vis.meta = __dw.params.visJSON;
        vis.lang = __dw.params.lang;
        return vis;
    }

    function reloadLater() {
        clearTimeout(reload_timer);
        reload_timer = setTimeout(function() {
            renderChart();
        }, 300);
    }

    function initResizeHandler() {
        // IE continuosly reloads the chart for some strange reasons
        if (navigator.userAgent.match(/iPad|iPhone|iPod|msie/i) === null) {
            $(window).on('resize', function() {
                // IMPORTANT: throttle resize events, do not remover timeout
                reloadLater();
            });
        }
    }

    function initFullscreen() {
        var wasFullScreen = fullScreenApi.isFullScreen(),
            resizeTimer;

        $(window).on('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(resized, 300);
        });

        function resized() {
            if (wasFullScreen != fullScreenApi.isFullScreen()) { // video fullscreen mode has changed
                if (wasFullScreen) {
                    $('.chart').removeClass('fullscreen');
                    // you have just EXITED full screen video
                } else {
                    $('.chart').addClass('fullscreen');
                    // you have just ENTERED full screen video
                }
                wasFullScreen = fullScreenApi.isFullScreen();
            }
        }

        $("a[data-toggle='fullscreen']").click(function(e) {
            if (fullScreenApi.supportsFullScreen) {
                e.preventDefault();
                $('html').requestFullScreen();
            }
        });
    }

    window.__dw = {
        init: function(params) {
            __dw.params = params;
            __dw.old_attrs = old_chart_attributes = params.chartJSON;
            if(!getVis().checkBrowserCompatibility()){
                window.location.href = 'static.html';
                return;
            }
            $.when($.ready(), chartLoaded()).done(renderChart);
        },
        render: reloadLater
    };

})();
