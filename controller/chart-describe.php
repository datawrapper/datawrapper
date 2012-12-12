<?php

/*
 * DESCRIBE STEP
 */
$app->get('/chart/:id/describe', function ($id) use ($app) {
    disable_cache($app);

    check_chart_writable($id, function($user, $chart) use ($app) {
        $page = array(
            'chartData' => $chart->loadData(),
            'chart' => $chart
        );
        add_header_vars($page, 'chart');
        add_editor_nav($page, 2);

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

        $page['numberformats'] = array(
            'n3' => '3 ('.number_format(1234.56789, 3, $d, $k).')',
            'n2' => '2 ('.number_format(1234.56789, 2, $d, $k).')',
            'n1' => '1 ('.number_format(1234.56789, 1, $d, $k).')',
            'n0' => '0 ('.number_format(1234.56789, 0, $d, $k).')'
        );

        $app->render('chart-describe.twig', $page);
    });
});