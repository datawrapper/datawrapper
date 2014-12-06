<?php

/*
 * UPLOAD STEP
 */
$app->get('/chart/:id/upload', function ($id) use ($app) {
    disable_cache($app);

    check_chart_writable($id, function($user, $chart) use ($app) {
        $datasets = DatawrapperHooks::execute(DatawrapperHooks::GET_DEMO_DATASETS);
        $groups = array();
        foreach ($datasets as $ds) {
            if (!isset($groups[$ds['type']])) $groups[$ds['type']] = array('type' => $ds['type'], 'datasets' => array());
            $groups[$ds['type']]['datasets'][] = $ds;
        }
        $page = array(
            'title' => $chart->getID() . ' :: '.__('Upload Data'),
            'chartData' => $chart->loadData(),
            'chart' => $chart,
            'datasets' => $groups
        );
        add_header_vars($page, 'chart');
        add_editor_nav($page, 1);
        $res = $app->response();
        $res['Cache-Control'] = 'max-age=0';
        $app->render('chart/upload.twig', $page);
    });
});