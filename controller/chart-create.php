<?php

$app->map('/chart/create', function() use ($app) {
    disable_cache($app);

    $cfg = $GLOBALS['dw_config'];

    $user = DatawrapperSession::getUser();
    if (!$user->isLoggedIn() && isset($cfg['prevent_guest_charts']) && $cfg['prevent_guest_charts']) {
        error_access_denied();
    } else {
        $chart = ChartQuery::create()->createEmptyChart($user);
        $req = $app->request();
        $step = 'upload';
        if ($req->params('data') != null) {
            $chart->writeData($req->params('data'));
            $step = 'describe';
            if ($req->params('source-name') != null) {
                $chart->updateMetadata('describe.source-name', $req->params('source-name'));
            }
            if ($req->params('source-url') != null) {
                $chart->updateMetadata('describe.source-url', $req->params('source-url'));
            }
            if ($req->params('type') != null) {
                $chart->setType($req->params('type'));
                $step = 'visualize';
            }
        }
        $chart->save();
        $app->redirect('/chart/'.$chart->getId().'/'.$step);
    }
})->via('GET', 'POST');
