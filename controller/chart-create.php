<?php

$app->get('/chart/create', function() use ($app) {
    disable_cache($app);

    $user = DatawrapperSession::getUser();
    if (!$user->isLoggedIn() && $GLOBALS['dw_config']['prevent_guest_charts']) {
        error_access_denied();
    } else {
        $chart = ChartQuery::create()->createEmptyChart($user);
        $app->redirect('/chart/'.$chart->getId().'/upload');
    }
});