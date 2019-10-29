<?php

function add_editor_nav(&$page, $step, $chart) {
    $type = "chart";
    if ($chart) $type = $chart->getNamespace();

    $vis = DatawrapperVisualization::get($chart->getType());
    $steps = $vis['workflow'];
    foreach ($steps as $i => $st) {
        $steps[$i]['index'] = $i+1;
    }

    Hooks::register(Hooks::CORE_SET_CHART, function() use ($chart) {
        return $chart;
    });

    $page['steps'] = $steps;
    $page['chartLocale'] = $page['locale'];
    $page['metricPrefix'] = get_metric_prefix($page['chartLocale']);
    $page['createstep'] = $step;
    $page['visNamespace'] = $vis['caption'] ?? $vis['namespace'] ?? 'chart';

    $folder = $chart->getInFolder();
    $chartOrg = $chart->getOrganization();
    $baseUrl = empty($chartOrg) ? '/mycharts' : '/team/'.$chartOrg->getId();
    if (isset($folder)) {

        $folder = FolderQuery::create()->findPk($folder);
        while($folder) {
            $folders[] = [
                'url' => $baseUrl.'/'.$folder->getId(),
                'name' => $folder->getFolderName()
            ];
            $folder = $folder->getParentId();
            if ($folder) $folder = FolderQuery::create()->findPk($folder);
        }
    } else {
        $folders = [];
    }
    $folders[] = [
        'icon' => empty($chartOrg) ? 'im im-user-male' : 'im im-users',
        'url' => $baseUrl,
        'name' => empty($chartOrg) ? __('My Charts') : $chartOrg->getName()
    ];
    $folders = array_reverse($folders);
    $page['folders'] = $folders;

    $user = Session::getUser();
    if (!$chart->isDataWritable($user)) {
        if ($type == 'chart') $page['steps'][0]['readonly'] = true;
        if ($type == 'map') {
            $page['steps'][0]['readonly'] = true;
            $page['steps'][1]['readonly'] = true;
        }
    }
}
