<?php

function get_chart_content($chart, $user) {
    $theme_css = array();
    $theme_js = array();

    $next_theme_id = $chart->getTheme();

    while (!empty($next_theme_id)) {
        $theme = get_theme_meta($next_theme_id);
        $theme_js[] = '/static/themes/' . $next_theme_id . '/theme.js';
        if ($theme['hasStyles']) {
            $theme_css[] = '/static/themes/' . $next_theme_id . '/theme.css';
        }
        $next_theme_id = $theme['extends'];
    }
    $base_js = array(
        '/static/vendor/miso/miso.ds.deps.0.1.3.js',
        '/static/js/ds.parser.delimited.js',
        '/static/vendor/jquery/jquery.min.js',
        '/static/js/dw.core.js',
        '/static/js/dw.chart.js',
        '/static/js/dw.theme.js',
        '/static/js/dw.visualization.js'
    );

    $vis_js = array();
    $vis_css = array();
    $next_vis_id = $chart->getType();

    while (!empty($next_vis_id)) {
        $vis = get_visualization_meta($next_vis_id);
        $vjs = array();
        if (!empty($vis['libraries'])) {
            foreach ($vis['libraries'] as $url) {
                $vjs[] = '/static/vendor/' . $url;
            }
        }
        $vjs[] = '/static/visualizations/' . $vis['id'] . '/' . $vis['id'] . '.js';
        $vis_js = array_merge($vis_js, array_reverse($vjs));
        if ($vis['hasCSS']) {
            $vis_css[] = '/static/visualizations/' . $vis['id'] . '/style.css';
        }
        $next_vis_id = !empty($vis['extends']) ? $vis['extends'] : null;
    }

    $scripts = array_unique(array_merge($base_js, array_reverse($theme_js), array_reverse($vis_js)));

    $styles = array_merge($vis_css, array_reverse($theme_css));

    return array(
        'chartData' => $chart->loadData(),
        'chart' => $chart,
        'theme' => get_theme_meta($chart->getTheme()),
        'visualization' => get_visualization_meta($chart->getType()),
        'stylesheets' => $styles,
        'scripts' => $scripts,
        'origin' => $_SERVER['HTTP_REFERER']
    );
}