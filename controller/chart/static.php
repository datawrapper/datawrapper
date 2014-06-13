<?php

/*
 * VISUALIZE STEP
 */
$app->get('/chart/:id/static', function ($id) use ($app) {
    disable_cache($app);

    check_chart_public($id, function($user, $chart) use ($app) {

        function get($var, $default) {
            global $app;
            $v = $app->request()->params($var);
            return empty($v) ? $default : $v;
        }

        $w = get('w', 300);
        $h = get('h', 220);
        $format = get('f', 'png');

        $out = $chart->getId().'-'.$w.'-'.$h.'.'.$format;

        $img_dir = dirname(dirname(__FILE__)).'/charts/images/';
        $script = dirname(dirname(__FILE__)).'/scripts/render.js';
        $cmd = PHANTOMJS.' '.$script.' '.$chart->getId().' '.$img_dir.$out.' '.$w.' '.$h;

        if ($format == 'png') {
            header("Content-Type: image/png");
        } else {
            $title = trim(strtolower($chart->getTitle()));
            $name = $chart->getId().'-'.preg_replace('/[äöüa-z0-9ß]+/', '-', $title).'.pdf';
            header('Content-Disposition: attachment;filename="' . $name . '"');
            header("Content-Type: application/pdf");
        }

        if (!file_exists($img_dir.$out)) {
            exec($cmd);
        }
        $fp = fopen($img_dir.$out, 'rb');
        fpassthru($fp);
        exit;

    });
});

