<?php

/* get list of all charts by the current user */
$app->get('/charts', function() {
    $user = DatawrapperSession::getUser();
    if ($user->isLoggedIn()) {
        $charts = ChartQuery::create()
            ->filterByAuthorId($user->getId())
            ->filterByDeleted(false)
            ->orderByLastModifiedAt('desc')
            ->find();
        $res = array();
        foreach ($charts as $chart) {
            $res[] = $chart->toArray();
        }
        ok($res);
    } else {
        error('need-login', 'You need to be logged in to do that');
    }
});

/* create a new empty chart */
$app->post('/charts', function() {
    $user = DatawrapperSession::getUser();
    if ($user->isLoggedIn()) {
        $i = 0;
        while ($i++ < 10) {
            try {
                $chart = new Chart();
                $chart->setId(rand_chars(5));
                $chart->setCreatedAt(time());
                $chart->setLastModifiedAt(time());
                $chart->setAuthorId($user->getId());
                $chart->save();
            } catch (Exception $e) {
                continue;
            }
        }
        if ($chart->isNew()) {
            error('create-chart-error', 'could not get an id for the chart ' . $i . ' ' . rand_chars(5));
        } else {
            $result = array($chart->toArray());
            ok($result);
        }
    } else {
        error('need-login', 'You need to be logged in to create a chart..');
    }
});

/*
 * generate a random id string
 */
function rand_chars($l, $u = FALSE) {
    // implementation taken from http://www.php.net/manual/de/function.rand.php#87487
    $c = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
    if (!$u) for ($s = '', $i = 0, $z = strlen($c)-1; $i < $l; $x = rand(0,$z), $s .= $c{$x}, $i++);
    else for ($i = 0, $z = strlen($c)-1, $s = $c{rand(0,$z)}, $i = 1; $i != $l; $x = rand(0,$z), $s .= $c{$x}, $s = ($s{$i} == $s{$i-1} ? substr($s,0,-1) : $s), $i=strlen($s));
    return $s;
}

/* return a list of all charts by the logged user */
$app->get('/charts', function() {
    ok(time());
});

/*
 * returns the metadata for all charts that are allowed
 * to show in the gallery
 */
$app->get('/gallery', function() {
    $result = array();
    $charts = ChartQuery::create()
        ->filterByShowInGallery(true)
        ->orderByCreatedAt('desc')
        ->limit(10)
        ->find();
    foreach ($charts as $chart) {
        $result[] = $chart->toArray();
    }
    ok($result);
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