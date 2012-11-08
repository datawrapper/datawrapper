<?php

/**
 * API: get list of all charts by the current user
 */
$app->get('/charts', function() {
    $user = DatawrapperSession::getUser();
    if ($user->isLoggedIn()) {
        $charts = ChartQuery::create()->getPublicChartsByUser($user);
        $res = array();
        foreach ($charts as $chart) {
            $res[] = $chart->shortArray();
        }
        ok($res);
    } else {
        error('need-login', 'You need to be logged in to do that');
    }
});

/**
 * API: create a new empty chart
 */
$app->post('/charts', function() {
    $user = DatawrapperSession::getUser();
    if ($user->isLoggedIn()) {
        try {
            $chart = ChartQuery::create()->createEmptyChart($user);
            $result = array($chart->serialize());
            ok($result);
        } catch (Exception $e) {
            error('create-chart-error', $e->getMessage());
        }
    } else {
        error('need-login', 'You need to be logged in to create a chart..');
    }
});


/*
 * returns the metadata for all charts that are allowed
 * to show in the gallery
 */
$app->get('/gallery', function() use ($app) {
    $result = array();
    $q = ChartQuery::create()
        ->filterByShowInGallery(true)
        ->orderByCreatedAt('desc');
    if ($app->request()->get('type')) {
        $q->filterByType($app->request()->get('type'));
    }
    if ($app->request()->get('theme')) {
        $q->filterByTheme($app->request()->get('theme'));
    }
    if ($app->request()->get('month')) {
        $q->filterByTheme($app->request()->get('theme'));
    }
    $charts = $q->limit(20)->find();
    foreach ($charts as $chart) {
        $result[] = $chart->toArray();
    }
    ok($result);
});

/**
 * load chart meta data
 *
 * @param id chart id
 */
$app->get('/charts/:id', function($id) use ($app) {
    $chart = ChartQuery::create()->findPK($id);
    if (!empty($chart)) {
        ok($chart->serialize());
    } else {
        error('chart-not-found', 'No chart with that id was found');
    }
});



/**
 * checks if a chart is writeable by the current user (or guest)
 *
 * @param chart_id
 * @param callback the function to be executed if chart is writable
 */
function if_chart_is_writable($chart_id, $callback) {
    $chart = ChartQuery::create()->findPK($chart_id);
    if (!empty($chart)) {
        $user = DatawrapperSession::getUser();
        $res = $chart->isWritable($user);
        if ($res === true) {
            call_user_func($callback, $user, $chart);
        } else {
            error('access-denied', $res);
        }
    } else {
        error('no-such-chart', '');
    }
}

/* check user and update chart meta data */
$app->put('/charts/:id', function($id) use ($app) {
    if_chart_is_writable($id, function($user, $chart) use ($app) {
        $json = json_decode($app->request()->getBody(), true);
        $chart->unserialize($json);
        ok($chart->serialize());
    });
});


/**
 * API: upload data to a chart
 *
 * @param chart_id chart id
 */
$app->put('/charts/:id/data', function($chart_id) use ($app) {
    if_chart_is_writable($chart_id, function($user, $chart) use ($app) {
        $data = $app->request()->getBody();
        try {
            $filename = $chart->writeData($data);
            $chart->save();
            ok($filename);
        } catch (Exception $e) {
            error('io-error', $e->getMessage());
        }
    });
});

/**
 * API: upload csv file to a chart
 *
 * @param chart_id chart id
 */
$app->post('/charts/:id/data', function($chart_id) use ($app) {
    if_chart_is_writable($chart_id, function($user, $chart) use ($app) {

        require_once '../../lib/utils/file-uploader.php';

        // list of valid extensions, ex. array("jpeg", "xml", "bmp")
        $allowedExtensions = array('txt', 'csv', 'tsv');
        // max file size in bytes
        $sizeLimit = 2 * 1024 * 1024;

        $uploader = new qqFileUploader($allowedExtensions, $sizeLimit);
        $result = $uploader->handleUpload('../../charts/data/tmp/');
        // to pass data through iframe you will need to encode all html tags

        $data = file_get_contents($uploader->filename);

        try {
            if ($result['success']) {
                $filename = $chart->writeData($data);
                $chart->save();
                echo htmlspecialchars(json_encode($result), ENT_NOQUOTES);
                unlink($uploader->filename);
            } else {
                error('upload-error', $result['error']);
            }
        } catch (Exception $e) {
            error('io-error', $e->getMessage());
        }

    });
});



/* delete chart */
$app->delete('/charts/:id', function($id) use ($app) {
    if_chart_is_writable($id, function($user, $chart) use ($app) {
        $chart->setDeleted(true);
        $chart->setLastEditStep(3);
        $chart->save();
        $chart->unpublish();
        ok('');
    });
});

/**
 * API: copy a chart
 *
 * @param chart_id chart id
 */
$app->post('/charts/:id/copy', function($chart_id) use ($app) {
    if_chart_is_writable($chart_id, function($user, $chart) use ($app) {
        try {
            $copy = ChartQuery::create()->copyChart($chart);
            ok(array('id' => $copy->getId()));
        } catch (Exception $e) {
            error('io-error', $e->getMessage());
        }
    });
});


function get_static_path($chart) {
    $static_path = "../../charts/static/" . $chart->getID();
    if (!is_dir($static_path)) {
        mkdir($static_path);
    }
    return $static_path;
}

function push_to_s3($filename, $uploadName, $contentType = 'text/plain') {
    if (!empty($GLOBALS['dw_config']['s3'])) {
        $cfg = $GLOBALS['dw_config']['s3'];
        $s3 = new S3($cfg['accesskey'], $cfg['secretkey']);
        $s3->putObject($s3->inputFile($filename, false), $cfg['bucket'], $uploadName, S3::ACL_PUBLIC_READ, array(), array('Content-Type' => $contentType));
    }
}

