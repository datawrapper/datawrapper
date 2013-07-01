<?php


function get_chart_content($chart, $user, $published = false, $debug = false) {
    $theme_css = array();
    $theme_js = array();

    $next_theme_id = $chart->getTheme();

    $locale = DatawrapperSession::getLanguage();

    while (!empty($next_theme_id)) {
        $theme = DatawrapperTheme::get($next_theme_id);
        $theme_js[] = $theme['__static_path'] . $next_theme_id . '.js';
        if ($theme['hasStyles']) {
            $theme_css[] =  $theme['__static_path'] . $next_theme_id . '.css';
        }
        $next_theme_id = $theme['extends'];
    }

    $abs = 'http://' . $GLOBALS['dw_config']['domain'];

    $debug = $GLOBALS['dw_config']['debug'] == true || $debug;

    if ($published && !$debug) {
        $base_js = array(
            '//assets-datawrapper.s3.amazonaws.com/globalize.min.js',
            '//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.4.2/underscore-min.js',
            '//cdnjs.cloudflare.com/ajax/libs/jquery/1.9.1/jquery.min.js'
        );
        if (substr($locale, 0, 2) != 'en') {
            $base_js[] = '//assets-datawrapper.s3.amazonaws.com/cultures/globalize.culture.' . str_replace('_', '-', $locale) . '.js';
        }
    } else {
        // use local assets
        $base_js = array(
            $abs . '/static/vendor/globalize/globalize.min.js',
            $abs . '/static/vendor/underscore/underscore-min.js',
            $abs . '/static/vendor/jquery/jquery-1.9.1'.($debug ? '' : '.min').'.js'
        );
        if (substr($locale, 0, 2) != 'en') {
            $base_js[] = $abs . '/static/vendor/globalize/cultures/globalize.culture.' . str_replace('_', '-', $locale) . '.js';
        }
    }

    $vis_js = array();
    $vis_css = array();
    $next_vis_id = $chart->getType();

    $vis_libs = array();

    $vis_locale = array();  // visualizations may define localized strings, e.g. "other"

    while (!empty($next_vis_id)) {
        $vis = DatawrapperVisualization::get($next_vis_id);
        $vjs = array();
        if (!empty($vis['libraries'])) {
            foreach ($vis['libraries'] as $url) {
                // at first we check if the library lives in ./lib of the vis module
                if (file_exists(ROOT_PATH . 'www/' . $vis['__static_path'] . $url)) {
                    $vis_libs[] = $vis['__static_path'] . $url;
                } else if (file_exists(ROOT_PATH . 'www/static/vendor/' . $url)) {
                    $vis_libs[] = '/static/vendor/' . $url;
                }
            }
        }
        if (!empty($vis['locale']) && is_array($vis['locale'])) {
            foreach ($vis['locale'] as $term => $translations) {
                if (!isset($vis_locale[$term])) $vis_locale[$term] = $translations;
            }
        }
        $vjs[] = $vis['__static_path'] . $vis['id'] . '.js';
        $vis_js = array_merge($vis_js, array_reverse($vjs));
        if ($vis['hasCSS']) {
            $vis_css[] = $vis['__static_path'] . $vis['id'] . '.css';
        }
        $next_vis_id = !empty($vis['extends']) ? $vis['extends'] : null;
    }

    $styles = array_merge($vis_css, array_reverse($theme_css));

    $the_vis = DatawrapperVisualization::get($chart->getType());
    $the_vis['locale'] = $vis_locale;
    $the_theme = DatawrapperTheme::get($chart->getTheme());

    if ($published) {
        $scripts = array_merge(
            $base_js,
            array(
                '/lib/vis/' . $the_vis['id'] . '-' . $the_vis['version'] . '.min.js',
                '/lib/theme/' . $the_theme['id'] . '-' . $the_theme['version'] . '.min.js',
            )
        );
        $styles = array($chart->getID().'.min.css');
        $the_vis['__static_path'] = '';
        $the_theme['__static_path'] = '';
    } else {
        $scripts = array_unique(
            array_merge(
                $base_js,
                array('/static/js/datawrapper'.($debug ? '' : '.min').'.js'),
                array_reverse($theme_js),
                array_reverse($vis_js),
                $vis_libs
            )
        );
    }

    $cfg = $GLOBALS['dw_config'];
    $published_urls = DatawrapperHooks::execute(DatawrapperHooks::GET_PUBLISHED_URL, $chart);
    if (empty($published_urls)) {
        $chart_url = 'http://' . $cfg['chart_domain'] . '/' . $chart->getID() . '/';
    } else {
        $chart_url = $published_urls[0];  // ignore urls except from the first one
    }

    $page = array(
        'chartData' => $chart->loadData(),
        'chart' => $chart,
        'chartLocale' => str_replace('_', '-', $locale),
        'lang' => strtolower(substr($locale, 0, 2)),
        'metricPrefix' => get_metric_prefix($locale),
        'theme' => $the_theme,
        'l10n__domain' => $the_theme['__static_path'],
        'visualization' => $the_vis,
        'stylesheets' => $styles,
        'scripts' => $scripts,
        'themeJS' => array_reverse($theme_js),
        'visJS' => array_merge(array_reverse($vis_js), $vis_libs),
        'origin' => !empty($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : '',
        'DW_DOMAIN' => 'http://' . $cfg['domain'] . '/',
        'DW_CHART_DATA' => 'http://' . $cfg['domain'] . '/chart/' . $chart->getID() . '/data',
        'ASSET_PATH' => $published ? '' : $the_theme['__static_path'],
        'trackingCode' => !empty($analyticsMod) ? $analyticsMod->getTrackingCode($chart) : '',
        'chartUrl' => $chart_url,
        'embedCode' => '<iframe src="' .$chart_url. '" frameborder="0" allowtransparency="true" allowfullscreen webkitallowfullscreen mozallowfullscreen oallowfullscreen msallowfullscreen width="'.$chart->getMetadata('publish.embed-width') . '" height="'. $chart->getMetadata('publish.embed-height') .'"></iframe>',
        'chartUrlFs' => strpos($chart_url, '.html') > 0 ? str_replace('index.html', 'fs.html', $chart_url) : $chart_url . '?fs=1'
    );

    return $page;
}