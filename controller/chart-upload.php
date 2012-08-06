<?php

require_once '../lib/templates/demo_datasets.php';

/*
 * UPLOAD STEP
 */
$app->get('/chart/:id/upload', function ($id) use ($app) {
    check_chart_writable($id, function($user, $chart) use ($app) {
        $page = array(
            'chartData' => $chart->loadData(),
            'chart' => $chart,
            'datasets' => getDemoDatasets()
        );
        add_header_vars($page, 'chart');
        add_editor_nav($page, 1);
        $res = $app->response();
        $res['Cache-Control'] = 'max-age=0';
        $app->render('chart-upload.twig', $page);
    });
});