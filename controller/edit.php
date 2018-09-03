<?php

// register core ChartEditor workflow
Hooks::register(Hooks::ADD_WORKFLOW, function() {
    return [
        'id' => 'chart',
        'path_js' => '/static/js/svelte/editor.js',
        'path_css' => '/static/css/svelte/editor.css',
        'module' => 'svelte/editor',
        'steps' => ['upload', 'describe', 'visualize', 'publish']
    ];
});

// GET route for new beta chart editor
$app->get('/edit/:chart_id(/:step)?', function ($chart_id, $step='') use ($app) {
    disable_cache($app);

    if (!DatawrapperSession::getUser()->isAdmin()) {
        return $app->redirect('/');
    }

    $chart = ChartQuery::create()->findPK($chart_id);

    check_chart_writable($chart_id, function($user, $chart) use ($app, $step) {
        $vis = Visualization::get($chart->getType());
        // get list of all workflows
        $workflows = [];
        $res = Hooks::execute(Hooks::ADD_WORKFLOW);
        foreach ($res as $wf) {
            $workflows[$wf['id']] = $wf;
        }
        if (empty($workflows[$vis['svelte_workflow']])) {
            die('workflow '.$vis['svelte_workflow'].' not found');
        }
        $workflow = $workflows[$vis['svelte_workflow']];
        if (!in_array($step, $workflow['steps'])) {
            // auto-redirect to last step
            $last_step = min($chart->getLastEditStep(), count($workflow['steps'])) - 1;
            $step = $workflow['steps'][$last_step];
        }

        $page = array(
            'title' => '',
            'pageClass' => 'chart',
            'step' => $step,
            'chart' => $chart,
            'dataReadonly' => !$chart->isDataWritable($user),
            'chartData' => $chart->loadData(),
            'workflow' => $workflows[$vis['svelte_workflow']],
            'user' => $user,
            'vis' => $vis
        );

        // legacy stuff, need to move into ChartEditor some day
        // demo datasets
        $datasets = DatawrapperHooks::execute(DatawrapperHooks::GET_DEMO_DATASETS);
        $groups = array();
        if (is_array($datasets)) {
            foreach ($datasets as $ds) {
                if (!isset($groups[$ds['type']])) $groups[$ds['type']] = array('type' => $ds['type'], 'datasets' => array());
                $groups[$ds['type']]['datasets'][] = $ds;
            }
        }
        $page['svelte'] = [
            'datasets' => $groups
        ];

        add_header_vars($page, '');
        $app->render('editor.twig', $page);
    });


});

