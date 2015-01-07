
define(function() {

    var chart;

    function init(dropCSVHereMsg, uploadCSVFileMsg) {

        chart = dw.backend.currentChart;

        $('#upload-data, .create-nav .submit').click(function(e) {
            uploadData('describe');
            e.preventDefault();
        });

        initFileUpload();

        $('.submit').click(function(e) {
            var txtarea = $('#upload-data-text');
            if (txtarea.val() != txtarea.data('orig-val')) {
                e.preventDefault();
                var a = $(e.target);
                if (e.target.nodeName.toLowerCase() != "a") a = a.parents('a');
                uploadData(a.attr('href'));
            }
        });

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
        if ($.trim(theData) === "") {
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