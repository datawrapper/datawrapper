<?php

require_once '../../vendor/cssmin/cssmin.php';
require_once '../../lib/utils/themes.php';
require_once '../../lib/utils/chart_content.php';
require_once '../../vendor/jsmin/jsmin.php';


function publish_html($user, $chart) {
    $cdn_files = array();

    $static_path = get_static_path($chart);
    $url = 'http://'.$GLOBALS['dw_config']['domain'].'/chart/'.$chart->getID().'/preview?minify=1';
    $outf = $static_path . '/index.html';
    download($url, $outf);
    download($url . '&plain=1', $static_path . '/plain.html');
    download($url . '&fs=1', $static_path . '/fs.html');

    $chart->setPublishedAt(time() + 5);
    $chart->setLastEditStep(5);
    $chart->save();

    $cdn_files[] = array($outf, $chart->getID() . '/index.html', 'text/html');
    $cdn_files[] = array($static_path . '/plain.html', $chart->getID() . '/plain.html', 'text/html');
    $cdn_files[] = array($static_path . '/fs.html', $chart->getID() . '/fs.html', 'text/html');

    return $cdn_files;
}

function publish_js($user, $chart) {
    $cdn_files = array();
    $static_path = $static_path = '../../charts/static/lib/';
    $data = get_chart_content($chart, $user, false, '../');

    // generate visualization script
    $vis = $data['visualization'];
    $vis_path = 'vis/' . $vis['id'] . '-' . $vis['version'] . '.min.js';
    if (!file_exists($static_path . $vis_path)) {
        $all = '';
        foreach ($data['visJS'] as $js) {
            if (substr($js, 0, 7) != 'http://' && substr($js, 0, 2) != '//') {
                $all .= "\n\n\n" . file_get_contents('..' . $js);
            }
        }
        $all = JSMin::minify($all);
        $all = file_get_contents('../static/js/datawrapper.min.js') . "\n\n" . $all;
        file_put_contents($static_path . $vis_path, $all);
        $cdn_files[] = array(
            $static_path . $vis_path,
            'lib/' . $vis_path,
            'application/javascript'
        );
    }

    // generate theme script
    $theme = $data['theme'];
    $theme_path = 'theme/' . $theme['id'] . '-' . $theme['version'] . '.min.js';

    if (!file_exists($static_path . $theme_path)) {
        $all = '';
        foreach ($data['themeJS'] as $js) {
            if (substr($js, 0, 7) != 'http://' && substr($js, 0, 2) != '//') {
                $all .= "\n\n\n" . file_get_contents('..' . $js);
            }
        }
        $minified = JSMin::minify($all);
        file_put_contents($static_path . $theme_path, $minified);
    }
    $cdn_files[] = array($static_path . $theme_path, 'lib/' . $theme_path, 'application/javascript');
    return $cdn_files;
}


function publish_css($user, $chart) {
    $cdn_files = array();
    $static_path = get_static_path($chart);
    $data = get_chart_content($chart, $user, false, '../');

    $all = '';

    foreach ($data['stylesheets'] as $css) {
        $all .= file_get_contents('..' . $css)."\n\n";
    }

    // move @imports to top of file
    $imports = array();
    $body = "";
    $lines = explode("\n", $all);
    foreach($lines as $line) {
        if (substr($line, 0, 7) == '@import') $imports[] = $line;
        else $body .= $line."\n";
    }
    $all = implode("\n", $imports) . "\n\n" . $body;

    $cssmin = new CSSmin();
    $minified = $all; //$cssmin->run($all);
    file_put_contents($static_path . "/" . $chart->getID() . '.min.css', $minified);

    $cdn_files[] = array(
        $static_path."/".$chart->getID().'.min.css',
        $chart->getID().'/'.$chart->getID().'.min.css', 'text/css'
    );

    // copy themes assets
    $theme = $data['theme'];
    if (isset($theme['assets'])) {
        foreach ($theme['assets'] as $asset) {
            $asset_src = '../../www/' . $theme['__static_path'] . '/' . $asset;
            $asset_tgt = $static_path . "/" . $asset;
            if (file_exists($asset_src)) {
                file_put_contents($asset_tgt, file_get_contents($asset_src));
                $cdn_files[] = array($asset_src, $chart->getID() . '/' . $asset);
            }
        }
    }

    // copy visualization assets
    $vis  = $data['visualization'];
    $src  = '..'.$vis['__static_path'];
    $dest = '../../charts/static/' . $chart->getID();
    if (isset($vis['assets'])) {
        foreach ($vis['assets'] as $asset) {
            copy( $src.DIRECTORY_SEPARATOR.$asset, $dest.DIRECTORY_SEPARATOR.$asset );
            $cdn_files[] = array($dest.DIRECTORY_SEPARATOR.$asset, $chart->getID() . '/' . $asset);
        }
    }

    return $cdn_files;
}


function publish_data($user, $chart) {
    $cdn_files = array();
    $static_path = get_static_path($chart);
    file_put_contents($static_path . "/data", $chart->loadData());
    $cdn_files[] = array($static_path . "/data", $chart->getID() . '/data', 'text/plain');

    return $cdn_files;
}


function publish_push_to_cdn($cdn_files, $chart) {
    DatawrapperHooks::execute(DatawrapperHooks::PUBLISH_FILES, $cdn_files);
}
