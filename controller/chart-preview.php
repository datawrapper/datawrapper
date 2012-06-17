<?php


require_once '../lib/utils/visualizations.php';
require_once '../lib/utils/themes.php';

/*
 * VISUALIZE STEP
 */
$app->get('/chart/:id/preview', function ($id) use ($app) {
    check_chart_exists_and_writable($id, function($user, $chart) use ($app) {
        $page = array(
            'chartData' => $chart->loadData(),
            'chart' => $chart
        );
        add_header_vars($page, 'create');
        add_editor_nav($page, 3);
        $app->render('chart-visualize.twig', $page);
    });
});