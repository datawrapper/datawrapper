<?php

/* create a new empty chart */
$app->post('/charts', function() use ($app) {
    $chart = new Chart();
    $chart->setCreatedAt(time());
    $chart->setLastModifiedAt(time());
    $chart->save();
    $result = array($chart->toArray());
    $app->render('json-ok.php', $result);
});

/* return a list of all charts by the logged user */
$app->get('/charts', function() use ($app) {
    
});

/* load chart meta data */
$app->get('/charts/:id', function($id) use ($app) {
    $res = DW::getChartMetaData($id);
    $app->render('json-error.php', $res, 200);
});

/* check user and update chart meta data */
$app->put('/charts/:id', function($id) use ($app) {
    if (DW::checkLogin()) {
        if (DW::chartIsWritable($id)) {
            $data = json_decode($app->request()->getBody());
            DW::setChartMetaData($id, $data);
        } else {
            $app->render('json-error.php', array('code' => 'access-denied', 'msg' => 'You don\'t have the rights to modifiy this chart'));
        }
    } else {
        $app->render('json-error.php', array('code' => 'need-login', 'msg' => 'you must be logged in'));
    }
    $res = DW::setChartMetaData($id);
});