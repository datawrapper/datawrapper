<?php

require_once '../lib/utils/visualizations.php';
require_once '../lib/utils/themes.php';
require_once '../lib/utils/chart_content.php';

/*
 * Shows a preview of a chart for display in an iFrame
 */
$app->get('/chart/:id/', function ($id) use ($app) {
    disable_cache($app);

    check_chart_public($id, function($user, $chart) use ($app) {
        $page = get_chart_content($chart, $user, $app->request()->get('minify') == 1);
        $page['padding'] = $app->request()->params('padding');
        $page['innersvg'] = $app->request()->get('innersvg') == 1;
        $page['plain'] = $app->request()->get('plain') == 1;
        $app->render('chart.twig', $page);
    });
});

$app->get('/chart/:id', function ($id) use ($app) {
    $app->redirect('/chart/' . $id . '/');
});