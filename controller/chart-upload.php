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
        add_header_vars($page, 'create');
        add_editor_nav($page, 1);
        $app->etag('chart/'.$id.'/upload/'.$chart->getLastModifiedAt('U'));
        $app->lastModified(intval($chart->getLastModifiedAt('U')));
        $app->render('chart-upload.twig', $page);
    });
});