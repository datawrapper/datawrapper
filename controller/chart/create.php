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
        if ($req->post('data') != null) {
            $chart->writeData($req->post('data'));
            $step = 'describe';
            if ($req->post('source-name') != null) {
                $chart->updateMetadata('describe.source-name', $req->post('source-name'));
                $step = 'visualize';
            }
            if ($req->post('source-url') != null) {
                $chart->updateMetadata('describe.source-url', $req->post('source-url'));
                $step = 'visualize';
            }
            if ($req->post('type') != null) {
                $chart->setType($req->post('type'));
            }
            if ($req->post('title') != null) {
                $chart->setTitle($req->post('title'));
            }
        }
        if ($req->post('theme') != null) {
            $installed_themes = array_map(function($t){ return $t['id']; }, DatawrapperTheme::all());
            if (in_array($req->post('theme'), $installed_themes)) {
                $chart->setTheme($req->post('theme'));
            }
        }
        $chart->save();
        $app->redirect('/chart/'.$chart->getId().'/'.$step);
    }
})->via('GET', 'POST');
