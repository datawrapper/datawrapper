<?php

// redirects to the last edited step of the chart editor (todo)
$app->get('/chart/:id/edit', function($chartid) use ($app) {
    disable_cache($app);

    check_chart_exists($chartid, function($chart) use ($app) {
        $step = 'upload';
        switch ($chart->getLastEditStep()) {
            case 0:
            case 1: $step = 'upload'; break;
            case 2: $step = 'describe'; break;
            default: $step = 'visualize#tell-the-story';
        }
        $app->redirect('/chart/'.$chart->getId() . '/' . $step);
    });
});