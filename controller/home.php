<?php

//GET route
$app->get('/', function () use ($app) {
    if ($app->request()->get('c')) {
        // found link to a legacy chart
        $app->redirect('/legacy/'.$app->request()->get('c').'.html');
    } else {
        $page = array(
            'title' => 'Datawrapper',
            'recent_charts' => ChartQuery::create()->getGalleryCharts(array('layout'=>'default'), 0, 3)
        );
        add_header_vars($page, '');

        $res = $app->response();
        $res['Cache-Control'] = 'max-age=0';

        $app->render('home.twig', $page);
    }
});

$app->get('/legacy/actions/export.php', function() use ($app) {
    $c = $app->request()->get('c');
    $app->redirect('/legacy/data/'.$c.'.csv');
});