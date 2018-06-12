<?php

/*
 * VISUALIZE STEP
 */
$app->get('/(chart|map)/:id/:step', function ($id, $step) use ($app) {
    disable_cache($app);

    check_chart_writable($id, function($user, $chart) use ($app, $step) {
        $visData = "";

        $chart->refreshExternalData();

        if ($app->request()->get('mode') == "print") $chart->usePrint();

        if (!DatawrapperHooks::hookRegistered(DatawrapperHooks::RENDER_RESIZE_CONTROL)) {
            DatawrapperHooks::register(DatawrapperHooks::RENDER_RESIZE_CONTROL, function() {
                global $app;
                $app->render('chart/visualize/resizer.twig');
            });
        }

        // check if path and namespace match
        $path = explode('/', $app->request()->getPath())[1];
        if ($path != $chart->getNamespace()) {
            // and redirect
            $app->redirect('/'.$chart->getNamespace().'/'.$chart->getId().'/visualize');
        }

        $allThemes = ThemeQuery::create()->allThemesForUser();
        $themeMeta = [];

        foreach ($allThemes as $theme) {
            $themeMeta[] = array(
                "id" => $theme->getId(),
                "title" => $theme->getTitle(),
                "data" => $theme->getThemeData()
            );
        }

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
                'themes' => $themeMeta,
            ));
        } catch (Exception $e) {
            error('io-error', $e->getMessage());
        }

        $vis = DatawrapperVisualization::get($chart->getType());
        parse_vis_options($vis);

        $theme = ThemeQuery::create()->findPk($chart->getTheme());

        if (empty($theme)) {
            $theme = ThemeQuery::create()->findPk("default");
        }

        $page = array(
            'title' => strip_tags($chart->getTitle()).' - '.$chart->getID() . ' - '.__('Visualize'),
            'chartData' => $chart->loadData(),
            'chart' => $chart,
            'step' => $step,
            'visualizations_deps' => DatawrapperVisualization::all('dependencies'),
            'visualizations' => DatawrapperVisualization::all(),
            'vis' => $vis,
            'themes' => $themeMeta,
            'theme' => $theme,
            'type' => $chart->getNamespace(),
            'debug' => !empty($GLOBALS['dw_config']['debug_export_test_cases']) ? '1' : '0',
            'vis_data' => $visData,
            'mode' => $app->request()->get('mode') == "print" ? "print": "web"
        );
        add_header_vars($page, $chart->getNamespace());
        add_editor_nav($page, 3, $chart);

        if (!empty($vis['svelte-editor'])) {
            $app->render('chart/svelte-editor.twig', $page);
        } else {
            $app->render('chart/visualize.twig', $page);
        }
    });
})->conditions([
    'step' => '((?!(create|edit|publish|upload|describe|preview|data|data\.csv|_static)).)+'
]);

