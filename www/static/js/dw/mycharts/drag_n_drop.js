define(function(require) {
    var $ = require('jquery');
    var multiselection = require('./multiselection');

    function enableDrag() {
        var charts = $('div.mycharts-chart-list ul.thumbnails li.chart');

        var dragImage;

        charts.find('*').attr('draggable', 'false');
        charts.attr('draggable', 'true');
        charts.on('dragstart', function(e) {
            var chart_ids = [e.target.getAttribute('data-id')],
                ev = e.originalEvent;
            if (multiselection.selected.has(chart_ids[0])) {
                chart_ids = multiselection.selected.values();
            } else {
                multiselection.selectNone();
            }
            ev.dataTransfer.setData('application/json', JSON.stringify(chart_ids));
            dragImage = chart_ids.length == 1 ? e.target : getMultiDragImage(chart_ids);
            ev.dataTransfer.setDragImage(dragImage, 0,0);
            ev.dropEffect = "move";
        });

        charts.on('dragend', function(e) {
            $('ul.folders-left li').removeClass('dragtar');
            $('.custom-drag-image').remove();
        });
    }

    function enableDrop() {
        var drop_targets = $('ul.folders-left li');

        drop_targets.on('dragenter', function(e) {
            e.preventDefault();
            drop_targets.removeClass('dragtar');
            e.currentTarget.classList.add('dragtar');
        });

        drop_targets.on('dragover', function(e) {
            e.preventDefault();
        });

        drop_targets.on('drop', function(e) {
            e.preventDefault();
            drop_targets.removeClass('dragtar');
            console.log(e.originalEvent.dataTransfer.getData('application/json'));
        });
    }

    function getMultiDragImage(chart_ids) {
        var l = chart_ids.length + 5,
            offset = 10,
            div = $('<div class="custom-drag-image" />')
                .css({
                    position: 'absolute',
                    top:-1000,
                    left: -1000,
                })
                .appendTo('ul.thumbnails');
        chart_ids.forEach(function(id, i) {
            $('.thumbnails li.chart[data-id="'+id+'"]')
                .clone(false)
                .css({
                    position: 'absolute',
                    zIndex: l-i,
                    top: (offset*i)+'px',
                    left: (offset*i)+'px',
                    opacity: 1 - (i*0.1)
                })
                .appendTo(div);
        });
        return div.get(0);
    }

    return function() {
        enableDrag();
        enableDrop();
    };
});
