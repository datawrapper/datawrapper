<?php

/*
 * VISUALIZE STEP
 */
$app->get('/chart/:id/visualize', function ($id) use ($app) {
    disable_cache($app);

    check_chart_writable($id, function($user, $chart) use ($app) {

        $vis = DatawrapperVisualization::get($chart->getType());

        $option_parts = ['options'];
        if (!empty($vis['annotate_options'])) {
            $option_parts[] = 'annotate_options';
        }
        // clean vis options
        foreach ($option_parts as $options_key) {
            foreach ($vis[$options_key] as $key => $g_option) {
                if ($g_option['type'] != 'group') {
                    $options = [$g_option];
                } else {
                    $options = $g_option['options'];
                }
                foreach ($options as $sub_key => $option) {
                    if (!empty($option['options'])) {
                        $opts = $option['options'];
                        if (array_keys($opts) !== range(0, count($opts) - 1)) {
                            // associative array, convert to sequential
                            $new_opts = [];
                            foreach ($opts as $val => $label) {
                                $new_opts[] = ['value' => $val, 'label' => $label];
                            }
                            if ($g_option['type'] != 'group') {
                                $vis[$options_key][$key]['options'] = $new_opts;
                            } else {
                                $vis[$options_key][$key]['options'][$sub_key]['options'] = $new_opts;
                            }
                        } 
                    }
                }
            }
        }

        $page = array(
            'title' => $chart->getID() . ' :: '.__('Visualize'),
            'chartData' => $chart->loadData(),
            'chart' => $chart,
            'visualizations_deps' => DatawrapperVisualization::all('dependencies'),
            'visualizations' => DatawrapperVisualization::all(),
            'vis' => $vis,
            'themes' => DatawrapperTheme::all(),
            'theme' => DatawrapperTheme::get($chart->getTheme()),
            'debug' => !empty($GLOBALS['dw_config']['debug_export_test_cases']) ? '1' : '0'
        );
        add_header_vars($page, 'chart');
        add_editor_nav($page, 3);

        $app->render('chart/visualize.twig', $page);
    });
});

