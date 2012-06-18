<?php

require_once '../lib/utils/visualizations.php';
require_once '../lib/utils/themes.php';

/*
 * Shows a preview of a chart for display in an iFrame
 */
$app->get('/chart/:id/preview', function ($id) use ($app) {
    check_chart_writable($id, function($user, $chart) use ($app) {

        $theme_css = array();
        $theme_js = array();

        $next_theme_id = $chart->getTheme();

        while (!empty($next_theme_id)) {
            $theme = get_theme_meta($next_theme_id);
            $theme_js[] = '/static/themes/' . $next_theme_id . '/theme.js';
            if ($theme['hasCSS']) {
                $theme_css[] = '/static/themes/' . $next_theme_id . '/theme.css';
            }
            $next_theme_id = $theme['extends'];
        }

        $base_js = array(
            '/static/vendor/miso/miso.ds.deps.0.1.3.js',
            '/static/vendor/jquery/jquery.min.js',
            '/static/js/dw.core.js',
            '/static/js/dw.chart.js',
            '/static/js/dw.theme.js'
        );

        $vis_js = array();

        $vis = get_visualization_meta($chart->getType());

        $scripts = array_merge($base_js, array_reverse($theme_js));

        $page = array(
            'chartData' => $chart->loadData(),
            'chart' => $chart,
            'theme' => get_theme_meta($chart->getTheme()),
            'stylesheets' => array_reverse($theme_css),
            'scripts' => $scripts
        );
        $app->render('chart-preview.twig', $page);
    });
});