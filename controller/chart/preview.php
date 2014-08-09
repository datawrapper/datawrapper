<?php

/*
 * Shows a preview of a chart for display in an iFrame
 */
$app->get('/chart/:id/preview/?', function ($id) use ($app) {
    disable_cache($app);

    check_chart_readable($id, function($user, $chart) use ($app) {
        if ($chart->getLanguage() != '') {
            global $__l10n;
            $__l10n->loadMessages($chart->getLanguage());
        }
        $page = get_chart_content($chart, $user, $app->request()->get('minify'), $app->request()->get('debug'));
        $page['plain'] = $app->request()->get('plain') == 1;
        $page['fullscreen'] = $app->request()->get('fs') == 1;
        $page['innersvg'] = $app->request()->get('innersvg') == 1;
        $app->render('chart.twig', $page);
    });
});

$app->get('/chart/:id/nojs.png', function ($id) use ($app) {
    $app->redirect('/static/img/nojs.png');
});
