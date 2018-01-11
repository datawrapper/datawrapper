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

        // get chart simple actions for new template
        $user = Session::getUser();
        $chartActions = Hooks::execute(Hooks::GET_CHART_ACTIONS, $chart, $user);

        // remove publish-s3
        $chartActions = array_filter($chartActions, function($a) {
            return $a['id'] != 'publish-s3';
        });
        // give actions a shorter name
        $chartActions = array_map(function($a) {
            if ($a['id'] == 'export-image') $a['title'] = 'PNG';
            if ($a['id'] == 'export-jspdf') $a['title'] = 'PDF';
            if ($a['id'] == 'export-zip') $a['title'] = 'ZIP';
            return $a;
        }, $chartActions);

        // add core duplicate action
        $chartActions[] = array(
            'id' => 'duplicate',
            'icon' => 'code-fork',
            'title' => __('Duplicate'),
            'order' => 500
        );

        // sort actions by self-defined order
        usort($chartActions, function($a, $b) {
            return (isset($a['order']) ? $a['order'] : 999) - (isset($b['order']) ? $b['order'] : 999);
        });

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
            'estExportTime' => ceil(JobQuery::create()->estimatedTime('export') / 60),
            'chartActions' => $chartActions
        );

        add_header_vars($page, 'chart', 'chart-editor/publish.css');
        add_editor_nav($page, 4);

        if (!$chart->isDataWritable($user)) {
            $page['steps'][0]['readonly'] = true;
            $page['steps'][1]['readonly'] = true;
        }


        if ($app->request()->get('beta') !== null) {
            // new publish step
            // var_dump(($chart->getLastModifiedAt()));
            // var_dump(($chart->getPublishedAt()));
            $page['svelte_data'] = [
                'published' => $chart->getLastEditStep() > 4,
                'needs_republish' => $chart->getLastEditStep() > 4 &&
                    strtotime($chart->getLastModifiedAt()) - strtotime($chart->getPublishedAt()) > 20,
                'chart' => $chart->toStruct(),
                'embed_templates' => publish_get_embed_templates(),
                'embed_type' => publish_get_preferred_embed_type(),
                'shareurl_type' => publish_get_preferred_shareurl_type(),
                'plugin_shareurls' => publish_get_plugin_shareurls()
            ];
            $app->render('chart/publish-new.twig', $page);
        } else {
            // old publish step (also fallback for guests etc)
            $app->render('chart/publish.twig', $page);
        }
    });
});

