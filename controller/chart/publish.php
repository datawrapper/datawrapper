<?php

require_once ROOT_PATH . 'lib/utils/call_v3_api.php';

/*
 * PUBLISH STEP - shows progress of publishing action and thumbnail generation
 */
$app->get('/(chart|map|table)/:id/publish(/:sub_page)?', function ($id) use ($app) {
    disable_cache($app);

    check_chart_writable($id, function($user, $chart) use ($app) {

        $cfg = $GLOBALS['dw_config'];

        // check if this chart type is using the new editor
        $vis = DatawrapperVisualization::get($chart->getType());
        if (!empty($vis['svelte-workflow']) && $vis['svelte-workflow'] != 'chart') {
            $app->redirect('/edit/'.$chart->getId().'/publish');
            return;
        }

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

        $chartUrlLocal = '/preview/' . $chart->getID();

        $page = array(
            'title' => strip_tags($chart->getTitle()).' - '.$chart->getID() . ' - '.__('Publish'),
            'chartData' => $chart->loadData(),
            'chart' => $chart,
            'visualizations' => DatawrapperVisualization::all(),
            'vis' => DatawrapperVisualization::get($chart->getType()),
            'chartUrl' => $chart->getPublicUrl(),
            'chartUrlLocal' => $chartUrlLocal,
            'embedWidth' => $chartW,
            'embedHeight' => $chartH,
            'themes' => ThemeQuery::create()->allThemesForUser($chart),
            'exportStaticImage' => !empty($cfg['phantomjs']),
            'estExportTime' => ceil(JobQuery::create()->estimatedTime('export') / 60),
            'chartActions' => $chartActions
        );

        add_header_vars($page, 'chart', 'chart-editor/publish.css');
        add_editor_nav($page, 4, $chart);

        if (!$chart->isDataWritable($user)) {
            $page['steps'][0]['readonly'] = true;
            $page['steps'][1]['readonly'] = true;
        }

        [$status, $embed_codes] = call_v3_api('GET', '/charts/'.$chart->getID().'/embed-codes');
        if ($status != 200) {
            return $app->error('Something is wrong, the API might be down...');
        }

        $embed_types = (array_values(array_filter($embed_codes, function($code) { return $code['preferred']; }) ?? [['id' => 'responsive']]));
        $embed_type = isset($embed_types[0]) ? $embed_types[0]['id'] : 'responsive';

        [$status, $display_urls] = call_v3_api('GET', '/charts/'.$chart->getID().'/display-urls');
        if ($status != 200) {
            return $app->error('Something is wrong, the API might be down...');
        }

        $org = $chart->getOrganization();

        // new publish step
        $page['svelte_data'] = [
            'published' => $chart->getLastEditStep() > 4,
            'needs_republish' => $chart->getLastEditStep() > 4 &&
                strtotime($chart->getLastModifiedAt()) - strtotime($chart->getPublishedAt()) > 20,
            'chart' => $chart->toStruct(),
            'embedTemplates' => $embed_codes,
            'embedType' => $embed_type,
            'shareurlType' => $user->getUserData()['shareurl_type'] ?? 'default',
            'pluginShareurls' => $display_urls,
            'auto_publish' => !empty($app->request()->params('doit')),
            'guest_text_above' => Hooks::execute(Hooks::PUBLISH_TEXT_GUEST_ABOVE),
            'guest_text_below' => Hooks::execute(Hooks::PUBLISH_TEXT_GUEST_BELOW),
            'redirect_disabled' => $org && $org->getSettings('publishTarget.disable_redirects')
        ];
        $app->render('chart/publish.twig', $page);
    });
});

