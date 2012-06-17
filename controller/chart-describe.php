<?php

/*
 * DESCRIBE STEP
 */
$app->get('/chart/:id/describe', function ($id) use ($app) {
    check_chart_writable($id, function($user, $chart) use ($app) {
        $page = array(
            'chartData' => $chart->loadData(),
            'chart' => $chart
        );
        add_header_vars($page, 'create');
        add_editor_nav($page, 2);
        $app->render('chart-describe.twig', $page);
    });
});