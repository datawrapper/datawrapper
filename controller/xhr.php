<?php

/*
 * these controllers return small pieces of the UI
 */

/**
 * reloads the header menu after login/logout
 */
$app->get('/xhr/header/:page', function($active) use ($app) {
    disable_cache($app);

    $page = array();
    add_header_vars($page, $active);
    $res = $app->response();
    $res['Cache-Control'] = 'max-age=0';
    $app->render('header.twig', $page);
});

/**
 * reloads visualization specific options after the user
 * changed the visualization type
 */
$app->get('/xhr/:chartid/vis-options', function($id) use ($app) {
    disable_cache($app);

    check_chart_writable($id, function($user, $chart) use ($app) {
        $a = $app->request()->params('annotate');

        $vis = DatawrapperVisualization::get($chart->getType());

        parse_vis_options($vis);

        $page = array(
            'vis' => $vis,
            'theme' => ThemeQuery::create()->findPk($chart->getTheme()),
            'chart' => $chart,
            'language' => substr(DatawrapperSession::getLanguage(), 0, 2)
        );

        $app->render('chart/visualize/'.(!empty($a) ? 'annotate' : 'options').'.twig', $page);
    });
});


