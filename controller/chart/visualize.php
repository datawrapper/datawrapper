<?php

/*
 * VISUALIZE STEP
 */
$app->get('/(chart|map)/:id/visualize', function ($id) use ($app) {
    disable_cache($app);

    check_chart_writable($id, function($user, $chart) use ($app) {
        $visData = "";

        try {
            $allVis = array();

            foreach (DatawrapperVisualization::all() as $vis) {
                unset($vis['options']['basemap']);
                unset($vis['icon']);
                $allVis[$vis['id']] = $vis;
            }

            $visData = json_encode(array(
                'visualizations' => $allVis,
                'vis' => DatawrapperVisualization::get($chart->getType()),
                'themes' => DatawrapperTheme::all(),
            ));
        } catch (Exception $e) {
            error('io-error', $e->getMessage());
        }

        $vis = DatawrapperVisualization::get($chart->getType());
        parse_vis_options($vis);

        $themes = DatawrapperTheme::all();
        usort($themes, function($a, $b) {
            return $a['title'] > $b['title'] ? 1 : -1;
        });

        $page = array(
            'title' => $chart->getID() . ' :: '.__('Visualize'),
            'chartData' => $chart->loadData(),
            'chart' => $chart,
            'visualizations_deps' => DatawrapperVisualization::all('dependencies'),
            'visualizations' => DatawrapperVisualization::all(),
            'vis' => $vis,
            'themes' => $themes,
            'theme' => DatawrapperTheme::get($chart->getTheme()),
            'type' => $chart->getNamespace(),
            'debug' => !empty($GLOBALS['dw_config']['debug_export_test_cases']) ? '1' : '0',
            'vis_data' => $visData
        );
        add_header_vars($page, $chart->getNamespace());
        add_editor_nav($page, 3, $chart->getNamespace());

        $app->render('chart/visualize.twig', $page);
    });
});

