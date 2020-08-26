define(function (require) {
    var $ = require('jquery'),
        httpReq = require('../backend/httpReq'),
        twig = require('./twig_globals'),
        showChartModal = require('./showChartModal'),
        cft;

    return function () {
        cft = window.ChartFolderTree;
        if (twig.globals.user2) {
            $('.thumbnail > a').click(function (e) {
                e.preventDefault();
                dw.backend.popupChart($(e.target).parents('.chart').data('id'), true);
            });

            $('a.edit').click(function (e) {
                e.preventDefault();
                var chart = $(e.target).parents('.chart');
                location.href = $('.thumbnail > a', chart).attr('href');
            });
        }

        $('a.delete').click(function (e) {
            e.preventDefault();
            var chart = $(e.target).parents('.chart'),
                id = chart.data('id');
            if (window.confirm(twig.globals.strings.confirm_chart_delete)) {
                $.ajax({
                    url: '/api/2/charts/' + id,
                    type: 'DELETE',
                    success: function () {
                        chart.remove();
                        cft.removeChartFromCurrent(id);
                    }
                });
            }
        });

        $('.chart a.duplicate').click(function (e) {
            e.preventDefault();
            var id = $(e.target).parents('.chart').data('id');

            httpReq.post('/v3/charts/' + id + '/copy').then(function (data) {
                // redirect to copied chart
                window.location.href = '/chart/' + data.id + '/visualize';
            });
        });

        $('.chart a.popup').click(function (e) {
            e.preventDefault();
            var chart = cft.charts[$(e.target).parents('.chart').data('id')];
            showChartModal(chart);
        });

        $('a.popup h3')
            .click(function (e) {
                e.stopPropagation();
                // e.preventDefault();
                var title = $(this);
                title.data('old-content', title.html());
            })
            .on('focus', function () {
                // select all
                var div = $(this).get(0);
                window.setTimeout(function () {
                    var sel, range;
                    if (window.getSelection && document.createRange) {
                        range = document.createRange();
                        range.selectNodeContents(div);
                        sel = window.getSelection();
                        sel.removeAllRanges();
                        sel.addRange(range);
                    } else if (document.body.createTextRange) {
                        range = document.body.createTextRange();
                        range.moveToElementText(div);
                        range.select();
                    }
                }, 1);
            })
            .on('keypress', function (e) {
                var title = $(this);
                if (title.html().trim() != title.data('old-content')) {
                    title.parents('.thumbnail').addClass('unsaved-change');
                } else {
                    title.parents('.thumbnail').removeClass('unsaved-change');
                }
                if (e.keyCode == 13) {
                    // RETURN
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('return');
                    title.blur();
                } else if (e.keyCode == 27) {
                    // ESC
                    title.html(title.data('old-content'));
                    console.log('escape');
                    title.blur();
                }
            })
            .on('blur', function (e) {
                var title = $(this);
                if (title.html().trim() != title.data('old-content')) {
                    console.log('save changes');
                    $.ajax({
                        url: '/api/2/charts/' + title.parents('.thumbnail').data('id'),
                        method: 'PUT',
                        dataType: 'json',
                        data: JSON.stringify({ title: title.html().trim() }),
                        success: function () {
                            title.parents('.thumbnail').removeClass('unsaved-change');
                        }
                    });
                } else {
                    title.parents('.thumbnail').removeClass('unsaved-change');
                }
            });
    };
});
