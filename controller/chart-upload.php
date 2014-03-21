<?php

/*
 * UPLOAD STEP
 */
$app->get('/chart/:id/upload', function ($id) use ($app) {
    disable_cache($app);

    check_chart_writable($id, function($user, $chart) use ($app) {
        $page = array(
            'title' => $chart->getID() . ' :: '.__('Upload Data'),
            'chartData' => $chart->loadData(),
            'chart' => $chart,
            'datasets' => DatawrapperHooks::execute(DatawrapperHooks::GET_DEMO_DATASETS)
        );
        add_header_vars($page, 'chart');
        add_editor_nav($page, 1);
        $res = $app->response();
        $res['Cache-Control'] = 'max-age=0';
        $app->render('chart/upload.twig', $page);
    });
});