<?php

/*
 * Main controller for chart rendering
 */
$app->get('/chart/:id/', function ($id) use ($app) {
    disable_cache($app);

    check_chart_public($id, function($user, $chart) use ($app) {
        if ($chart->getLanguage() != '') {
            global $__l10n;
            $__l10n->loadMessages($chart->getLanguage());
        }
        $page = get_chart_content($chart, $user, $app->request()->get('minify') == 1);
        $page['thumb'] = $app->request()->params('t') == 1;
        $page['innersvg'] = $app->request()->get('innersvg') == 1;
        $page['plain'] = $app->request()->get('plain') == 1;
        $page['fullscreen'] = $app->request()->get('fs') == 1;
        $app->render('chart.twig', $page);
    });
});

$app->get('/chart/:id', function($id) use ($app) {
    $app->redirect('/chart/' . $id . '/');
});
