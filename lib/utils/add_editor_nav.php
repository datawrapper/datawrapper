<?php

function add_editor_nav(&$page, $step, $chart) {
    $type = "chart";
    if ($chart) $type = $chart->getNamespace();

    if ($type == "chart") {
        // define 4 step navigation
        $steps = array();
        $steps[] = array('index'=>1, 'id'=>'upload', 'title'=>__('Upload Data'));
        $steps[] = array('index'=>2, 'id'=>'describe', 'title'=>__('Check & Describe'));
        $steps[] = array('index'=>3, 'id'=>'visualize', 'title'=>__('Visualize'));
        $steps[] = array('index'=>4, 'id'=>'publish', 'title'=>__('Publish & Embed'));
        $page['steps'] = $steps;
        $page['chartLocale'] = $page['locale'];
        $page['metricPrefix'] = get_metric_prefix($page['chartLocale']);
        $page['createstep'] = $step;
    } else if ($type == "map") {
        $steps = array();
        $steps[] = array('index'=>1, 'id'=>'basemap', 'title'=>__('step-1', 'simple-maps'));
        $steps[] = array('index'=>2, 'id'=>'data', 'title'=>__('step-2', 'simple-maps'));
        $steps[] = array('index'=>3, 'id'=>'visualize', 'title'=>__('step-3', 'simple-maps'));
        $steps[] = array('index'=>4, 'id'=>'publish', 'title'=>__('step-4', 'simple-maps'));
        $page['steps'] = $steps;
        $page['chartLocale'] = $page['locale'];
        $page['metricPrefix'] = get_metric_prefix($page['chartLocale']);
        $page['createstep'] = $step;
    }

    $user = Session::getUser();
    if (!$chart->isDataWritable($user)) {
        $page['steps'][0]['readonly'] = true;
        if ($type == 'map') $page['steps'][1]['readonly'] = true;
    }
}
