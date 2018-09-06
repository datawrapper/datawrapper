<?php

(function() use ($app) {

    // helper function to get a list of all registered workflows
    $get_workflows = function() {
        $workflows = [];
        $res = Hooks::execute(Hooks::ADD_WORKFLOW);
        foreach ($res as $wf) { $workflows[$wf['id']] = $wf; }
        return $workflows;
    };

    // register core ChartEditor workflow
    Hooks::register(Hooks::ADD_WORKFLOW, function() {
        return [
            'id' => 'chart',
            'title' => 'Chart',
            'default_type' => $GLOBALS['dw_config']['defaults']['vis'],
            'path_js' => '/static/js/svelte/editor.js',
            'path_css' => '/static/css/svelte/editor.css',
            'module' => 'svelte/editor',
            'order' => 100,
            'steps' => ['upload', 'describe', 'visualize', 'publish']
        ];
    });

    // GET route for the new chart editor
    $app->get('/create(/:workflow)?', function($wfid='') use ($app, $get_workflows) {
        if (!DatawrapperSession::getUser()->isAdmin()) {
            return $app->redirect('/');
        }

        $workflows = $get_workflows();
        if (!empty($wfid)) {
            if (empty($workflows[$wfid])) {
                return $app->redirect('/create');
            }
            // we have a workflow!
            // create a new chart
            $chart = ChartQuery::create()->createEmptyChart(DatawrapperSession::getUser());
            // set type to default type of workflow
            $chart->setType($workflows[$wfid]['default_type']);
            $chart->save();
            // and redirect to /edit/:chart_id
            $app->redirect('/edit/'.$chart->getId());
        } else {
            // no workflow, show workflow selector
            $workflows_list = array_values($workflows);
            usort($workflows_list, function($u,$v) {
                return ($u['order'] ?? 99999) - ($v['order'] ?? 99999);
            });
            $page = [
                'title' => 'What do you want to create?',
                'pageClass' => 'editor',
                'workflows' => $workflows_list
            ];
            add_header_vars($page, 'editor');
            $app->render('create.twig',$page);
        }
    });

    // GET route for new beta chart editor
    $app->get('/edit/:chart_id(/:step)?', function ($chart_id, $step='') use ($app, $get_workflows) {
        disable_cache($app);

        if (!DatawrapperSession::getUser()->isAdmin()) {
            return $app->redirect('/');
        }

        $chart = ChartQuery::create()->findPK($chart_id);

        check_chart_writable($chart_id, function($user, $chart) use ($app, $step, $get_workflows) {
            $vis = Visualization::get($chart->getType());
            // get list of all workflows
            $workflows = $get_workflows();
            if (empty($workflows[$vis['svelte_workflow']])) {
                die('workflow '.$vis['svelte_workflow'].' not found');
            }
            $workflow = $workflows[$vis['svelte_workflow']];
            if (!in_array($step, $workflow['steps'])) {
                // auto-redirect to last step
                $last_step = min($chart->getLastEditStep(), count($workflow['steps'])) - 1;
                $step = $workflow['steps'][max(0, $last_step)];
            }

            $page = array(
                'title' => '',
                'pageClass' => 'editor',
                'step' => $step,
                'chart' => $chart,
                'dataReadonly' => !$chart->isDataWritable($user),
                'chartData' => $chart->loadData(),
                'workflow' => $workflows[$vis['svelte_workflow']],
                'user' => $user,
                'vis' => $vis,
                'theme' => ThemeQuery::create()->findPk($chart->getTheme())
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

})();
