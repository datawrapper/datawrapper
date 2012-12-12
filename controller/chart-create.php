<?php

$app->get('/chart/create', function() use ($app) {
    disable_cache($app);

    $user = DatawrapperSession::getUser();
    $chart = ChartQuery::create()->createEmptyChart($user);
    $app->redirect('/chart/'.$chart->getId().'/upload');
});