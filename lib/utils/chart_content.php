<?php

function get_chart_content($chart, $user, $minified = false, $path = '') {
    $theme_css = array();
    $theme_js = array();

    $next_theme_id = $chart->getTheme();

    $locale = $user->getLanguage();
    $themeLocale = null;

    while (!empty($next_theme_id)) {
        $theme = get_theme_meta($next_theme_id, $path);
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

    $abs = 'http://' . $GLOBALS['dw_config']['domain'];

    $base_js = array(
        $abs . '/static/vendor/globalize/globalize.min.js',
        $abs . '/static/vendor/underscore/underscore-min.js',
        $abs . '/static/vendor/jquery/jquery.min.js'
    );

    $vis_js = array();
    $vis_css = array();
    $next_vis_id = $chart->getType();

    $vis_libs = array();

    while (!empty($next_vis_id)) {
        $vis = get_visualization_meta($next_vis_id, $path);
        $vjs = array();
        if (!empty($vis['libraries'])) {
            foreach ($vis['libraries'] as $url) {
                $vis_libs[] = '/static/vendor/' . $url;
            }
        }
        $vjs[] = '/static/visualizations/' . $vis['id'] . '/' . $vis['id'] . '.js';
        $vis_js = array_merge($vis_js, array_reverse($vjs));
        if ($vis['hasCSS']) {
            $vis_css[] = '/static/visualizations/' . $vis['id'] . '/style.css';
        }
        $next_vis_id = !empty($vis['extends']) ? $vis['extends'] : null;
    }

    $styles = array_merge($vis_css, array_reverse($theme_css));

    $the_vis = get_visualization_meta($chart->getType(), $path);
    $the_theme = get_theme_meta($chart->getTheme(), $path);

    if ($minified) {
        $scripts = array_merge(
            $base_js,
            array(
                '/lib/vis/' . $the_vis['id'] . '-' . $the_vis['version'] . '.min.js',
                '/lib/theme/' . $the_theme['id'] . '-' . $the_theme['version'] . '.min.js',
            )
        );
        $styles = array($chart->getID().'.min.css');
    } else {
        $scripts = array_unique(
            array_merge(
                $base_js,
                array('/static/js/dw.min.js'),
                array_reverse($theme_js),
                array_reverse($vis_js),
                $vis_libs
            )
        );
    }

    $page = array(
        'chartData' => $chart->loadData(),
        'chart' => $chart,
        'chartLocale' => str_replace('_', '-', $locale),
        'metricPrefix' => get_metric_prefix($locale),
        'theme' => $the_theme,
        'visualization' => $the_vis,
        'stylesheets' => $styles,
        'scripts' => $scripts,
        'themeJS' => array_reverse($theme_js),
        'visJS' => array_merge(array_reverse($vis_js), $vis_libs),
        'origin' => !empty($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : '',
        'DW_DOMAIN' => 'http://' . $GLOBALS['dw_config']['domain'] . '/',
        'DW_CHART_DATA' => 'http://' . $GLOBALS['dw_config']['domain'] . '/chart/' . $chart->getID() . '/data',
        'ASSET_PATH' => $minified ? '' : '/static/themes/'.$the_theme['id'].'/'
    );

    if (isset($GLOBALS['dw_config']['piwik'])) {
        $page['PIWIK_URL'] = $GLOBALS['dw_config']['piwik']['url'];
        if (isset($GLOBALS['dw_config']['piwik']['idSiteCharts'])) {
            $page['PIWIK_IDSITE'] = $GLOBALS['dw_config']['piwik']['idSiteCharts'];
        } else {
            $page['PIWIK_IDSITE'] = $GLOBALS['dw_config']['piwik']['idSite'];
        }

    }

    return $page;
}