<?php

/*
 * DESCRIBE STEP
 */
$app->get('/chart/:id/describe', function ($id) use ($app) {
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
            'numbers' => array(
                'n2' => number_format(1234.56789, 2, $d, $k),
                'n1' => number_format(1234.56789, 1, $d, $k),
                'n0' => number_format(1234.56789, 0, $d, $k)
            ),
            'percentages' => array(
                'p2' => number_format(95.72, 2, $d, $k).' %',
                'p1' => number_format(95.72, 1, $d, $k).' %',
                'p0' => number_format(95.72, 0, $d, $k).' %'
            ),
            'currency' => array(
                'c' => number_format(1234.56, 2, $d, $k).' X',
                'c0' => number_format(1234.56, 0, $d, $k).' X'
            )
        );
        $res = $app->response();
        $res['Cache-Control'] = 'max-age=0';
        $app->render('chart-describe.twig', $page);
    });
});