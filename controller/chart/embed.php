<?php

/*
 * Main controller for chart rendering
 */
$app->get('/chart/:id/', function ($id) use ($app) {
    check_chart_public($id, function($user, $chart) use ($app) {
        $app->redirect("/preview/" . $chart->getId() . "?published=1");
        disable_cache($app);
    });
});

$app->get('/chart/:id', function($id) use ($app) {
    $app->redirect('/chart/' . $id . '/');
});
