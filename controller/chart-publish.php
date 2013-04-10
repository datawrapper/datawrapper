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
        $public_url = $chart->getPublicUrl();
        if (empty($public_url)) {
            $public_url = 'http://' . $cfg['chart_domain'] . '/' . $chart->getID() . '/';
        }

        $page = array(
            'chartData' => $chart->loadData(),
            'chart' => $chart,
            'visualizations' => get_visualizations_meta('', true),
            'vis' => get_visualization_meta($chart->getType()),
            'iframe' => $public_url,
            'themes' => get_themes_meta(),
            'exportStaticImage' => !empty($cfg['phantomjs']),
            'estExportTime' => ceil(JobQuery::create()->estimatedTime('export') / 60)
        );
        add_header_vars($page, 'chart');
        add_editor_nav($page, 4);

        if ($user->isAbleToPublish()
            && ($chart->getLastEditStep() == 3 || $app->request()->get('republish') == 1)) {
            // generate thumbnails
            $page['thumbnails'] = $GLOBALS['dw_config']['thumbnails'];
            $app->render('chart-publishing.twig', $page);

            // queue a job for thumbnail generation
            $params = array(
                'width' => $chart->getMetadata('publish.embed-width'),
                'height' => $chart->getMetadata('publish.embed-height')
            );
            $job = JobQuery::create()->createJob("static", $chart, $user, $params);

        } else {
            $app->render('chart-publish.twig', $page);
        }

    });
});

