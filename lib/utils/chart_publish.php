<?php

/*
 * Publishes a chart (js minification, copying files to static storage)
 *
 * @param $user       the user who published the chart
 * @param $chart      the chart to be published
 * @param $fromCLI    true if chart publication is not triggered by client
 * @param $justLocal  true if chart should only be published to local file system
 */
function publish_chart($user, $chart, $fromCli = false, $justLocal = false) {

    DatawrapperHooks::execute(
        DatawrapperHooks::PRE_CHART_PUBLISH,
        $chart, $user
    );

    $files = array();
    if (!$fromCli) _setPublishStatus($chart, 0.01);
    else print "Publishing chart ".$chart->getID().".\n";

    $files = array_merge($files, publish_html($user, $chart));
    if (!$fromCli) _setPublishStatus($chart, 0.1);
    $files = array_merge($files, publish_data($user, $chart));
    if (!$fromCli) _setPublishStatus($chart, 0.2);
    $files = array_merge($files, publish_js($user, $chart));

    if (!$fromCli) _setPublishStatus($chart, 0.3);
    else print "Files stored to static folder (html, data, js)\n";

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
    // correct publish time
    $chart->setPublishedAt(time());

    DatawrapperHooks::execute(
        DatawrapperHooks::POST_CHART_PUBLISH,
        $chart, $user
    );
}


function _setPublishStatus($chart, $status) {
    if (isset($_GLOBALS['dw-config']['memcache'])) {
        $memcache->set('publish-status-' . $chart->getID(), round($status*100));
    } else {
        file_put_contents(chart_publish_directory() . 'tmp/publish-status-' . $chart->getID(), round($status*100));
    }
}

function _getPublishStatus($chart) {
    if (isset($_GLOBALS['dw-config']['memcache'])) {
        return $memcache->get('publish-status-' . $chart->getID());
    } else {
        $fn = chart_publish_directory() . 'tmp/publish-status-' . $chart->getID();
        if (!file_exists($fn)) return false;
        return file_get_contents($fn);
    }
}

function _clearPublishStatus($chart) {
    if (isset($_GLOBALS['dw-config']['memcache'])) {
        global $memcache;
        $memcache->delete('publish-status-' . $chart->getID());
    } else {
        unlink(chart_publish_directory() . 'tmp/publish-status-' . $chart->getID());
    }
}

function get_static_path($chart) {
    $static_path = $chart->getStaticPath();
    if (!is_dir($static_path)) {
        mkdir($static_path);
    }
    return $static_path;
}

