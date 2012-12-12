<?php

//GET route
$app->get('/', function () use ($app) {
    disable_cache($app);

    if ($app->request()->get('c')) {
        // found link to a legacy chart
        $app->redirect('/legacy/'.$app->request()->get('c').'.html');
    } else {

        $chart_ids = array('RXoKw', 'rf47Q', 'a4Yyf', '78iap');
        $charts = ChartQuery::create()->findPKs($chart_ids);

        $page = array(
            'title' => 'Datawrapper',
            'pageClass' => 'home',
            'recent_charts' => $charts
        );
        add_header_vars($page, '');

        if (!empty($GLOBALS['dw_config']['disclaimer'])) {
            $page['disclaimer'] = $GLOBALS['dw_config']['disclaimer'];
        }

        $app->render('home.twig', $page);
    }
});

$app->get('/legacy/actions/export.php', function() use ($app) {
    $c = $app->request()->get('c');
    $app->redirect('/legacy/data/'.$c.'.csv');
});