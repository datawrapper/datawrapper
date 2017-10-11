
define(function() {

    var chart,
        theOldData = $('#upload-data-text').val(),
        uploadBtn = $('#upload-data');

    function init(dropCSVHereMsg, uploadCSVFileMsg) {

        chart = dw.backend.currentChart;


        $('#upload-data, .create-nav .submit').click(function(e) {
            uploadData($(e.target).attr('href') || 'describe');
            e.preventDefault();
        });

        initFileUpload();
        initDemoDatasets();

    }

    function initFileUpload() {
        var txtarea = $('#upload-data-text');

        new qq.FileUploader({
            element: $('#upload')[0],
            action: '/api/charts/' + dw.backend.currentChart.get('id') + '/data',
            allowedExtensions: ['txt', 'csv', 'tsv'],
            template: $('.upload-template').html(),
            classes: {
                button: 'upload-button',
                drop: 'upload-drop',
                dropActive: 'upload-drop-active',
                list: 'qq-upload-list',
                file: 'qq-upload-file',
                spinner: 'qq-upload-spinner',
                size: 'qq-upload-size',
                cancel: 'qq-upload-cancel'
            },
            multiple: false,
            onComplete: function(code, filename, res) {
                if (res.status == "ok") nextPage('describe');
                else {
                    if (typeof(res.message) === 'undefined')
                        res.message = "Data can not be parsed!";
                    dw.backend.logError(res.message, txtarea.parent().parent());
                }
            }
        });

        txtarea.data('orig-val', txtarea.val());

        $('.upload-drop').css({
            position: 'absolute',
            top: txtarea.offset().top - $('.navbar').height(),
            left: txtarea.offset().left+2,
            width: txtarea.width()+2,
            height: txtarea.height()+2,
            'line-height': txtarea.height()+'px'
        });
    }


    function nextPage(url) {
        location.href = url;
    }

    function uploadData(url) {
        var uploadReady,
            theData = $('#upload-data-text').val();
        if (theData == theOldData) {
            // no need to re-upload same data
            // immediately proceed to next page
            return nextPage(url);
        }
        uploadBtn.find('.icon-chevron-right')
            .removeClass('icon-white icon-chevron-right')
            .addClass('fa-spin fa fa-circle-o-notch');

        if ($.trim(theData) === "") {
            uploadBtn.find('i.fa-circle-o-notch').hide();
            dw.backend.alert(dw.backend.messages.noData);
            $('.upload-form .control-group').addClass('warning');
            return false;
        }
        uploadReady = $.ajax({
            url: '/api/charts/' + chart.get('id') + '/data',
            type: 'PUT',
            data: theData,
            processData: false,
            dataType: 'json'
        });
        if (chart.hasUnsavedChanges()) {
            $.when(uploadReady, chart.nextSavePromise()).done(proceed);
        } else {
            $.when(uploadReady).done(proceed);
        }
        function proceed(res) {
            if (_.isArray(res)) res = res[0];
            uploadBtn.find('i.fa-circle-o-notch').hide();
            if (res.status == "ok") {
                // data is saved correctly, so proceed
                nextPage(url);
            } else {
                alert('error: '+res.message);
            }
        }
        return false;
    }

    function initDemoDatasets() {
        var sel = $('#demo-datasets');
        sel.change(function(evt) {
            evt.preventDefault();
            var a = $('option:selected', sel);
            $('#upload-data-text').val(a.data('data'));
            if (a.data('presets')) {
                $.each(a.data('presets'), function(key, val) {
                    dw.backend.currentChart.set(key, val);
                });
            }
        });
    }

    return {
        init: init
    };

});
