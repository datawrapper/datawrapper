<?php

function get_chart_content($chart, $user) {
    $theme_css = array();
    $theme_js = array();

    $next_theme_id = $chart->getTheme();

    $locale = $user->getLanguage();
    $themeLocale = null;

    while (!empty($next_theme_id)) {
        $theme = get_theme_meta($next_theme_id);
        $theme_js[] = '/static/themes/' . $next_theme_id . '/theme.js';
        if ($theme['hasStyles']) {
            $theme_css[] = '/static/themes/' . $next_theme_id . '/theme.css';
        }
        if (!empty($theme['hasLocaleJS'])) {
            $theme_js[] = $theme['localeJS'];
            if (empty($themeLocale)) $themeLocale = $theme['locale'];
        }
        $next_theme_id = $theme['extends'];
    }
    // theme locale overrides user locale
    if (!empty($themeLocale)) $locale = $themeLocale;
    // per-chart locale overrides theme locale
    $chartLocale = $chart->getLanguage();
    if (!empty($chartLocale)) $locale = $chartLocale;

    $base_js = array(
        '/static/vendor/globalize/globalize.js',
        '/static/vendor/underscore/underscore-min.js',
        '/static/vendor/jquery/jquery.min.js',
        '/static/js/dw.min.js'
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
        'chartLocale' => str_replace('_', '-', $locale),
        'metricPrefix' => get_metric_prefix($locale),
        'theme' => get_theme_meta($chart->getTheme()),
        'visualization' => get_visualization_meta($chart->getType()),
        'stylesheets' => $styles,
        'scripts' => $scripts,
        'origin' => !empty($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : ''
    );
}