
$(function() {

    // open modal popup for exporting charts to PNG/PDF

    $.get('/plugins/export-image/export-modal.twig', function(data) {
        $('body').append(data);

        $('a[href=#export-image]').click(function(e) {
            e.preventDefault();
            $('#dwExportChart').modal();
            return false;
        });

        $('.ratio-select .option').click(function(e) {
            var opt = $(e.target);
            opt = $(e.target).hasClass('option') ? opt : opt.parents('.option');
            opt.parent().data('value', opt.data('value'));
            $('.option', opt.parent()).removeClass('selected');
            opt.addClass('selected');
        });

        $('.btn-export-chart').click(function(e) {
            e.preventDefault();
            $.ajax({
                url: '/api/jobs/export_image/'+dw.backend.currentChart.get('id'),
                type: 'post',
                dataType: 'json',
                data: JSON.stringify({
                    ratio: $('.ratio-select').data('value'),
                    format: $('input[name=format]:checked').val()
                })
            }).done(function(resp) {
                $('#dwExportChart').modal('hide');
                var msg = $('#dwExportChart').data('mail-sent-message');
                msg = msg.replace('%d', '<b>'+resp.data+'</b>');
                dw.backend.logMessage(msg, '.messages');
            });
        });
    });

});