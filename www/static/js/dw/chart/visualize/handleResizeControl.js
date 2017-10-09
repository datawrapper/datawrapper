define(function() {

    this.resizeIframe = function() {
        var maxW = $('#iframe-wrapper').parent().parent().width()-22,
            w = chart.get('metadata.publish.embed-width'),
            h = chart.get('metadata.publish.embed-height'),
            m = String(w).match(/^(\d+(?:\.\d+)?)%$/),
            realW = m ? (+m[1]/100)*maxW : w;

        $('#resize-w').val(w);
        $('#resize-h').val(h);
        $('#resize-mm-w').val(w / 4);
        $('#resize-mm-h').val(h / 4);

        if (!$('#iframe-wrapper').is(':animated')) {
            $('#iframe-wrapper').animate({
                width: w,
                height: h,
                'margin-left': (maxW - realW) * 0.5,
            }, {
                duration: 400,
                easing: 'easeOutExpo',
                step: function() {
                    $(this).css('overflow', 'visible');
                }
            });

            $('.visconfig').css('min-height', (+h)+250);
        }

        dw.backend.fire('chart-resize');
    };

    this.updateSize = function(w, h) {
        var maxW = $('#iframe-wrapper').parent().parent().width()-22,
            chart = dw.backend.currentChart;

        if (Number(w) > maxW) {
            w = maxW;
        }

        var m = String(w).match(/^(\d+(?:\.\d+)?)%$/),
            realW = m ? (+m[1]/100)*maxW : w;

        chart.set('metadata.publish.embed-width', w);
        chart.set('metadata.publish.embed-height', h);

        this.resizeIframe();
    };

    this.initWebMode = function() {
        // 1. Resize when textbox changes
        $('#resize-w, #resize-h').change((function() {
            this.updateSize($('#resize-w').val(), $('#resize-h').val());
        }).bind(this));

        // 2. Resize when drag&drop event fires
        var iframe = $('#iframe-wrapper').addClass('resizable');
        iframe.find('.resizer').remove();
        iframe.append('<div class="resizer resizer-both icon-resize-horizontal"></div>');

        $('.resizer', iframe).on('mousedown', dragStart);
        var startX, startY, startWidth, startHeight;

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
            iframe.height(startHeight + e.clientY - startY);
            iframe.width(startWidth + e.clientX - startX);
            iframe.css('pointer-events', 'none');
            e.preventDefault();
            return false;
        }

        function stopDrag(e) {
            $(document).unbind('mousemove', doDrag);
            $(document).unbind('mouseup', stopDrag);
            // now, update size;
            updateSize($('#iframe-vis').width(), $('#iframe-vis').height());
            iframe.css('pointer-events', 'initial');
            $('#iframe-vis').removeClass('resizing');
        }

        // 3. Resize when a preset is clicked
        $('.size-preset').click(function () {
            updateSize($(this).attr('data-width'), $('#resize-h').val());
        });

        // 4. Resize when type has changed
        dw.backend.on('type-changed', function(metas) {
            var newMeta = metas[0], oldMeta = metas[1];

            if (oldMeta.height == "fixed" && (newMeta.height || "fit") == "fit" && $('#resize-h').val() > 500) {
                updateSize($('#resize-w').val(), 500);
            }
        });

        // 5. Resize when chart wants to resize itself
        window.addEventListener('message', function(e) {
            var message = e.data;

            if (typeof message['datawrapper-height'] != "undefined") {
                var h;

                for (var chartId in message['datawrapper-height']) {
                    h = message['datawrapper-height'][chartId];
                }

                if (!$('.preset.manual').hasClass('selected') && !$('#iframe-vis').hasClass('resizing')) {
                    updateSize($('#resize-w').val(), h);
                }
            }
        });

        // 4. keep buttons in sync
        dw.backend.on('chart-resize', function() {
            var w = dw.backend.currentChart.get('metadata.publish.embed-width');

            $('.toolbar-container.web .size-preset').removeClass('active');

            if (w <= $('.toolbar-container.web .size-preset.mobile-s').attr('data-width')) {
                $('.toolbar-container.web .size-preset.mobile-s').addClass('active');
            } else if (w <= $('.toolbar-container.web .size-preset.mobile-l').attr('data-width')) {
                $('.toolbar-container.web .size-preset.mobile-l').addClass('active');
            } else if (w <= $('.toolbar-container.web .size-preset.desktop').attr('data-width')) {
                $('.toolbar-container.web .size-preset.desktop').addClass('active');
            }
        });
    };

    this.initPrintMode = function() {
        // 1. Resize when textbox is changed
        $('#resize-mm-w, #resize-mm-h').change((function() {
            var widthPx = $('#resize-mm-w').val() * 4,
                heightPx = $('#resize-mm-h').val() * 4;

            this.updateSize(widthPx, heightPx);

            $('#iframe-pdf').hide();
            $('#iframe-vis').show();
            $('.btn-show-pdf').removeClass('active');
        }).bind(this));

        // 2. Resize when a preset is clicked
        $('.toolbar-container.print .size-preset').click(function () {
            updateSize($(this).attr('data-width') * 4, $('#resize-mm-h').val() * 4);
            $('#iframe-pdf').hide();
            $('#iframe-vis').show();
            $('.btn-show-pdf').removeClass('active');
        });

        // 3. Show PDF when required
        $('.btn-show-pdf, .btn-download-pdf').click(function showPdfPreview() {
            var deps = [
                    "jspdf.js",
                    "custom-fonts/FileSaver.js",
                    "flatten.js",
                    "jQuery.Color.js",
                    "lettering.js",
                    "Raphael.js",
                    "custom-fonts/split_text_to_size.js",
                    "custom-fonts/standard_fonts_metrics.js",
                    "custom-fonts/customfonts.js",
                    "custom-fonts/vfs_fonts.js",
                    "export-frame.js"
                ],
                frame = $('#iframe-vis').get(0),
                frame_doc = frame.contentDocument,
                download = !$(this).hasClass('btn-show-pdf');


            function loadDeps(deps, cb) {
                if ($('#iframe-vis').get(0).contentWindow.jsPdfInitialized || deps.length == 0) {
                    $('#iframe-vis').get(0).contentWindow.jsPdfInitialized = true;
                    cb();
                    return;
                }

                $('#iframe-vis').get(0).contentWindow.$('head').append('<script type="text/javascript" src="/static/plugins/export-jspdf/export-frame/' + deps.shift() + '">');
                loadDeps(deps, cb);
            }

            if (!download) {
                $('#iframe-pdf').toggle();
                $('.btn-show-pdf').toggleClass('active');

                if (!$('.btn-show-pdf').hasClass('active')) return;
            }

            loadDeps(deps, function () {
                var pdf = frame.contentWindow.toPdf(dw.backend.currentChart.get('type'), 4, Math.round($('#resize-w').val() / 4), Math.round($('#resize-h').val() / 4), download);
                $('#iframe-vis').attr("src", $('#iframe-vis').attr("src"));

                if (!download) {
                    $('#iframe-pdf').attr('src', pdf);
                }
            });
        });

        // 4. keep buttons in sync
        dw.backend.on('chart-resize', function() {
            var mmW = dw.backend.currentChart.get('metadata.publish.embed-width') / 4;

            $('.toolbar-container.print .size-preset').removeClass('active');
            $('.toolbar-container.print .size-preset[data-width='+Math.round(mmW)+']').addClass('active');
        });
    }

    this.initSwitchModes = function() {
        $('.btn-switch-print').click(function () {
            $('.btn-switch-web, .btn-switch-print').removeClass('active');
            $(this).addClass('active');

            window.location = (window.location.protocol + "//" + window.location.host + window.location.pathname + "?mode=print" + window.location.hash);
            return;

            var iframeUrl = $('#iframe-vis')[0].contentWindow.location;
            $('#iframe-vis').attr('src', iframeUrl.protocol + "//" + iframeUrl.host + iframeUrl.pathname + "?mode=print" + iframeUrl.hash);

            $('.toolbar-container.web').addClass('hide');
            $('.toolbar-container.print').removeClass('hide');
            $('.resizer').hide();

            loadOptions();
        });


        $('.btn-switch-web').click(function () {
            $('.btn-switch-web, .btn-switch-print').removeClass('active');
            $(this).addClass('active');

            window.location = (window.location.protocol + "//" + window.location.host + window.location.pathname + "?mode=web" + window.location.hash);
            return;

            var iframeUrl = $('#iframe-vis')[0].contentWindow.location;
            $('#iframe-vis').attr('src', iframeUrl.protocol + "//" + iframeUrl.host + iframeUrl.pathname + "?mode=web" + iframeUrl.hash);

            $('.toolbar-container.web').removeClass('hide');
            $('.toolbar-container.print').addClass('hide');
            $('.resizer').show();

            $('#iframe-pdf').hide();
            $('#iframe-vis').show();
            $('.btn-show-pdf').removeClass('active');

            loadOptions();
        });
    };

    this.init = function(mode) {
        if (mode == "web") {
            this.initWebMode();
        } else if (mode == "print") {
            this.initPrintMode();
        }

        this.resizeIframe();
        this.initSwitchModes();
    };

    return this;

});
