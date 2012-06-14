<?php

$app->get('/chart/create', function() use ($app) {
    $user = DatawrapperSession::getUser();
    $chart = ChartQuery::create()->createEmptyChart($user);
    $app->redirect('/chart/'.$chart->getId().'/upload');
});