function publish_html($user, $chart) {
    $cdn_files = array();

    $static_path = get_static_path($chart);
    $seckey      = sha1(isset($GLOBALS['dw_config']['secure_auth_key']) ? $GLOBALS['dw_config']['secure_auth_key'] : '');
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
    $static_path = chart_publish_directory() . 'static/lib/';
    $data = get_chart_content($chart, $user, ThemeQuery::create()->findPk($chart->getTheme()), false, '../');

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

function publish_data($user, $chart) {
    $cdn_files = array();
    $static_path = get_static_path($chart);
    file_put_contents($static_path . "/data.csv", $chart->loadData());
    $cdn_files[] = array($static_path . "/data.csv", $chart->getCDNPath() . 'data.csv', 'text/plain');

    return $cdn_files;
}


function publish_push_to_cdn($cdn_files, $chart) {
    DatawrapperHooks::execute(DatawrapperHooks::PUBLISH_FILES, $chart, $cdn_files);
}


function download($url, $outf) {
    $strCookie = 'DW-SESSION=' . ($_COOKIE['DW-SESSION'] ?? "") . '; path=/';

    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        $fp = fopen($outf, 'w');

        session_write_close();

        curl_setopt($ch, CURLOPT_FILE, $fp);
        curl_setopt($ch, CURLOPT_HEADER, 0);

        $h = getallheaders();

        if (Session::getMethod() == "token" && !empty($h['Authorization'])) {
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                "Authorization: " .  $h['Authorization']
            ]);
        } else {
            curl_setopt($ch, CURLOPT_COOKIE, $strCookie);
        }

        if (isset($GLOBALS['dw_config']['http_auth'])) {
            curl_setopt($ch, CURLOPT_USERPWD, $GLOBALS['dw_config']['http_auth']);
        }

        curl_exec($ch);
        curl_close($ch);
        fclose($fp);

    } else {
        $cfg = array(
            'http' => array(
                'header' => "Connection: close\r\nCookie: $strCookie\r\n",
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

function chart_publish_directory() {
    $dir = ROOT_PATH.'charts';

    if (isset($GLOBALS['dw_config']['publish_directory'])) {
        $dir = $GLOBALS['dw_config']['publish_directory'];
    }

    if (!is_dir($dir)) {
        if (!@mkdir($dir, 0755, true)) {
            throw new RuntimeException('Could not create chart publish directory "'.$dir.'". Please create it manually and make sure PHP can write to it.');
        }
    }

    return rtrim(realpath($dir), DIRECTORY_SEPARATOR).DIRECTORY_SEPARATOR;
}

function publish_get_embed_templates($org) {
    $templates = [];

    // responsive iframe
    $templates[] = [
        "id" => "responsive",
        "title" => __("publish / embed / responsive"),
        "text" => __("publish / embed / responsive / text"),
        "template" => '<iframe title="%chart_title%" aria-label="%chart_type%" id="datawrapper-chart-%chart_id%" src="%chart_url%" scrolling="no" frameborder="0" style="width: 0; min-width: 100% !important; border: none;" height="%chart_height%"></iframe><script type="text/javascript">'
                . file_get_contents(ROOT_PATH . 'templates/chart/embed.js') .
            '</script>',
    ];

    // standard iframe
    $templates[] = [
        "id" => "iframe",
        "title" => __("publish / embed / iframe"),
        "text" => __("publish / embed / iframe / text"),
        "template" => '<iframe title="%chart_title%" aria-label="%chart_type%" src="%chart_url%" scrolling="no" frameborder="0" style="border: none;" width="%chart_width%" height="%chart_height%"></iframe>',
    ];

    if (!empty($org)) {
        $embed = $org->getSettings('embed');

        if (!empty($embed["preferred_embed"]) && $embed["preferred_embed"] == "custom") {
            $embed['custom_embed']['id'] = 'custom';
            $templates[] = $embed['custom_embed'];
        }
    }
    return $templates;
}

/*
 * returns the id of the embed type that is
 * pre-selected on load of the publish step
 */
function publish_get_preferred_embed_type($org) {
    $user = Session::getUser();
    if (!empty($org)) {
        $embed = $org->getSettings('embed');
        if (isset($embed["preferred_embed"])) {
            // for members of teams with custom embed,
            // the custom type is always the preferred type
            return $embed['preferred_embed'];
        }
    }
    // for other users it's whatever they selected last
    if (!empty($user->getUserData()['embed_type'])) {
        return $user->getUserData()['embed_type'];
    }
    // or responsive
    return 'responsive';
}

/*
 * returns the id of the shareurl type that
 * is pre-selected on load of the publishs step
 */
function publish_get_preferred_shareurl_type() {
    $user = Session::getUser();
    // whatever the user selected last
    if (!empty($user->getUserData()['shareurl_type'])) {
        return $user->getUserData()['shareurl_type'];
    }
    // or standalone
    return 'default';
}

/*
 * plugins may provide alternative shareurls for published
 * charts via a hook. this function collects the shareurls
 * and returns them for use in the new publish UI
 */
function publish_get_plugin_shareurls() {
    if (!Hooks::hookRegistered(Hooks::CHART_ADD_SHARE_URL)) return [];
    return Hooks::execute(Hooks::CHART_ADD_SHARE_URL);
}
