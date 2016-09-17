<?php

/*
 * these controllers return small pieces of the UI
 */

/**
 * reloads the header menu after login/logout
 */
$app->get('/xhr/header/:page', function($active) use ($app) {
    disable_cache($app);

    $page = array();
    add_header_vars($page, $active);
    $res = $app->response();
    $res['Cache-Control'] = 'max-age=0';
    $app->render('header.twig', $page);
});

/**
 * reloads the header menu after login/logout
 */
$app->get('/xhr/home-login', function() use ($app) {
    disable_cache($app);
    $page = array();
    add_header_vars($page);
    $res = $app->response();
    $res['Cache-Control'] = 'max-age=0';
    $app->render('home-login.twig', $page);
});

/**
 * reloads visualization specific options after the user
 * changed the visualization type
 */
$app->get('/xhr/:chartid/vis-options', function($id) use ($app) {
    disable_cache($app);
    

    check_chart_writable($id, function($user, $chart) use ($app) {
        $a = $app->request()->params('annotate');

        $vis = DatawrapperVisualization::get($chart->getType());
        // clean vis options
        
        foreach ($vis['options'] as $key => $g_option) {
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
                            $vis['options'][$key]['options'] = $new_opts;
                        } else {
                            $vis['options'][$key]['options'][$sub_key]['options'] = $new_opts;
                        }
                    } 
                }
            }
        }

        $page = array(
            'vis' => $vis,
            'theme' => DatawrapperTheme::get($chart->getTheme()),
            'language' => substr(DatawrapperSession::getLanguage(), 0, 2)
        );
        $app->render('chart/visualize/'.(!empty($a) ? 'annotate' : 'options').'.twig', $page);
    });
});


