<?php


function getDemoDatasets() {
    $datasets = array();
    $datasets[] = array(
        'id' => 'gini',
        'title' => 'Gini coefficient in Germany, Sweden and South Africa (2005)',
        'data' => "	Gini coef.
Sweden 	0,23
Sachsen 	0,24
Germany	0,29
Hamburg	0,32
Johannesburg	0,73
"
    );
    $datasets[] = array(
        'id' => 'gini-evolution',
        'title' => 'Evolution of the Gini coefficient in Germany, France and Greece at 5-year intervals, 1995-2010.',
        'data' => "	1995	2000	2005	2010
Germany	29	25	28	29
France	29	28	28	30
Greece	35	33	33	33
"
    );
    $datasets[] = array(
        'id' => 'median-income',
        'title' => 'Median income according to education status in Germany, 2005-2010.',
        'data' => "	2005	2006	2007	2008	2009	2010
Up to secondary education	15369	14984	15236	15960	15745	15298
Up to tertiary education	17293	17370	18059	18639	18952	19228
Tertiary education	21147	21599	22623	23514	24660	24823
"
    );
    $datasets[] = array(
        'id' => 'income-dist',
        'title' => 'Income distribution in Germany in the 1990\'s.',
        'data' => "	Share of income
1st quintile	3,76
2nd quintile	10,72
3rd quintile	15,9
4th quintile	22,62
5th quintile	47
"
    );
    return $datasets;
}

/*
 * UPLOAD STEP
 */
$app->get('/chart/:id/upload', function ($id) use ($app) {
    check_chart($id, function($user, $chart) use ($app) {
        $page = array(
            'chartData' => $chart->loadData(),
            'chart' => json_encode($chart->serialize()),
            'datasets' => getDemoDatasets()
        );
        add_header_vars($page, 'create');
        add_editor_nav($page, 1);
        $app->render('chart-upload.twig', $page);
    });
});