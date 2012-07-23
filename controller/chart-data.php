<?php

/**
 * API: get data to a chart
 *
 * @param chart_id chart id
 */
$app->get('/chart/:id/data', function($chart_id) use ($app) {
    $chart = ChartQuery::create()->findPK($chart_id);
    http_cache_last_modified($chart->getLastModifiedAt('U'));
    if (!empty($chart)) {
        print $chart->loadData();
    } else {
        error_chart_not_found($chart_id);
    }
});