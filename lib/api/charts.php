<?php

/**
 * API: get list of all charts by the current user
 */
$app->get('/charts', function() use ($app) {
    $user = DatawrapperSession::getUser();
    if ($user->isLoggedIn()) {
        $filter = array();
        if ($app->request()->get('filter')) {
            $f = explode("|", $app->request()->get('filter'));
            foreach ($f as $e) {
                list($key, $val) = explode(":", $e);
                $filter[$key] = $val;
            }
        }
        $charts = ChartQuery::create()->getPublicChartsByUser($user, $filter, 0, 200, $app->request()->get('order'));
    } else {
        $charts = ChartQuery::create()->getGuestCharts();
    }
    $res = array();
    foreach ($charts as $chart) {
        $res[] = $app->request()->get('expand') ? $chart->serialize() : $chart->shortArray();
    }
    ok($res);
});

/**
 * API: create a new empty chart
 */
$app->post('/charts', function() {
    $user = DatawrapperSession::getUser();
    try {
        $chart = ChartQuery::create()->createEmptyChart($user);
        $result = array($chart->serialize());
        ok($result);
    } catch (Exception $e) {
        error('create-chart-error', $e->getMessage());
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
        ->filterByLastEditStep(array('min' => 4))
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
    $user = DatawrapperSession::getUser();
    if (!empty($chart) && $chart->isReadable($user)) {
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


function if_chart_exists($id, $callback) {
    $chart = ChartQuery::create()->findPK($id);
    if ($chart) {
        call_user_func($callback, $chart);
    } else {
        // no such chart
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
 * API: get chart data
 *
 * @param chart_id chart id
 */
$app->get('/charts/:id/data', function($chart_id) use ($app) {
    if_chart_is_writable($chart_id, function($user, $chart) use ($app) {
        $data = $chart->loadData();
        $app->response()->header('Content-Type', 'text/csv;charset=utf-8');
        print $data;
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
    disable_cache($app);
    if_chart_is_writable($chart_id, function($user, $chart) use ($app) {
        $allowedExtensions = array('txt', 'csv', 'tsv');
        $sizeLimit         = 2 * 1024 * 1024; // byte

        $uploader = new qqFileUploader($allowedExtensions, $sizeLimit);
        $result   = $uploader->handleUpload(chart_publish_directory().'data/tmp/');

        // check and correct file encoding
        $detect_encoding = function($string) {
            $charsets = array('utf-8', 'iso-8859-15', 'iso-8859-1', 'iso-8859-3', 'windows-1251');

            foreach ($charsets as $charset) {
                $sample = @iconv($charset, $charset, $string);

                if (md5($sample) == md5($string)) {
                    return $charset;
                }
            }

            return null;
        };

        try {
            if (isset($result['success'])) {
                $data = file_get_contents($uploader->filename);
                $enc  = $detect_encoding($data); // works better than mb_detect_encoding($data);

                if (strtolower($enc) != 'utf-8') {
                    $data = mb_convert_encoding($data, 'utf-8', $enc);
                }

                $chart->writeData($data);
                $chart->save();

                unlink($uploader->filename);

                ok($result);
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
        $chart->setDeletedAt(time());
        $chart->setLastEditStep(3);
        $chart->save();
        $chart->unpublish();
        ok('');
    });
});



/**
 * checks if a chart is reable by the current user (or guest)
 *
 * @param chart_id
 * @param callback the function to be executed if chart is writable
 */
function if_chart_is_readable($chart_id, $callback) {
    $chart = ChartQuery::create()->findPK($chart_id);
    if ($chart) {
        $user = DatawrapperSession::getUser();
        if ($chart->isReadable($user) === true) {
            call_user_func($callback, $user, $chart);
        } else {
            // no such chart
            error_chart_not_writable();
        }
    } else {
        // no such chart
        error_chart_not_found($id);
    }
}


/**
 * API: copy/duplicate/fork a chart
 *
 * @param chart_id chart id
 */
$app->post('/charts/:id/copy', function($chart_id) use ($app) {
    if_chart_is_readable($chart_id, function($user, $chart) use ($app) {
        try {
            $copy = ChartQuery::create()->copyChart($chart);
            $copy->setUser(DatawrapperSession::getUser());
            $copy->save();
            ok(array('id' => $copy->getId()));
        } catch (Exception $e) {
            error('io-error', $e->getMessage());
        }
    });
});


$app->post('/charts/:id/publish', function($chart_id) use ($app) {
    disable_cache($app);
    if_chart_is_writable($chart_id, function($user, $chart) use ($app) {
        $justLocal = $app->request()->get('local') == 1;
        $chart->publish();
        publish_chart($user, $chart, false, $justLocal);
        ok();
    });
});

$app->get('/charts/:id/publish/status', function($chart_id) use ($app) {
    disable_cache($app);
    if_chart_is_writable($chart_id, function($user, $chart) use ($app) {
        echo _getPublishStatus($chart);
    });
});


/*
 * stores client-side generated chart thumbnail
 */
$app->put('/charts/:id/thumbnail/:thumb', function($chart_id, $thumb) use ($app) {
    disable_cache($app);
    if_chart_is_writable($chart_id, function($user, $chart) use ($app, $thumb) {
        try {
            $imgurl = $app->request()->getBody();
            $imgdata = base64_decode(substr($imgurl, strpos($imgurl, ",") + 1));
            $static_path = get_static_path($chart);
            file_put_contents($static_path . "/" . $thumb . '.png', $imgdata);
            // DatawrapperHooks::execute(DatawrapperHooks::PUBLISH_FILES, array(
            //     array(
            //         $static_path . "/" . $thumb . '.png',
            //         $chart->getID() . '/' . $thumb . '.png',
            //         'image/png'
            //     )
            // ));
            ok();
        } catch (Exception $e) {
            print $e;
            error('io-error', $e);
        }
    });
});

/*
 * stores static snapshot of a chart (data, configuration, etc) as JSON
 * to /test/test-charts. This aims to simplify the generation of test
 * cases using the Datawrapper editor. Only for debugging.
 */
$app->post('/charts/:id/store_snapshot', function($chart_id) use ($app) {
    if (!empty($GLOBALS['dw_config']['debug_export_test_cases'])) {
        if_chart_exists($chart_id, function($chart) use ($app) {
            $json = $chart->serialize();
            $payload = json_decode($app->request()->getBody(), true);
            $name = $payload['id'];
            $json['_data'] = $chart->loadData();
            $json['_sig'] = $payload['signature'];
            if (empty($name)) {
                error('', 'no name specified');
            } else {
                $name = str_replace(" ", "-", $name);
                $json['_id'] = $name;
                file_put_contents("../../test/test-charts/" . $name . ".json", json_encode($json));
                ok();
            }
        });
    }
});

$app->get('/charts/:id/vis-data', function ($chart_id) {
    if_chart_is_readable($chart_id, function($user, $chart) {
        try {
            $allVis = array();

            foreach (DatawrapperVisualization::all() as $vis) {
                $allVis[$vis['id']] = $vis;
            }

            ok(array(
                'visualizations' => $allVis,
                'vis' => DatawrapperVisualization::get($chart->getType()),
                'themes' => DatawrapperTheme::all(),
            ));
        } catch (Exception $e) {
            error('io-error', $e->getMessage());
        }
    });
});
