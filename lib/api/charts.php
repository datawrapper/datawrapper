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
            $res[] = $chart->shortArray();
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
                break;
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
$app->get('/gallery', function() use ($app) {
    $result = array();
    $q = ChartQuery::create()
        ->filterByShowInGallery(true)
        ->orderByCreatedAt('desc');
    if ($app->request()->get('type')) {
        $q->filterByType($app->request()->get('type'));
    }
    if ($app->request()->get('theme')) {
        $q->filterByTheme($app->request()->get('theme'));
    }
    if ($app->request()->get('month')) {
        $q->filterByTheme($app->request()->get('theme'));
    }
    $charts = $q->limit(20)->find();
    foreach ($charts as $chart) {
        $result[] = $chart->toArray();
    }
    ok($result);
});

/* load chart meta data */
$app->get('/charts/:id', function($id) use ($app) {
    $chart = ChartQuery::create()->findPK($id);
    if (!empty($chart)) {
        ok($chart->toArray());
    } else {
        error('chart-not-found', 'No chart with that id was found');
    }
});

/* check user and update chart meta data */
$app->put('/charts/:id', function($id) use ($app) {

});

/* upload data to a chart */
$app->put('/charts/:id/data', function($id) use ($app) {
    $user = DatawrapperSession::getUser();
    if ($user->isLoggedIn()) {
        $chart = ChartQuery::create()->findPK($id);
        if (!empty($chart)) {
            if ($chart->getAuthorId() == $user->getId()) {
                $data = $app->request()->getBody();
                $path = '../../charts/data/' . $chart->getCreatedAt('Ym');
                try {
                    if (!file_exists($path)) {
                        mkdir($path);
                    }
                    $filename = $path . '/' . $chart->getId() . '.csv';
                    file_put_contents($filename, $data);
                    ok($filename);
                } catch (Exception $e) {
                    error('io-error', $path.' '.$e->getMessage());
                }
            } else {
                error('access-denied', 'this is not your chart');
            }
        } else {
            error('chart-not-found', 'No chart with that id was found');
        }
    }
});