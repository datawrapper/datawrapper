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

        $vis = DatawrapperVisualization::get($chart->getType());

        [$status, $theme] = call_v3_api('GET', '/themes/'.$chart->getTheme().'?extend=true');
        if ($status != 200) {
            [$status, $theme] = call_v3_api('GET', '/themes/default');
        }

        $userVisualizations = [];

        $vis_archive = $GLOBALS['dw_config']['vis_archive'] ?? [];
        $visualizations = DatawrapperVisualization::all();
        $visArchive = [];

        foreach ($visualizations as $v) {
            if ($user->canCreateVisualization($v['id'], $chart) && !empty($v['title'])) {
                $v = [
                    'id' => $v['id'],
                    'axes' => $v['axes'],
                    'title' => $v['title'],
                    'namespace' => $v['namespace'] ?? 'chart',
                    'controls' => $v['controls'] ?? [],
                    'height' => $v['height'] ?? 'fit',
                    'icon' => $v['icon'],
                    'icon_path' => '/static/plugins/' . $v['__plugin'] . '/' . $v['id'] . '.svg',
                ];

                if (in_array($v['id'], $vis_archive)) {
                    $visArchive[] = $v;
                } else {
                    $userVisualizations[] = $v;
                }
            }
        }

        $page = array(
            'title' => strip_tags($chart->getTitle()).' - '.$chart->getID() . ' - '.__('Visualize'),

            'chart' => $chart,
            'chartData' => $chart->loadData(),
            'step' => $step,
            'defaultVisType' => $GLOBALS['dw_config']['defaults']['vis'],

            'visualizations' => $userVisualizations,
            'visArchive' => $visArchive,

            'theme' => $theme,
            'userThemes' => array_map(function($t) {
                    return ['id'=>$t->getId(), 'title'=>$t->getTitle()];
                }, ThemeQuery::create()->allThemesForUser($chart)),
        );
        add_header_vars($page, $chart->getNamespace());
        add_editor_nav($page, 3, $chart);

        $app->render('chart/visualize.twig', $page);
    });
})->conditions([
    'step' => '((?!(create|edit|publish|upload|describe|preview|data|data\.csv|_static|token)).)+'
]);

