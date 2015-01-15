<?php

function get_chart_content($chart, $user, $published = false, $debug = false) {

    if (!function_exists('unique_scripts')) {
        function unique_scripts($scripts) {
            $exist = array();
            $out = array();
            foreach ($scripts as $s) {
                $src = is_array($s) ? $s['src'] : $s;
                if (isset($exist[$src])) continue;
                $exist[$src] = true;
                $out[] = is_array($s) ? $s : array('src' => $s);
            }
            return $out;
        }
    }

    $theme_css = array();
    $theme_js = array();
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https" : "http";

    $next_theme_id = $chart->getTheme();

    $locale = DatawrapperSession::getLanguage();
    if ($chart->getLanguage() != '') {
        $locale = $chart->getLanguage();
    }

    while (!empty($next_theme_id)) {
        $theme = DatawrapperTheme::get($next_theme_id);
        $theme_js[] = $theme['__static_path'] . $next_theme_id . '.js';
        if ($theme['hasStyles']) {
            $theme_css[] =  $theme['__static_path'] . $next_theme_id . '.css';
        }
        $next_theme_id = $theme['extends'];
    }

    $abs = $protocol . '://' . $GLOBALS['dw_config']['domain'];

    $debug = $GLOBALS['dw_config']['debug'] == true || $debug;

    if ($published && !$debug && !empty($GLOBALS['dw_config']['asset_domain'])) {
        $base_js = array(
            '//' . $GLOBALS['dw_config']['asset_domain'] . '/globalize.min.js',
            '//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.2/underscore-min.js',
            '//cdnjs.cloudflare.com/ajax/libs/jquery/1.11.1/jquery.min.js'
        );
        if (substr($locale, 0, 2) != 'en') {
            $base_js[] = '//' . $GLOBALS['dw_config']['asset_domain'] . '/cultures/globalize.culture.' . str_replace('_', '-', $locale) . '.js';
        }
    } else {
        // use local assets
        $base_js = array(
            $abs . '/static/vendor/globalize/globalize.min.js',
            $abs . '/static/vendor/underscore/underscore-1.5.2.min.js',
            $abs . '/static/vendor/jquery/jquery-1.11.1'.($debug ? '' : '.min').'.js'
        );
        if (substr($locale, 0, 2) != 'en') {
            $base_js[] = $abs . '/static/vendor/globalize/cultures/globalize.culture.' . str_replace('_', '-', $locale) . '.js';
        }
    }

    $vis_js = array();
    $vis_css = array();
    $next_vis_id = $chart->getType();

    $vis_libs = array();
    $vis_libs_cdn = array();
    $vis_libs_local = array();

    $vis_locale = array();  // visualizations may define localized strings, e.g. "other"

    while (!empty($next_vis_id)) {
        $vis = DatawrapperVisualization::get($next_vis_id);
        $vjs = array();
        if (!empty($vis['libraries'])) {
            foreach (array_reverse($vis['libraries']) as $script) {
                if (!is_array($script)) {
                    $script = array("local" => $script, "cdn" => false);
                }
                if (!empty($script['cdn'])) {
                    $script['src'] = $script['cdn'];
                    $vis_libs_cdn[] = $script;
                }

                // at first we check if the library lives in ./lib of the vis module
                if (file_exists(ROOT_PATH . 'www/' . $vis['__static_path'] . $script['local'])) {
                    $u = $vis['__static_path'] . $script['local'];
                } else if (file_exists(ROOT_PATH . 'www/static/vendor/' . $script['local'])) {
                    $u = '/static/vendor/' . $script['local'];
                } else {
                    die("could not find required library ".$script["local"]);
                }
                $script['src'] = $u;
                $vis_libs[] = $script;
                if (empty($url['cdn'])) $vis_libs_local[] = $script;
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

    $stylesheets = array_merge(
        array('/static/css/chart.base.css'),
        $vis_css,
        array_reverse($theme_css)
    );

    $the_vis = DatawrapperVisualization::get($chart->getType());
    $the_vis['locale'] = $vis_locale;
    $the_theme = DatawrapperTheme::get($chart->getTheme());
    $l10n__domain = $the_theme['__static_path'];

    $the_vis_js = get_vis_js($the_vis, array_merge(array_reverse($vis_js), $vis_libs_local));
    $the_theme_js = get_theme_js($the_theme, array_reverse($theme_js));
    $the_chart_js = get_chart_js();

    if ($published) {
        $scripts = array_merge(
            $base_js,
            $vis_libs_cdn,
            array(
                '/lib/' . $the_vis_js[0],
                '/lib/' . $the_theme_js[0],
                '/lib/' . $the_chart_js[0]
            )
        );
        $stylesheets = array($chart->getID().'.all.css');
        // NOTE: replace `/static/` by `assets/` in the `__static_path` value,
        //       since vis assets are handle by DatawrapperVisualization
        $replace_in = $the_vis['__static_path']; $replace_by = 'assets/'; $replace = '/static/';
        $the_vis['__static_path'] = substr_replace(
            $replace_in,                    // subject
            $replace_by,                    // replace by
            strrpos($replace_in, $replace), // position
            strlen($replace));              // length
        $the_theme['__static_path'] = '';
    } else {
        $scripts = unique_scripts(
            array_merge(
                $base_js,
                array('/static/js/dw-2.0'.($debug ? '' : '.min').'.js'),
                array_reverse($theme_js),
                array_reverse($vis_js),
                array_reverse($vis_libs),
                array('/static/js/dw/chart.base.js')
            )
        );
    }

    $cfg = $GLOBALS['dw_config'];
    $published_urls = DatawrapperHooks::execute(DatawrapperHooks::GET_PUBLISHED_URL, $chart);
    if (empty($published_urls)) {
        $chart_url = $protocol . '://' . $cfg['chart_domain'] . '/' . $chart->getID() . '/';
    } else {
        $chart_url = $published_urls[0];  // ignore urls except from the first one
    }

    $page = array(
        'chartData' => $chart->loadData(),
        'chart' => $chart,
        'lang' => strtolower(substr($locale, 0, 2)),
        'metricPrefix' => get_metric_prefix($locale),
        'l10n__domain' => $l10n__domain,
        'origin' => !empty($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : '',
        'DW_DOMAIN' => $protocol . '://' . $cfg['domain'] . '/',
        'DW_CHART_DATA' => $protocol . '://' . $cfg['domain'] . '/chart/' . $chart->getID() . '/data.csv',
        'ASSET_PATH' => $published ? '' : $the_theme['__static_path'],
        'published' => $published,
        'chartUrl' => $chart_url,
        'embedCode' => '<iframe src="' .$chart_url. '" frameborder="0" allowtransparency="true" allowfullscreen webkitallowfullscreen mozallowfullscreen oallowfullscreen msallowfullscreen width="'.$chart->getMetadata('publish.embed-width') . '" height="'. $chart->getMetadata('publish.embed-height') .'"></iframe>',
        'chartUrlFs' => strpos($chart_url, '.html') > 0 ? str_replace('index.html', 'fs.html', $chart_url) : $chart_url . '?fs=1',

        // used in chart.twig
        'stylesheets' => $stylesheets,
        'scripts' => $scripts,
        'visualization' => $the_vis,
        'theme' => $the_theme,
        'chartLocale' => str_replace('_', '-', $locale),

        // the following is used by chart_publish.php
        'vis_js' => $the_vis_js,
        'theme_js' => $the_theme_js,
        'chart_js' => $the_chart_js

    );

    return $page;
}

/*
 * returns an array
 *   [0] filename of the vis js class, eg, vis/column-chart-7266c4ee39b3d19f007f01be8853ac87.min.js
 *   [1] minified source code
 */
function get_vis_js($vis, $visJS) {
    // merge vis js into a single file
    $all = '';
    $org = DatawrapperSession::getUser()->getCurrentOrganization();
    if (!empty($org)) $org = '/'.$org->getID(); else $org = '';
    $keys = DatawrapperHooks::execute(DatawrapperHooks::GET_PUBLISH_STORAGE_KEY);
    if (is_array($keys)) $org .= '/' . join($keys, '/');
    foreach ($visJS as $js) {
        if (is_array($js)) $js = $js['src'];
        if (substr($js, 0, 7) != "http://" && substr($js, 0, 8) != "https://" && substr($js, 0, 2) != '//') {
            $all .= "\n\n\n" . file_get_contents(ROOT_PATH . 'www' . $js);
        }
    }
    $all = \JShrink\Minifier::minify($all);
    $all = file_get_contents(ROOT_PATH . 'www/static/js/dw-2.0.min.js') . "\n\n" . $all;
    // generate md5 hash of this file to get filename
    $vis_js_md5 = md5($all.$org);
    $vis_path = 'vis/' . $vis['id'] . '-' . $vis_js_md5 . '.min.js';
    return array($vis_path, $all);
}

/*
 * returns an array
 *   [0] filename of the theme js class, eg, theme/default-7266c4ee39b3d19f007f01be8853ac87.min.js
 *   [1] minified source code
 */
function get_theme_js($theme, $themeJS) {
    $all = '';
    $org = DatawrapperSession::getUser()->getCurrentOrganization();
    if (!empty($org)) $org = '/'.$org->getID(); else $org = '';
    $keys = DatawrapperHooks::execute(DatawrapperHooks::GET_PUBLISH_STORAGE_KEY);
    if (is_array($keys)) $org .= '/' . join($keys, '/');
    foreach ($themeJS as $js) {
        if (substr($js, 0, 7) != "http://" && substr($js, 0, 8) != "https://" && substr($js, 0, 2) != '//') {
            $all .= "\n\n\n" . file_get_contents(ROOT_PATH . 'www' . $js);
        }
    }
    $all = \JShrink\Minifier::minify($all);
    $theme_js_md5 = md5($all.$org);
    $theme_path = 'theme/' . $theme['id'] . '-' . $theme_js_md5 . '.min.js';
    return array($theme_path, $all);
}

function get_chart_js() {
    $js = file_get_contents(ROOT_PATH . 'www/static/js/dw/chart.base.js');
    $min = \JShrink\Minifier::minify($js);
    $md5 = md5($min);
    return array('chart-'.$md5.'.min.js', $min);
}
