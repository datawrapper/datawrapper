<?php

/*
 * DESCRIBE STEP
 */
$app->get('/chart/:id/describe', function ($id) use ($app) {
    disable_cache($app);

    check_chart_writable($id, function($user, $chart) use ($app) {

        $chart->refreshExternalData();

        $page = array(
            'title' => strip_tags($chart->getTitle()).' - '.$chart->getID() . ' - '.__('Check & Describe'),
            'chartData' => $chart->loadData(),
            'chart' => $chart,
            'readonly' => !$chart->isDataWritable($user)
        );
        add_header_vars($page, 'chart');
        add_editor_nav($page, 2, $chart);

        switch(substr(DatawrapperSession::getLanguage(), 0, 2)) {
            case 'de':
                $k = '.';
                $d = ',';
                break;
            case 'fr':
                $k = ' ';
                $d = ',';
                break;
            default:
                $k = ',';
                $d = '.';
        }

        $page['columntypes'] = array(
            'text' => 'Text',
            'number' => 'Number',
            'date' => 'Date'
        );

        $page['numberformats'] = array(
            'n3' => '3 ('.number_format(1234.56789, 3, $d, $k).')',
            'n2' => '2 ('.number_format(1234.56789, 2, $d, $k).')',
            'n1' => '1 ('.number_format(1234.56789, 1, $d, $k).')',
            'n0' => '0 ('.number_format(1234.56789, 0, $d, $k).')'
        );

        $page['significantdigits'] = array(
            's6' => '6 ('.number_format(1234.56789, 2, $d, $k).')',
            's5' => '5 ('.number_format(123.456789, 2, $d, $k).')',
            's4' => '4 ('.number_format(12.34, 2, $d, $k).')',
            's3' => '3 ('.number_format(1.23, 2, $d, $k).')',
            's2' => '2 ('.number_format(0.12, 2, $d, $k).')',
            's1' => '1 ('.number_format(0.01, 2, $d, $k).')'
        );

        $page['svelte_data'] = [
            'chart' => $chart,
            'readonly' => !$chart->isDataWritable($user),
            'chartData' => $chart->loadData(),
        ];

        $app->render('chart/describe'.($user->isAdmin() && $app->request()->get('beta') ? '-new' : '').'.twig', $page);
    });
});
