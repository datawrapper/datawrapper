<?php

$app->get('/mycharts', function () use ($app) {
    $user = DatawrapperSession::getUser();
    if ($user->isLoggedIn()) {
        $page = array(
            'charts' => ChartQuery::create()->getPublicChartsByUser($user)
        );
        add_header_vars($page, 'mycharts');
        $app->render('mycharts.twig', $page);
    } else {
        error_mycharts_need_login();
    }
});