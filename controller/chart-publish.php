<?php


require_once '../lib/utils/visualizations.php';
require_once '../lib/utils/themes.php';
require_once '../vendor/jsmin/jsmin.php';


/*
 * PUBLISH STEP - shows progress of publishing action and thumbnail generation
 * forwards to /chart/:id/finish
 */
$app->get('/chart/:id/publish', function ($id) use ($app) {
    check_chart_writable($id, function($user, $chart) use ($app) {

        $cfg = $GLOBALS['dw_config'];
        if (empty($cfg['s3'])) {
            $iframe_src = 'http://' . $cfg['chart_domain'] . '/' . $chart->getID() . '/';
        } else {
            $iframe_src = 'http://' . $cfg['s3']['bucket'] . '.s3.amazonaws.com/' . $chart->getID() . '/index.html';
        }

        $page = array(
            'chartData' => $chart->loadData(),
            'chart' => $chart,
            'visualizations' => get_visualizations_meta('', true),
            'vis' => get_visualization_meta($chart->getType()),
            'iframe' => $iframe_src,
            'themes' => get_themes_meta()
        );
        add_header_vars($page, 'chart');
        add_editor_nav($page, 4);
        $res = $app->response();
        $res['Cache-Control'] = 'max-age=0';

        if ($user->isAbleToPublish() && ($chart->getLastEditStep() == 3 || $app->request()->get('republish') == 1)) {
            // generate thumbnails
            $page['thumbnails'] = $GLOBALS['dw_config']['thumbnails'];
            $app->render('chart-generate-thumbnails.twig', $page);

        } else {

            $app->render('chart-publish.twig', $page);
        }

    });
});

