<?php

/*
 * PUBLISH STEP - shows progress of publishing action and thumbnail generation
 */
$app->get('/chart/:id/publish', function ($id) use ($app) {
    disable_cache($app);

    check_chart_writable($id, function($user, $chart) use ($app) {

        $cfg = $GLOBALS['dw_config'];

        $chartActions = DatawrapperHooks::execute(DatawrapperHooks::GET_CHART_ACTIONS, $chart);
        
        // add duplicate action
        $chartActions[] = array(
            'id' => 'duplicate',
            'icon' => 'plus',
            'title' => __('Duplicate this chart'),
            'order' => 500
        );

        // sort actions
        usort($chartActions, function($a, $b) {
            return (isset($a['order']) ? $a['order'] : 999) - (isset($b['order']) ? $b['order'] : 999);
        });

        $page = array(
            'title' => $chart->getID() . ' :: '.__('Publish'),
            'chartData' => $chart->loadData(),
            'chart' => $chart,
            'visualizations' => DatawrapperVisualization::all(),
            'vis' => DatawrapperVisualization::get($chart->getType()),
            'chartUrl' => $chart->getPublicUrl(),
            'chartUrlLocal' => '/chart/' . $chart->getID() . '/preview',
            'themes' => DatawrapperTheme::all(),
            'exportStaticImage' => !empty($cfg['phantomjs']),
            'chartActions' => $chartActions,
            'estExportTime' => ceil(JobQuery::create()->estimatedTime('export') / 60)
        );

        add_header_vars($page, 'chart', 'chart-editor/publish.css');
        add_editor_nav($page, 4);

        $app->render('chart/publish.twig', $page);

    });
});

