define(function(require) {
    var $ = require('jquery');
    var multiselection = require('./multiselection');

    function enableDrag() {
        var charts = $('div.mycharts-chart-list ul.thumbnails li.chart');

        charts.find('*').attr('draggable', 'false');
        charts.attr('draggable', 'true');
        charts.on('dragstart', function(e) {
            var chart_ids = [e.target.getAttribute('data-id')],
                ev = e.originalEvent;
            if (multiselection.selected[chart_ids[0]]) {
                chart_ids = Object.keys(multiselection.selected);
            } else {
                multiselection.selectNone();
            }
            ev.dataTransfer.setData('application/json', JSON.stringify(chart_ids));
            ev.dataTransfer.setDragImage(e.target, ev.offsetX || 10, ev.offsetY || 10);
            ev.dropEffect = "move";
        });

        charts.on('dragend', function(e) {
            $('ul.folders-left li').removeClass('dragtar');
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

    return function() {
        enableDrag();
        enableDrop();
    };
});
