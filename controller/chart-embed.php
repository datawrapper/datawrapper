<?php

require_once '../lib/utils/visualizations.php';
require_once '../lib/utils/themes.php';
require_once '../lib/utils/chart_content.php';

/*
 * Shows a preview of a chart for display in an iFrame
 */
$app->get('/chart/:id', function ($id) use ($app) {
    check_chart_public($id, function($user, $chart) use ($app) {
        $page = get_chart_content($chart, $user);
        $page['padding'] = $app->request()->params('padding');
        $app->render('chart.twig', $page);
    });
});