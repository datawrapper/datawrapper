<?php

require_once '../lib/utils/visualizations.php';
require_once '../lib/utils/themes.php';
require_once '../lib/utils/chart_content.php';

/*
 * Shows a preview of a chart for display in an iFrame
 */
$app->get('/chart/:id/preview/?', function ($id) use ($app) {
    disable_cache($app);

    check_chart_writable($id, function($user, $chart) use ($app) {
        $page = get_chart_content($chart, $user, $app->request()->get('minify') == 1);
        $page['plain'] = $app->request()->get('plain') == 1;
        $page['fullscreen'] = $app->request()->get('fs') == 1;
        $page['innersvg'] = $app->request()->get('innersvg') == 1;
        $app->render('chart.twig', $page);
    });
});