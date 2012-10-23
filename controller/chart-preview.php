<?php

require_once '../lib/utils/visualizations.php';
require_once '../lib/utils/themes.php';
require_once '../lib/utils/chart_content.php';

/*
 * Shows a preview of a chart for display in an iFrame
 */
$app->get('/chart/:id/preview/?', function ($id) use ($app) {
    check_chart_writable($id, function($user, $chart) use ($app) {
        $page = get_chart_content($chart, $user, $app->request()->get('minify') == 1);
        $res = $app->response();
        $res['Cache-Control'] = 'max-age=0';
        $app->render('chart.twig', $page);
    });
});