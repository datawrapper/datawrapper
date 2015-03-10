<?php

/*
 * Publishes a chart (js and css minification, copying files to static storage)
 *
 * @param $user       the user who published the chart
 * @param $chart      the chart to be published
 * @param $fromCLI    true if chart publication is not triggered by client
 * @param $justLocal  true if chart should only be published to local file system
 */
function publish_chart($user, $chart, $fromCli = false, $justLocal = false) {
    $files = array();
    if (!$fromCli) _setPublishStatus($chart, 0.01);
    else print "Publishing chart ".$chart->getID().".\n";

    $files = array_merge($files, publish_html($user, $chart));
    if (!$fromCli) _setPublishStatus($chart, 0.05);
    $files = array_merge($files, publish_css($user, $chart));
    if (!$fromCli) _setPublishStatus($chart, 0.1);
    $files = array_merge($files, publish_data($user, $chart));
    if (!$fromCli) _setPublishStatus($chart, 0.2);
    $files = array_merge($files, publish_js($user, $chart));

    if (!$fromCli) _setPublishStatus($chart, 0.3);
    else print "Files stored to static folder (html, css, data, js)\n";

    $totalSize = 0;  // total file size
    foreach ($files as $i => $file) {
        $totalSize += filesize($file[0]);
    }

    $done = 0;
    foreach ($files as $file) {
        if (!$justLocal) publish_push_to_cdn(array($file), $chart);
        $done += filesize($file[0]);
        _setPublishStatus($chart, 0.3 + ($done / $totalSize) * 0.7);
    }

    if (!$fromCli) {
        _setPublishStatus($chart, 1);
        _clearPublishStatus($chart);
    } else print "Files pushed to CDN.\n";

    $chart->redirectPreviousVersions();

    DatawrapperHooks::execute(
        DatawrapperHooks::POST_CHART_PUBLISH,
        $chart, $user
    );
}


function _setPublishStatus($chart, $status) {
    if (isset($_GLOBALS['dw-config']['memcache'])) {
        $memcache->set('publish-status-' . $chart->getID(), round($status*100));
    } else {
        file_put_contents(ROOT_PATH . 'charts/tmp/publish-status-' . $chart->getID(), round($status*100));
    }
}

function _getPublishStatus($chart) {
    if (isset($_GLOBALS['dw-config']['memcache'])) {
        return $memcache->get('publish-status-' . $chart->getID());
    } else {
        $fn = ROOT_PATH . 'charts/tmp/publish-status-' . $chart->getID();
        if (!file_exists($fn)) return false;
        return file_get_contents($fn);
    }
}

function _clearPublishStatus($chart) {
    if (isset($_GLOBALS['dw-config']['memcache'])) {
        global $memcache;
        $memcache->delete('publish-status-' . $chart->getID());
    } else {
        unlink(ROOT_PATH . 'charts/tmp/publish-status-' . $chart->getID());
    }
}

function get_static_path($chart) {
    $static_path = ROOT_PATH . "charts/static/" . $chart->getID();
    if (!is_dir($static_path)) {
        mkdir($static_path);
    }
    return $static_path;
}

function publish_html($user, $chart) {
    $cdn_files = array();

    $static_path = get_static_path($chart);
    $seckey      = sha1($GLOBALS['dw_config']['secure_auth_key']);
    $protocol    = get_current_protocol();
    $url         = $protocol."://".$GLOBALS['dw_config']['domain'].'/chart/'.$chart->getID().'/preview?minify=1&seckey='.$seckey;
    $outf        = $static_path . '/index.html';

    $chart->setPublishedAt(time() + 5);
    $chart->setLastEditStep(5);
    $chart->save();

    download($url,            $outf);
    download($url.'&plain=1', $static_path.'/plain.html');
    download($url.'&fs=1',    $static_path.'/fs.html');

    $cdn_files[] = array($outf, $chart->getCDNPath() . 'index.html', 'text/html');
    $cdn_files[] = array($static_path . '/plain.html', $chart->getCDNPath() . 'plain.html', 'text/html');
    $cdn_files[] = array($static_path . '/fs.html', $chart->getCDNPath() . 'fs.html', 'text/html');

    // copy empty image as placeholder for nojs.png
    file_put_contents($static_path . '/nojs.png', file_get_contents(ROOT_PATH . 'www/static/img/nojs.png'));
    return $cdn_files;
}

