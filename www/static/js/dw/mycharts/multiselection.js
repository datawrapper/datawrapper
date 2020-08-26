define(function (require) {
    var $ = require('jquery'),
        d3 = require('d3'),
        selected = d3.set([]), // https://github.com/d3/d3-collection#sets
        thumbnails = $('.thumbnails');

    function selectNone() {
        selected.clear();
        $('.chart .thumbnail').removeClass('checked');
        thumbnails.removeClass('multi-select');
    }

    return {
        init: function () {
            selected.clear();
            $('.chart .thumbnail .dw-checkbox').on('click', function (evt) {
                evt.stopPropagation();
                evt.preventDefault();
                var thumb = $(this).parent('.thumbnail');
                var chart_id = thumb.data('id');
                if (!selected.has(chart_id)) {
                    selected.add(chart_id);
                    thumb.addClass('checked');
                } else {
                    selected.remove(chart_id);
                    thumb.removeClass('checked');
                }
                thumbnails[Object.keys(selected).length > 1 ? 'addClass' : 'removeClass'](
                    'multi-select'
                );
            });

            $('.chart .thumbnail .dropdown-toggle').on('click', function () {
                var thumb = $(this).parents('.thumbnail');
                var chart_id = thumb.data('id');
                if (!selected.has(chart_id)) {
                    // unselect all
                    selectNone();
                }
            });
        },
        selected: selected,
        selectNone: selectNone
    };
});
