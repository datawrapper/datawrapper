<?php


require_once '../lib/utils/visualizations.php';
require_once '../lib/utils/themes.php';

/*
 * PUBLISH STEP
 */
$app->get('/chart/:id/publish', function ($id) use ($app) {
    check_chart_writable($id, function($user, $chart) use ($app) {
        $page = array(
            'chartData' => $chart->loadData(),
            'chart' => $chart,
            'visualizations' => get_visualizations_meta('', true),
            'vis' => get_visualization_meta($chart->getType()),
            'themes' => get_themes_meta()
        );
        add_header_vars($page, 'chart');
        add_editor_nav($page, 4);
        $app->render('chart-publish.twig', $page);
    });
});