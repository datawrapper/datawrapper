<?php

require_once ROOT_PATH . 'lib/utils/check_iframe_origin.php';

/*
 * Shows a preview of a chart for display in an iFrame
 */
$app->get('/(chart|map|table)/:id/preview/?', function ($id) use ($app) {
    $app->redirect("/preview/$id");
    disable_cache($app);
});

$app->get('/chart/:id/nojs.png', function ($id) use ($app) {
    $app->redirect('/static/img/nojs.png');
});

// static route to emulate published vis files
$app->get('/(chart|map|table)/:id/_static/:file+', function($id, $parts) use ($app) {
    check_chart_readable($id, function($user, $chart) use ($app, $parts) {
        $fn = implode('/', $parts);
        $vis = DatawrapperVisualization::get($chart->getType());
        if (file_exists(ROOT_PATH . 'www/' . $vis['__static_path'] . $fn)) {
            $app->redirect($vis['__static_path'] . $fn);
        } else {
            $app->notFound();
        }
    });
});