function publish_js($user, $chart) {
    $cdn_files = array();
    $static_path = ROOT_PATH . 'charts/static/lib/';
    $data = get_chart_content($chart, $user, false, '../');

    // generate visualization script
    $vis = $data['visualization'];
    $vis_js = $data['vis_js'];

    // add comment
    $vis_js[1] = "/*\n * datawrapper / vis / {$vis['id']} v{$vis['version']}\n"
               . " * generated on ".date('c')."\n */\n"
               . $vis_js[1];
    file_put_contents($static_path . $vis_js[0], $vis_js[1]);
    $cdn_files[] = array(
        $static_path . $vis_js[0],
        'lib/' . $vis_js[0],
        'application/javascript'
    );

    // generate theme script
    $theme = $data['theme'];
    $theme_js = $data['theme_js'];

    $theme_js[1] = "/*\n * datawrapper / theme / {$theme['id']} v{$theme['version']}\n"
                 . " * generated on ".date('c')."\n */\n"
                 . $theme_js[1];
    file_put_contents($static_path . $theme_js[0], $theme_js[1]);

    $cdn_files[] = array(
        $static_path . $theme_js[0],
        'lib/' . $theme_js[0],
        'application/javascript'
    );

    // generate chart script
    $chart_js = $data['chart_js'];

    $chart_js[1] = "/*\n * datawrapper / chart \n"
                 . " * generated on ".date('c')."\n */\n"
                 . $chart_js[1];
    file_put_contents($static_path . $chart_js[0], $chart_js[1]);

    $cdn_files[] = array(
        $static_path . $chart_js[0],
        'lib/' . $chart_js[0],
        'application/javascript'
    );

    return $cdn_files;
}


function publish_css($user, $chart) {
    $cdn_files = array();
    $static_path = get_static_path($chart);
    $data = get_chart_content($chart, $user, false, '../');

    $all = '';

    foreach ($data['stylesheets'] as $css) {
        $all .= file_get_contents(ROOT_PATH . 'www' . $css)."\n\n";
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
    $minified = $all; //$cssmin->run($all); disabled minification
    file_put_contents($static_path . "/" . $chart->getID() . '.all.css', $minified);

    $cdn_files[] = array(
        $static_path."/".$chart->getID().'.all.css',
        $chart->getCDNPath() . $chart->getID().'.all.css', 'text/css'
    );

    // copy themes assets
    $theme = $data['theme'];
    if (isset($theme['assets'])) {
        foreach ($theme['assets'] as $asset) {
            $asset_src = '../../www/' . $theme['__static_path'] . '/' . $asset;
            $asset_tgt = $static_path . "/" . $asset;
            if (file_exists($asset_src)) {
                file_put_contents($asset_tgt, file_get_contents($asset_src));
                $cdn_files[] = array($asset_src, $chart->getCDNPath() . $asset);
            }
        }
    }

    // copy visualization assets
    $vis = $data['visualization'];
    $assets = DatawrapperVisualization::assets($vis['id'], $chart);
    foreach ($assets as $asset) {
        $asset_src = ROOT_PATH . 'www/static/' . $asset;
        $asset_tgt = $static_path . '/assets/' . $asset;
        create_missing_directories($asset_tgt);
        copy($asset_src, $asset_tgt);
        $cdn_files[] = array($asset_src, $chart->getCDNPath() . 'assets/' . $asset);
    }

    return $cdn_files;
}


function publish_data($user, $chart) {
    $cdn_files = array();
    $static_path = get_static_path($chart);
    file_put_contents($static_path . "/data.csv", $chart->loadData());
    $cdn_files[] = array($static_path . "/data.csv", $chart->getCDNPath() . 'data.csv', 'text/plain');

    return $cdn_files;
}


function publish_push_to_cdn($cdn_files, $chart) {
    DatawrapperHooks::execute(DatawrapperHooks::PUBLISH_FILES, $cdn_files);
}


function download($url, $outf) {
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        $fp = fopen($outf, 'w');

        $strCookie = 'DW-SESSION=' . $_COOKIE['DW-SESSION'] . '; path=/';
        session_write_close();

        curl_setopt($ch, CURLOPT_FILE, $fp);
        curl_setopt($ch, CURLOPT_HEADER, 0 );
        curl_setopt($ch, CURLOPT_COOKIE, $strCookie);
        if (isset($GLOBALS['dw_config']['http_auth'])) {
            curl_setopt($ch, CURLOPT_USERPWD, $GLOBALS['dw_config']['http_auth']);
        }
        curl_exec($ch);
        curl_close($ch);
        fclose($fp);

    } else {
        $cfg = array(
            'http' => array(
                'header' => 'Connection: close\r\n',
                'method' => 'GET'
            )
        );
        if (isset($GLOBALS['dw_config']['http_auth'])) {
            $cfg['http']['header'] .=
                "Authorization: Basic " . base64_encode($GLOBALS['dw_config']['http_auth']) . '\r\n';
        }
        $context = stream_context_create($cfg);
        $html = file_get_contents($url, false, $context);
        file_put_contents($outf, $html);
    }
}
