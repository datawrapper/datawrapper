<?php


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
            'visualizations' => DatawrapperVisualization::all(),
            'vis' => DatawrapperVisualization::get($chart->getType()),
            'chartUrl' => $public_url,
            'chartUrlLocal' => '/chart/' . $chart->getID() . '/preview',
            'themes' => DatawrapperTheme::all(),
            'exportStaticImage' => !empty($cfg['phantomjs']),
            'chartActions' => DatawrapperHooks::execute(DatawrapperHooks::GET_CHART_ACTIONS, $chart),
            'estExportTime' => ceil(JobQuery::create()->estimatedTime('export') / 60)
        );
        add_header_vars($page, 'chart');
        add_editor_nav($page, 4);

        if ($user->isAbleToPublish()
            && ($chart->getLastEditStep() == 3 || $app->request()->get('republish') == 1)) {

            $published_urls = DatawrapperHooks::execute(DatawrapperHooks::GET_PUBLISHED_URL, $chart);
            if (!empty($published_urls)) {
                $chart->setPublicUrl($published_urls[0]);
                $page['chartUrl'] = $published_urls[0];
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

