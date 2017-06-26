<?php

/*
 * PUBLISH STEP - shows progress of publishing action and thumbnail generation
 */
$app->get('/(chart|map)/:id/publish', function ($id) use ($app) {
    disable_cache($app);

    check_chart_writable($id, function($user, $chart) use ($app) {

        $cfg = $GLOBALS['dw_config'];

        DatawrapperHooks::register(
            'render_chart_actions', 
            function($chart, $user) use ($app) {
                $cap = DatawrapperHooks::execute("get_chart_action_provider");

                if ($cap == null || sizeof($cap) == 0) {
                    $chartActions = DatawrapperHooks::execute(DatawrapperHooks::GET_CHART_ACTIONS, $chart);

                    // add duplicate action
                    $chartActions[] = array(
                        'id' => 'duplicate',
                        'icon' => 'code-fork',
                        'title' => __('Duplicate this chart'),
                        'order' => 500
                    );

                    // sort actions
                    usort($chartActions, function($a, $b) {
                        return (isset($a['order']) ? $a['order'] : 999) - (isset($b['order']) ? $b['order'] : 999);
                    });

                    $app->render('chart/chart-actions.twig', array(
                        "chart" => $chart,
                        "chartActions" => $chartActions,
                        "user" => $user
                    ));
                } else {
                    $cap[0]($app, $chart, $user);                
                }
            }
        );

        $chartW = $chart->getMetadata('publish.embed-width');
        $chartH = $chart->getMetadata('publish.embed-height');

        if (substr($chartW, -1) != '%') $chartW .= 'px';
        if (substr($chartH, -1) != '%') $chartH .= 'px';

        $page = array(
            'title' => $chart->getID() . ' :: '.__('Publish'),
            'chartData' => $chart->loadData(),
            'chart' => $chart,
            'visualizations' => DatawrapperVisualization::all(),
            'vis' => DatawrapperVisualization::get($chart->getType()),
            'chartUrl' => $chart->getPublicUrl(),
            'chartUrlLocal' => '/chart/' . $chart->getID() . '/preview',
            'embedWidth' => $chartW,
            'embedHeight' => $chartH,
            'themes' => ThemeQuery::create()->allThemesForUser(),
            'exportStaticImage' => !empty($cfg['phantomjs']),
            'estExportTime' => ceil(JobQuery::create()->estimatedTime('export') / 60)
        );

        add_header_vars($page, 'chart', 'chart-editor/publish.css');
        add_editor_nav($page, 4);

        $app->render('chart/publish.twig', $page);
    });
});