/**
 * API: copy a chart
 *
 * @param chart_id chart id
 */
$app->post('/charts/:id/publish/html', function($chart_id) use ($app) {
    if_chart_is_writable($chart_id, function($user, $chart) use ($app) {
        try {
            $static_path = get_static_path($chart);
            $url = 'http://'.$GLOBALS['dw_config']['domain'].'/chart/'.$chart->getID().'/preview?minify=1';
            $outf = $static_path . '/index.html';
            if (function_exists('curl_init')) {
                $ch = curl_init($url);
                $fp = fopen($outf, 'w');

                $strCookie = 'DW-SESSION=' . $_COOKIE['DW-SESSION'] . '; path=/';
                session_write_close();

                curl_setopt($ch, CURLOPT_FILE, $fp);
                curl_setopt($ch, CURLOPT_HEADER, 0 );
                curl_setopt($ch, CURLOPT_COOKIE, $strCookie);
                curl_exec($ch);
                curl_close($ch);
                fclose($fp);

            } else {
                $context = stream_context_create(array(
                    'http' => array(
                        'header' => 'Connection: close\r\n',
                        'method' => 'GET'
                    )
                ));
                $html = file_get_contents($url, false, $context);
                file_put_contents($outf, $html);
            }
            push_to_s3($outf, $chart->getID() . '/index.html', 'text/html');
            ok();
        } catch (Exception $e) {
            error('io-error', $e->getMessage());
        }
    });
});


require_once '../../lib/utils/themes.php';
require_once '../../lib/utils/visualizations.php';
require_once '../../lib/utils/chart_content.php';
require_once '../../vendor/jsmin/jsmin.php';

/**
 * API: generate minified JS for a chart
 *
 * @param chart_id chart id
 */
$app->post('/charts/:id/publish/js', function($chart_id) use ($app) {
    if_chart_is_writable($chart_id, function($user, $chart) use ($app) {
        try {
            $static_path = $static_path = '../../charts/static/lib/';
            $data = get_chart_content($chart, $user, false, '../');

            // generate visualization script
            $vis = $data['visualization'];
            $vis_path = 'vis/' . $vis['id'] . '-' . $vis['version'] . '.min.js';
            if (!file_exists($static_path . $vis_path)) {
                $all = file_get_contents('../static/js/dw.js');
                foreach ($data['visJS'] as $js) {
                    if (substr($js, 0, 7) != 'http://' && substr($js, 0, 2) != '//') {
                        $all .= "\n\n\n" . file_get_contents('..' . $js);
                    }
                }
                $all = JSMin::minify($all);
                file_put_contents($static_path . $vis_path, $all);
            }
            push_to_s3($static_path . $vis_path, 'lib/' . $vis_path, 'application/javascript');

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
            push_to_s3($static_path . $theme_path, 'lib/' . $theme_path, 'application/javascript');

            ok();
        } catch (Exception $e) {
            error('io-error', $e->getMessage());
        }
    });
});

require_once '../../vendor/cssmin/cssmin.php';

/**
 * API: generate minified CSS for a chart
 *      and copy assets
 *
 * @param chart_id chart id
 */
$app->post('/charts/:id/publish/css', function($chart_id) use ($app) {
    if_chart_is_writable($chart_id, function($user, $chart) use ($app) {
        try {
            $static_path = get_static_path($chart);
            $data = get_chart_content($chart, $user, false, '../');

            $all = '';

            foreach ($data['stylesheets'] as $css) {
                $all .= file_get_contents('..' . $css)."\n\n";
            }

            $cssmin = new CSSmin();
            $minified = $all; //$cssmin->run($all);
            file_put_contents($static_path . "/" . $chart->getID() . '.min.css', $minified);

            push_to_s3($static_path."/".$chart->getID().'.min.css', $chart->getID().'/'.$chart->getID().'.min.css', 'text/css');

            // copy themes assets
            $theme = $data['theme'];
            if (isset($theme['assets'])) {
                foreach ($theme['assets'] as $asset) {
                    $asset_src = '../../www/static/themes/' . $theme['id'] . '/' . $asset;
                    $asset_tgt = $static_path . "/" . $asset;
                    if (file_exists($asset_src)) {
                        file_put_contents($asset_tgt, file_get_contents($asset_src));
                        push_to_s3($asset_src, $chart->getID() . '/' . $asset);
                    }
                }
            }

            ok();
        } catch (Exception $e) {
            error('io-error', $e->getMessage());
        }
    });
});

/*
 * publishes the data to static chart cache
 */
$app->post('/charts/:id/publish/data', function($chart_id) use ($app) {
    if_chart_is_writable($chart_id, function($user, $chart) use ($app) {
        try {
            $static_path = get_static_path($chart);
            file_put_contents($static_path . "/data", $chart->loadData());
            push_to_s3($static_path . "/data", $chart->getID() . '/data');
            $chart->setPublishedAt(time());
            $chart->save();
            ok();
        } catch (Exception $e) {
            error('io-error', $e->getMessage());
        }
    });
});

/*
 * stores client-side generated chart thumbnail
 */
$app->put('/charts/:id/thumbnail/:thumb', function($chart_id, $thumb) use ($app) {
    if_chart_is_writable($chart_id, function($user, $chart) use ($app, $thumb) {
        try {
            $imgurl = $app->request()->getBody();
            $imgdata = base64_decode(substr($imgurl, strpos($imgurl, ",") + 1));
            $static_path = get_static_path($chart);
            file_put_contents($static_path . "/" . $thumb . '.png', $imgdata);
            ok();
        } catch (Exception $e) {
            error('io-error', $e->getMessage());
        }
    });
});

