define(function(require) {
    var $ = require('jquery'),
        selected = {},
        thumbnails = $('.thumbnails');

    return {
        init: function() {
            $('.chart .thumbnail .dw-checkbox')
                .on('click', function(evt) {
                    evt.stopPropagation();
                    evt.preventDefault();
                    var thumb = $(this).parent('.thumbnail');
                    var chart_id = thumb.data('id');
                    if (!selected[chart_id]) {
                        selected[chart_id] = true;
                        thumb.addClass('checked');
                    } else {
                        delete selected[chart_id];
                        thumb.removeClass('checked');
                    }
                    thumbnails[Object.keys(selected).length > 1 ? 'addClass' : 'removeClass']('multi-select');
                });

            $('.chart .thumbnail .dropdown-toggle')
                .on('click', function() {
                    var thumb = $(this).parents('.thumbnail');
                    var chart_id = thumb.data('id');
                    console.log(chart_id);
                    if (!selected[chart_id]) {
                        // unselect all
                        selected = {};
                        $('.chart .thumbnail').removeClass('checked');
                        thumbnails.removeClass('multi-select');
                    }
                });
        },
        selected: selected
    };
});
