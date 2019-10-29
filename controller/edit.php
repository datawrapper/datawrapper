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

    function editor_check_access() {
        if (!DatawrapperSession::getUser()->isAdmin()) {
            // return $app->redirect('/');
        }
        $cfg = $GLOBALS['dw_config'];
        $user = DatawrapperSession::getUser();
        if (!$user->isLoggedIn() && isset($cfg['prevent_guest_charts']) && $cfg['prevent_guest_charts']) {
            error_access_denied();

            die();
        }
    }


    // GET route for the new chart editor
    $app->get('/create(/:workflow)?', function($wfid='') use ($app, $get_workflows) {

        disable_cache($app);
        editor_check_access();

        $workflows = $get_workflows();

        if (!empty($wfid)) {
            if (empty($workflows[$wfid])) {
                return $app->redirect('/create');
            }
            // we have a workflow!
            // create a new chart
            $chart = ChartQuery::create()
                ->createEmptyChart(DatawrapperSession::getUser());
            // set type to default type of workflow
            $chart->setType($workflows[$wfid]['default_type']);

            $vis = Visualization::get($workflows[$wfid]['default_type']);
            if ($vis && !empty($vis['default-data'])) {
                $chart->writeData($vis['default-data']);
            }

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
        editor_check_access();

        $chart = ChartQuery::create()->findPK($chart_id);

        check_chart_writable($chart_id, function($user, $chart) use ($app, $step, $get_workflows) {
            $req = $app->request();
            $vis = Visualization::get($chart->getType());
            // get list of all workflows
            $workflows = $get_workflows();
            if (empty($workflows[$vis['svelte-workflow']])) {
                die('workflow '.$vis['svelte-workflow'].' not found');
            }
            $workflow = $workflows[$vis['svelte-workflow']];
            if (!in_array($step, $workflow['steps'])) {
                // auto-redirect to last step
                $last_step = min($chart->getLastEditStep(), count($workflow['steps'])) - 1;
                $step = $workflow['steps'][max(0, $last_step)];
            }

            Hooks::register(Hooks::CORE_SET_CHART, function() use ($chart) {
                return $chart;
            });

            $userArray = $user->serialize();
            $userArray['mayPublish'] = $user->mayPublish($chart);

            if (!empty($vis['json-data']) && !$chart->getMetadata('data.json')) {
                $chart->updateMetadata('data.json', true);
                $chart->save();
            }

            $data = $chart->loadData();
            if ($vis && !empty($vis['default-data']) && empty($data)) {
                $data = $vis['default-data'];
                $chart->writeData($data);
            }

            $publishData = (object) [
                'embedTemplates' => publish_get_embed_templates(),
                'embedType' => publish_get_preferred_embed_type(),
                'pluginShareurls' => publish_get_plugin_shareurls(),
                'shareurlType' => publish_get_preferred_shareurl_type()
            ];

            $org = $user->getCurrentOrganization();
            $customFields = [];
            if ($org) {
                $customFields = $org->getSettings("customFields") ?? [];
            }

            $page = ['locale'=>'en'];
            add_editor_nav($page, 3, $chart);

            $page = [
                'title' => '',
                'pageClass' => 'editor',
                'step' => $step,
                'chart' => $chart,
                'dataReadonly' => !$chart->isDataWritable($user),
                'chartData' => $data,
                'publishData' => $publishData,
                'workflow' => $workflows[$vis['svelte-workflow']],
                'userArray' => $userArray,
                'vis' => $vis,
                'customFields' => $customFields,
                'apiDomain' => $GLOBALS['dw_config']['api_domain'],
                'chartLocales' => array_map(function($s) {
                    $s = explode('|', $s);
                    return ['value'=>$s[0], 'label'=>$s[1]];
                 }, explode(',', $GLOBALS['dw_config']['plugins']['chart-locale-select']['locales'] ?? 'en-US|english,de-DE|deutsch')),
                'theme' => ThemeQuery::create()->findPk($chart->getTheme()),
                'userThemes' => array_map(function($t) {
                    return ['id'=>$t->getId(), 'title'=>$t->getTitle()];
                }, ThemeQuery::create()->allThemesForUser()),
                'chartActions' => Hooks::execute(Hooks::GET_CHART_ACTIONS, $chart, $user),
                'folders' => $page['folders'],
                'visNamespace' => $page['visNamespace']
            ];

            if (Hooks::hookRegistered(Hooks::REPLACE_PUBLISH_LOGIC)) {
                $page['publishLogic'] = Hooks::execute(Hooks::REPLACE_PUBLISH_LOGIC, $user, $chart)[0];
            }

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
