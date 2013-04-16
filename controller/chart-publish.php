<?php


require_once '../lib/utils/visualizations.php';
require_once '../lib/utils/themes.php';
require_once '../vendor/jsmin/jsmin.php';


/*
 * PUBLISH STEP - shows progress of publishing action and thumbnail generation
 * forwards to /chart/:id/finish
 */
$app->get('/chart/:id/publish', function ($id) use ($app) {
    disable_cache($app);

    check_chart_writable($id, function($user, $chart) use ($app) {

        $cfg = $GLOBALS['dw_config'];
        $local_url = 'http://' . $cfg['chart_domain'] . '/' . $chart->getID() . '/index.html';
        $public_url = $chart->getPublicUrl();

        if (empty($public_url)) $public_url = $local_url;


        $page = array(
            'chartData' => $chart->loadData(),
            'chart' => $chart,
            'visualizations' => get_visualizations_meta('', true),
            'vis' => get_visualization_meta($chart->getType()),
            'chartUrl' => $public_url,
            'chartUrlLocal' => '/chart/' . $chart->getID() . '/preview',
            'themes' => get_themes_meta(),
            'exportStaticImage' => !empty($cfg['phantomjs']),
            'estExportTime' => ceil(JobQuery::create()->estimatedTime('export') / 60)
        );
        add_header_vars($page, 'chart');
        add_editor_nav($page, 4);

        if ($user->isAbleToPublish()
            && ($chart->getLastEditStep() == 3 || $app->request()->get('republish') == 1)) {

            if ($pub = get_module('publish', '../lib/')) {
                $url = $pub->getUrl($chart);
                $chart->setPublicUrl($url);
                $page['chartUrl'] = $url;
            } else {
                $chart->setPublicUrl($local_url);
            }
            $chart->save();

            // generate thumbnails
            $page['publish'] = true;

        }
        $app->render('chart-publish.twig', $page);

    });
});

