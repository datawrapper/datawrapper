<?php

/*
 * PUBLISH STEP - shows progress of publishing action and thumbnail generation
 */
$app->get('/(chart|map)/:id/publish(/:sub_page)?', function ($id) use ($app) {
    disable_cache($app);

    check_chart_writable($id, function($user, $chart) use ($app) {

        $cfg = $GLOBALS['dw_config'];

        Hooks::register(
            'render_chart_actions',
            function($chart, $user) use ($app) {
                $cap = Hooks::execute("get_chart_action_provider");

                if ($cap == null || sizeof($cap) == 0) {
                    $user = Session::getUser();
                    $chartActions = Hooks::execute(Hooks::GET_CHART_ACTIONS, $chart, $user);

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
                    usort($cap, function ($item1, $item2) {
                        return $item1['priority'] > $item2['priority'] ? 0 : 1;
                    });

                    $cap[0]['render']($app, $chart, $user);
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

        if (!$chart->isDataWritable($user)) {
            $page['steps'][0]['readonly'] = true;
            $page['steps'][1]['readonly'] = true;
        }

        $app->render('chart/publish.twig', $page);
    });
});

