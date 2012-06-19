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
    $datasets[] = array(
        'id' => 'gini-europe',
        'title' => 'Gini coefficient in Europe, 2001-2010',
        'data' => "	2001	2002	2003	2004	2005	2006	2007	2008	2009	2010
European Union					30,6	30,2	30,6	30,7	30,4	30,4
Belgium	28		28,3	26,1	28,0	27,8	26,3	27,5	26,4	26,6
Bulgaria	26	26	24	26	25	31,2	35,3	35,9	33,4	33,2
Czech Republic	25				26,0	25,3	25,3	24,7	25,1	24,9
Denmark	22		24,8	23,9	23,9	23,7	25,2	25,1	26,9	26,9
Germany	25				26,1	26,8	30,4	30,2	29,1	29,3
Estonia	35	35	34	37,4	34,1	33,1	33,4	30,9	31,4	31,3
Ireland	29		30,6	31,5	31,9	31,9	31,3	29,9	28,8	
Greece	33		34,7	33,0	33,2	34,3	34,3	33,4	33,1	32,9
Spain	33	31	31	30,7	31,8	31,2	31,3	31,3	32,3	33,9
France	27	27	27	28,2	27,7	27,3	26,6	29,2	29,8	29,9
Italy	29			33,2	32,8	32,1	32,3	31,0	31,5	31,2
Cyprus			27		28,7	28,8	29,8	28,0	28,4	
Latvia					36,1	39,2	35,4	37,7	37,4	36,1
Lithuania	31				36,3	35,0	33,8	34,0	35,5	36,9
Luxembourg	27		27,6	26,5	26,5	27,8	27,4	27,7	29,2	27,9
Hungary	25	24	27		27,6	33,3	25,6	25,2	24,7	24,1
Malta					26,9	27,0	26,3	27,9	27,2	28,4
Netherlands	27	27	27		26,9	26,4	27,6	27,6	27,2	25,5
Austria	24		27,4	25,8	26,2	25,3	26,2	26,2	25,7	26,1
Poland	30				35,6	33,3	32,2	32,0	31,4	31,1
Portugal	37			37,8	38,1	37,7	36,8	35,8	35,4	33,7
Romania	30	30	30	31	31	33	37,8	36,0	34,9	33,3
Slovenia	22	22	22		23,8	23,7	23,2	23,4	22,7	23,8
Slovakia					26,2	28,1	24,5	23,7	24,8	25,9
Finland	27	26	26	25,5	26,0	25,9	26,2	26,3	25,9	25,4
Sweden	24	23		23,0	23,4	24,0	23,4	24,0	24,8	24,1
United Kingdom	35	35	34		34,6	32,5	32,6	33,9	32,4	33,0
Iceland				24,1	25,1	26,3	28,0	27,3	29,6	25,7
Norway			26,6	25,2	28,2	29,2	23,7	25,1	24,1	23,6
Switzerland								32,0	30,2	29,5
Croatia			29	30	30	28	29	28	27	31,5
Turkey		46	45	0		44,8				
"
    );
    return $datasets;
}

/*
 * UPLOAD STEP
 */
$app->get('/chart/:id/upload', function ($id) use ($app) {
    check_chart_writable($id, function($user, $chart) use ($app) {
        $page = array(
            'chartData' => $chart->loadData(),
            'chart' => $chart,
            'datasets' => getDemoDatasets()
        );
        add_header_vars($page, 'create');
        add_editor_nav($page, 1);
        $app->render('chart-upload.twig', $page);
    });
});