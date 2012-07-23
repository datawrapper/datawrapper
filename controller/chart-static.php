<?php


require_once '../lib/utils/visualizations.php';
require_once '../lib/utils/themes.php';

/*
 * VISUALIZE STEP
 */
$app->get('/chart/:id/static', function ($id) use ($app) {
    check_chart_public($id, function($user, $chart) use ($app) {
        $w = intval($app->request()->params('w'));
        if (empty($w)) $w = 300;
        $h = intval($app->request()->params('h'));
        if (empty($h)) $h = 220;

        $out = $chart->getId().'-'.$w.'-'.$h.'.png';
        $img_dir = dirname(dirname(__FILE__)).'/charts/images/';
        $script = dirname(dirname(__FILE__)).'/scripts/render.js';
        $cmd = PHANTOMJS.' '.$script.' '.$chart->getId().' '.$img_dir.$out.' '.$w.' '.$h;

        header("Content-Type: image/png");

        if (!file_exists($img_dir.$out)) {
            exec($cmd);
        }
        $fp = fopen($img_dir.$out, 'rb');
        fpassthru($fp);
        exit;

    });
});

