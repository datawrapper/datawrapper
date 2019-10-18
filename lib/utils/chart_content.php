<?php

function get_chart_content($chart, $user, $theme, $published = false, $debug = false) {

    if (!function_exists('unique_scripts')) {
        function unique_scripts($scripts) {
            $exist = [];
            $out = [];
            foreach ($scripts as $s) {
                $src = is_array($s) ? $s['src'] : $s;
                if (isset($exist[$src])) continue;
                $exist[$src] = true;
                $out[] = is_array($s) ? $s : array('src' => $s);
            }
            return $out;
        }
    }

    $protocol = get_current_protocol();

    $locale = DatawrapperSession::getLanguage();
    if ($chart->getLanguage() != '') {
        $locale = $chart->getLanguage();
    }

    // decide if we still need jquery, globalize etc.
    $vis = DatawrapperVisualization::get($chart->getType());
    $dependencies = $vis['dependencies'] ?? ['globalize' => true, 'jquery' => true];

    $static_path = $GLOBALS['dw_config']['static_path'];
    $abs = $protocol . '://' . $GLOBALS['dw_config']['domain'];
    if ($static_path == 'static/') $static_path = $abs . $static_path;

    $abs = $protocol . '://' . $GLOBALS['dw_config']['domain'];

    $debug = $GLOBALS['dw_config']['debug'] == true || $debug;
    $culture = str_replace('_', '-', $locale);

    // load numeral & dayjs locales, if needed
    $visDependencyLocales = '{';
    foreach (['numeral', 'dayjs'] as $key) {
        if ($dependencies[$key] ?? false) {
            $localePath = ROOT_PATH . 'www/static/vendor/'.$key.'/locales/' . strtolower($culture) . '.js';
            if (!file_exists($localePath)) {
                // try just language
                $localePath = ROOT_PATH . 'www/static/vendor/'.$key.'/locales/' . strtolower(substr($culture, 0, 2)) . '.js';
            }
            if (file_exists($localePath)) {
                $rawLocale = file_get_contents($localePath);
                $add = "\n$key: ".substr(trim(preg_replace('#^\s*//.*\n#m', '', preg_replace('#/\*.*\*/#', '', preg_replace('#\n\s+#', '', str_replace('export default ', '', preg_replace('#//.*#m', '', $rawLocale)))))),0,-1).",";
                $visDependencyLocales .= $add;
            }
        }
    }

    $visDependencyLocales .= '}';

    if ($published && !empty($GLOBALS['dw_config']['asset_domain'])) {
        $base_js = [
            '//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min.js'
        ];
        if ($dependencies['globalize']) {
            $base_js[] = '//' . $GLOBALS['dw_config']['asset_domain'] . '/globalize.min.js';
            $base_js[] = '//' . $GLOBALS['dw_config']['asset_domain'] . '/cultures/globalize.culture.' . $culture . '.js';
        }
        if ($dependencies['jquery']) {
            $base_js[] = '//cdnjs.cloudflare.com/ajax/libs/jquery/1.11.1/jquery.min.js';
        }
    } else {
        // use "local" assets
        $base_js = array(
            $abs . '/static/vendor/underscore/underscore-min.js'
        );
        if ($dependencies['globalize']) {
            $base_js[] = $abs . '/static/vendor/globalize/globalize.min.js';
            $base_js[] = $abs . '/static/vendor/globalize/cultures/globalize.culture.' . $culture . '.js';
        }
        if ($dependencies['jquery']) {
            $base_js[] = $abs . '/static/vendor/jquery/jquery.min.js';
        }
    }

    $vis_js = [];
    $vis_less = [];
    $next_vis_id = $chart->getType();

    $vis_libs = [];
    $vis_libs_cdn = [];
    $vis_libs_local = [];

    $chartLocale = str_replace('_', '-', $locale);
    $chartLanguage = substr($locale, 0, 2);

    // visualizations may define localized strings, e.g. "other"
    $vis_locale = [];
    $vis_versions = [];

    while (!empty($next_vis_id)) {
        $vis = DatawrapperVisualization::get($next_vis_id);
        // $vis_static_path = str_replace('/static/', $static_path . '/', $vis['__static_path']);
        $vis_static_path = $vis['__static_path'];
        $vis_static_path_fs = $vis['__static_path_fs'];

        $vis_versions[] = $vis['version'];
        $vjs = [];
        if (!empty($vis['libraries'])) {
            foreach ($vis['libraries'] as $script) {
                if (!is_array($script)) {
                    $script = array("local" => $script, "cdn" => false);
                }
                if (!empty($script['cdn'])) {
                    if (!empty($GLOBALS['dw_config']['ignore_cdn_chart_assets'])) {
                        // don't use assets from cdn url
                        unset($script['cdn']);
                    } else {
                        $script['src'] = $script['cdn'];
                        $vis_libs_cdn[] = $script;
                    }
                }

                // at first we check if the library lives in ./lib of the vis module
                if (file_exists($vis_static_path_fs . $script['local'])) {
                    $u = $vis_static_path . $script['local'];
                } else if (file_exists(ROOT_PATH . 'www/static/vendor/' . $script['local'])) {
                    $u = '/static/vendor/' . $script['local'];
                } else {
                    print $vis_static_path_fs . $script['local'];
                    die("could not find required library ".$script["local"]);
                }
                $script['src'] = $u;
                $vis_libs[] = $script;
                if (empty($script['cdn'])) $vis_libs_local[] = $script;
            }
        }
        if (!empty($vis['locale']) && is_array($vis['locale'])) {
            foreach ($vis['locale'] as $term => $translations) {
                if (!isset($vis_locale[$term])) {
                    // first we try to find the chart locale
                    if (!empty($translations[$chartLocale])) {
                        $vis_locale[$term] = $translations[$chartLocale];
                    }
                    // now we try to find a different locale of the
                    // same language, e.g. en-US for en-GB
                    else {
                        if (is_array($translations)) {
                            foreach ($translations as $locale => $translation) {
                                if (!empty($translations[$locale]) && substr($locale, 0, 2) == $chartLanguage) {
                                    $vis_locale[$term] = $translations[$locale];
                                    // stop after we found one
                                    break;
                                }
                            }
                        }
                    }
                    // if we still haven't found a translation
                    // we fall back to en-US
                    if (!isset($vis_locale[$term])) {
                        $vis_locale[$term] = $translations['en-US'] ?? $term;
                    }
                }
            }
        }
        $vjs[] = $vis_static_path . $vis['id'] . '.js';
        $vis_js = array_merge($vis_js, array_reverse($vjs));
        if (!empty($vis['less'])) {
            $vis_less[] = $vis['less'];
        }
        $next_vis_id = !empty($vis['extends']) ? $vis['extends'] : null;
    }

    $stylesheets = [];

    $the_vis = DatawrapperVisualization::get($chart->getType());
    $the_vis['locale'] = $vis_locale;
    $the_vis_js = get_vis_js($the_vis, array_merge(array_reverse($vis_js), $vis_libs_local));
    $the_chart_js = get_chart_js();

    if ($published) {
        $scripts = array_merge(
            $base_js,
            $vis_libs_cdn,
            array(
                '/lib/' . $the_vis_js[0],
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
    } else {
        $scripts = unique_scripts(
            array_merge(
                $base_js,
                array($static_path . '/js/dw-2.0'.($debug ? '' : '.min').'.js'),
                array_reverse($vis_js),
                $vis_libs,
                array($static_path . '/js/dw/chart.base.js')
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

    $data_source = $chart->getMetadata('describe.source-name');
    if (!empty($data_source)) {
        $data_source_url = $chart->getMetadata('describe.source-url');
        if (!empty($data_source_url)) {
            $data_source = '<a class="source" target="_blank" href="'.$data_source_url.'">'.$data_source.'</a>';
        }
    }

    $forked_from = $chart->getForkedFrom();
    $chart_byline = strip_tags($chart->getMetadata('describe.byline'));
    $chart_based_on = false;

    if (!empty($forked_from) && $chart->getIsFork()) {
        // find the original chart
        $origChart = ChartQuery::create()->findOneById($forked_from);
        $chartMeta = DatawrapperPlugin_River::getChartMeta($origChart->getId(), $origChart);

        if ($origChart && !empty($origChart->getMetadata('describe.byline'))) {
            $based_on_url = '';
            if (!empty($chartMeta['source_url'])) {
                $based_on_url = $chartMeta['source_url'];
            } else if (Hooks::hookRegistered('chart_created_with_datawrapper_url')) {
                // see if we have a chart url
                $based_on_url = Hooks::execute('chart_created_with_datawrapper_url', $origChart)[0];
            }

            $chart_based_on = $origChart->getMetadata('describe.byline');
            if (!empty($based_on_url)) {
                $chart_based_on = '<a  target="_blank" href="'.$based_on_url.'">'.$chart_based_on.'</a>';
            }

            // clear byline
            if ($chart->getID() == $origChart->getID()) {
                $chart_byline = '';
            }
            // combine byline with based on link if possible
            if (!empty($chart_byline)) {
                $chart_byline .= ' ('.__('footer / based-on', 'themes').' '.$chart_based_on.')';
                $chart_based_on = false;
            }
        }
    }

    if (empty($theme)) $theme = ThemeQuery::create()->findPk("default");

    unset($the_vis['options']);
    unset($the_vis['icon']);

    $page = array(
        'chartData' => $chart->loadData(),
        'chart' => $chart,
        'lang' => strtolower(substr($locale, 0, 2)),
        'metricPrefix' => get_metric_prefix($locale),
        'origin' => !empty($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : '',
        'DW_DOMAIN' => $protocol . '://' . $cfg['domain'] . '/',
        'DW_CHART_DATA' => $protocol . '://' . $cfg['domain'] . '/chart/' . $chart->getID() . '/data.csv',
        'published' => $published,
        'chartUrl' => $chart_url,
        'embedCode' => '<iframe src="' .$chart_url. '" frameborder="0" allowtransparency="true" allowfullscreen webkitallowfullscreen mozallowfullscreen oallowfullscreen msallowfullscreen width="'.$chart->getMetadata('publish.embed-width') . '" height="'. $chart->getMetadata('publish.embed-height') .'"></iframe>',
        'chartUrlFs' => strpos($chart_url, '.html') > 0 ? str_replace('index.html', 'fs.html', $chart_url) : $chart_url . '?fs=1',
        'chartSource' => $data_source,
        'chartByline' => $chart_byline,
        'chartBasedOn' => $chart_based_on,

        // used in chart.twig
        'stylesheets' => $stylesheets,
        'scripts' => $scripts,
        'visualization' => $the_vis,
        'theme' => $theme,
        'themeCSS' => $theme->getCSS($vis_less),
        'chartCSS' => $chart->getMetadata('publish.custom-css', ''),
        'chartLocale' => $chartLocale,
        'locales' => $visDependencyLocales,
        'SENTRY_RELEASE' => $the_vis['id'].'@'.substr(md5(join($vis_versions, '-')), 0, 8),

        // the following is used by chart_publish.php
        'vis_js' => $the_vis_js,
        'chart_js' => $the_chart_js,
        'vis_version' => substr(md5(join($vis_versions, '-')), 0, 8)

    );

    return $page;
}

/*
 * returns an array
 *   [0] filename of the vis js class, eg, vis/column-chart-7266c4ee39b3d19f007f01be8853ac87.min.js
 *   [1] minified source code
 */
function get_vis_js($vis, $visJS) {
    global $dw_config;
    $rewritePaths = isset($dw_config['copy_plugin_assets']) && $dw_config['copy_plugin_assets'] === false;

    // merge vis js into a single file
    $all = '';
    $org = DatawrapperSession::getUser()->getCurrentOrganization();
    if (!empty($org)) $org = '/'.$org->getID(); else $org = '';
    $keys = DatawrapperHooks::execute(DatawrapperHooks::GET_PUBLISH_STORAGE_KEY);
    if (is_array($keys)) $org .= '/' . join($keys, '/');
    foreach ($visJS as $js) {
        if (is_array($js)) $js = $js['src'];
        if (substr($js, 0, 7) != "http://" && substr($js, 0, 8) != "https://" && substr($js, 0, 2) != '//') {
            if ($rewritePaths) {
                $path = preg_replace('@/static/plugins/(.*?)/(.*)@', get_plugin_path() . "$1/static/$2", $js);
            } else {
                $path = ROOT_PATH . 'www' . $js;
            }

            if (file_exists($path)) {
                $all .= "\n\n\n" . file_get_contents($path);
            }
        }
    }
    $all = jsminify($all);
    $all = file_get_contents(ROOT_PATH . 'www/static/js/dw-2.0.min.js') . "\n\n" . $all;
    // generate md5 hash of this file to get filename
    $vis_js_md5 = md5($all.$org);
    $vis_path = 'vis/' . $vis['id'] . '-' . $vis_js_md5 . '.min.js';
    return array($vis_path, $all);
}

function get_chart_js() {
    $js   = file_get_contents(ROOT_PATH . 'www/static/js/dw/chart.base.js');
    $hash = sha1($js);

    return array('chart-'.$hash.'.min.js', jsminify($js));
}

function jsminify($code) {
    $hash = sha1($code);
    $tmp  = ROOT_PATH.'tmp/'.$hash.'.min.js';

    if (!is_file($tmp)) {
        $min = \JShrink\Minifier::minify($code);
        file_put_contents($tmp, $min);
    }
    else {
        $min = file_get_contents($tmp);
    }

    return $min;
}
