define(function(require) {
    var $ = require('jquery');

    function enableDrag() {
        var charts = $('div.mycharts-chart-list ul.thumbnails li.chart');

        charts.find('*').attr('draggable', 'false');
        charts.attr('draggable', 'true');
        charts.on('dragstart', function(e) {
            var chart_id = e.target.getAttribute('data-id'),
                ev = e.originalEvent;
            ev.dataTransfer.setData('application/json', JSON.stringify([ chart_id ]));
            ev.dataTransfer.setDragImage(e.target, 0 ,0);
            ev.dropEffect = "move";
        });
    }

    function enableDrop() {
        var drop_targets = $('ul.folders-left li');

        drop_targets.on('dragenter', function(e) {
            e.preventDefault();
            e.target.classList.add('dragtar');
        });

        drop_targets.on('dragleave', function(e) {
            e.preventDefault();
            e.target.classList.remove('dragtar');
        });

        drop_targets.on('dragover', function(e) {
            e.preventDefault();
        });

        drop_targets.on('drop', function(e) {
            e.preventDefault();
            e.target.classList.remove('dragtar');
            console.log(e.originalEvent.dataTransfer.getData('application/json'));
        });
    }

    return function() {
        enableDrag();
        enableDrop();
    }
});
