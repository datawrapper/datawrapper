<?php

require_once ROOT_PATH . 'lib/utils/call_v3_api.php';

/*
 * VISUALIZE STEP
 */
$app->get('/(chart|map|table)/:id/:step', function ($id, $step) use ($app) {
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

        // check if this chart type is using the new editor
        $vis = DatawrapperVisualization::get($chart->getType());
        if (!empty($vis['svelte-workflow']) && $vis['svelte-workflow'] != 'chart') {
            $app->redirect('/edit/'.$chart->getId());
            return;
        }

        // check if path and namespace match
        $path = explode('/', $app->request()->getPath())[1];
        if ($path != $chart->getNamespace()) {
            // and redirect
            $app->redirect('/'.$chart->getNamespace().'/'.$chart->getId().'/visualize');
            return;
        }

        $allThemes = ThemeQuery::create()->allThemesForUser($chart);
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

        [$status, $theme] = call_v3_api('GET', '/themes/'.$chart->getTheme().'?extend=true');
        if ($status != 200) {
            [$status, $theme] = call_v3_api('GET', '/themes/default');
        }

        $org = $chart->getOrganization();
        $customFields = [];
        if ($org) $customFields = $org->getSettings("customFields") ?? [];

        if (sizeof($customFields) > 0) {
            Hooks::register(Hooks::CUSTOM_ANNOTATION_CONTROLS, function($chart) use ($customFields) {
                global $app;
                $app->render('svelte.twig', [
                    'app_id' => 'fields',
                    'app_js' => '/static/js/svelte/fields.js',
                    'app_css' => '/static/css/svelte/fields.css',
                    'config' => $GLOBALS['dw_config'],
                    'twig_data' => [
                        'customFields' => $customFields
                    ]
                ]);
            });
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
    'step' => '((?!(create|edit|publish|upload|describe|preview|data|data\.csv|_static|token)).)+'
]);

