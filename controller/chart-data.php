<?php

/**
 * API: get data to a chart
 *
 * @param chart_id chart id
 */
$app->get('/chart/:id/data(\.csv)?', function($chart_id) use ($app) {
    disable_cache($app);

    $chart = ChartQuery::create()->findPK($chart_id);
    $res = $app->response();
    $res['Cache-Control'] = 'max-age=0';
    $res['Content-Type'] = 'text/csv';
    $res['Content-Disposition'] = 'attachment; filename="datawrapper-'.$chart_id.'.csv"';
    if (!empty($chart)) {
        print $chart->loadData();
    } else {
        error_chart_not_found($chart_id);
    }
});