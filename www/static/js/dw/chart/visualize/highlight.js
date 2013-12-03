define(function() {

    var chart = dw.backend.currentChart;
    // load dataset
    function _getHighlights() {
        var sel = chart.get('metadata.visualize.highlighted-series');
        return _.isArray(sel) ? sel.slice(0) : [];
    }

    function highlightSeriesClick(e) {
        var badge = $(e.target).parents('.badge'),
            series = badge.data('series'),
            li = badge;
            selected = _getHighlights();
        selected = _.without(selected, String(series));
        chart.set('metadata.visualize.highlighted-series', selected);
        li.remove();
        e.preventDefault();
    }
    $('.highlighted-series .badge').click(highlightSeriesClick);

    function initHighlightSeries() {
        var vis = $('iframe').get(0).contentWindow.__dw &&
                  $('iframe').get(0).contentWindow.__dw.vis ?
                  $('iframe').get(0).contentWindow.__dw.vis :
                  dw.backend.currentVis,
            s = $('#highlight-series'),
            s2 = $('.highlighted-series');
        s.find("option[value!='---']").remove();
        var keys = vis.keys();
        keys.sort();
        _.each(keys, function(key) {
            $('<option />')
                .attr('value', key)
                .html(key+(vis.keyLabel(key) != key ? ' ('+vis.keyLabel(key)+')' : ''))
                .appendTo(s);
        });
        s.off('change').change(function() {
            if (s.val() != "---") {
                var selected = _getHighlights();
                if (_.indexOf(selected, s.val()) >= 0) {
                    s.val('---');
                    return;
                }
                var span = $('<span><i class="icon-remove icon-white"></i>'+$('option:selected', s).text().substr(0, 20)+'</span>')
                            .addClass('badge badge-info')
                            .data('series', s.val());
                selected.push(s.val());
                chart.set('metadata.visualize.highlighted-series', selected);
                s2.append(span);
                span.click(highlightSeriesClick);
                s.val('---');
            }
        });
    }

    return initHighlightSeries;

});