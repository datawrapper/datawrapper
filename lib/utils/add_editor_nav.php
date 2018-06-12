<?php

function add_editor_nav(&$page, $step, $chart) {
    $type = "chart";
    if ($chart) $type = $chart->getNamespace();

    $vis = DatawrapperVisualization::get($chart->getType());
    $steps = $vis['workflow'];
    foreach ($steps as $i => $st) {
        $steps[$i]['index'] = $i+1;
    }

    $page['steps'] = $steps;
    $page['chartLocale'] = $page['locale'];
    $page['metricPrefix'] = get_metric_prefix($page['chartLocale']);
    $page['createstep'] = $step;

    $user = Session::getUser();
    if (!$chart->isDataWritable($user)) {
        if ($type == 'chart') $page['steps'][0]['readonly'] = true;
        if ($type == 'map') {
            $page['steps'][0]['readonly'] = true;
            $page['steps'][1]['readonly'] = true;
        }
    }
}
