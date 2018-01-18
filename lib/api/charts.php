<?php

/**
 * API: get list of all charts by the current user
 */
$app->get('/charts', function() use ($app) {
    $user = Session::getUser();
    if ($user->isLoggedIn()) {
        $filter = array();
        if ($app->request()->get('filter')) {
            $f = explode("|", $app->request()->get('filter'));
            foreach ($f as $e) {
                list($key, $val) = explode(":", $e);
                $filter[$key] = $val;
            }
        }
        $charts = ChartQuery::create()->getPublicChartsById($user->getId(), false, $filter, 0, 200, $app->request()->get('order'));
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
    $user = Session::getUser();
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
    $user = Session::getUser();
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
        $user = Session::getUser();
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

        if ($app->request()->get('mode') == "print") $chart->usePrint();

        if ($chart->unserialize($json))
            ok($chart->serialize());
        else
            error('bad-put-body', 'Unable to parse request body.');
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
        if (!$chart->isDataWritable($user)) {
            error('read-only', 'the data is read-only');
            return false;
        }
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
        if (!$chart->isDataWritable($user)) {
            error('read-only', 'the data is read-only');
            return false;
        }

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
 * checks if a chart is readable by the current user (or guest)
 *
 * @param chart_id
 * @param callback the function to be executed if chart is writable
 */
function if_chart_is_readable($chart_id, $callback) {
    $chart = ChartQuery::create()->findPK($chart_id);
    if ($chart) {
        $user = Session::getUser();
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
 * API: copy/duplicate a chart
 *
 * @param chart_id chart id
 */
$app->post('/charts/:id/copy', function($chart_id) use ($app) {
    if_chart_is_readable($chart_id, function($user, $chart) use ($app) {
        if ($chart->getIsFork() == true) {
            // no duplicating allowed
            return error('not-allowed', __('You can not duplicate a forked chart.'));
        }
        try {
            $copy = ChartQuery::create()->copyChart($chart);
            $copy->setUser(Session::getUser());
            // $copy->setOrganization($user->getCurrentOrganization());
            $copy->save();
            if ($app->request()->post('redirect') == '1') {
                print '<script>window.location.href = "/chart/'.$copy->getId().'/visualize";</script>';
            } else {
                ok(array('id' => $copy->getId()));
            }
        } catch (Exception $e) {
            error('io-error', $e->getMessage());
        }
    });
});


/**
 * checks if a chart is forkable by the current user (or guest)
 *
 * @param chart_id
 * @param callback the function to be executed if chart is writable
 */
function if_chart_is_forkable($chart_id, $callback) {
    $chart = ChartQuery::create()->findPK($chart_id);
    if ($chart) {
        $user = Session::getUser();
        if ($chart->isForkable()) {
            call_user_func($callback, $user, $chart);
        } else {
            error('not-allowed', __('You can not re-fork a forked chart.'));
        }
    } else {
        // no such chart
        error_chart_not_found($id);
    }
}


/**
 * API: fork a chart
 *
 * @param chart_id chart id
 */
$app->post('/charts/:id/fork', function($chart_id) use ($app) {
    if_chart_is_forkable($chart_id, function($user, $chart) use ($app) {
        try {
            $fork = ChartQuery::create()->copyPublicChart($chart);
            if ($fork) {
                $fork->setUser(Session::getUser());
                $fork->setOrganization($user->getCurrentOrganization());
                $fork->setIsFork(true);
                $fork->save();
                ok(array('id' => $fork->getId()));
            } else {
                error('not-found');
            }
        } catch (Exception $e) {
            error('io-error', $e->getMessage());
        }
    });
});


$app->post('/charts/:id/publish', function($chart_id) use ($app) {
    disable_cache($app);
    if_chart_is_writable($chart_id, function($user, $chart) use ($app) {
        if ($user->mayPublish()) {
            $justLocal = $app->request()->get('local') == 1;
            $chart->publish();
            publish_chart($user, $chart, false, $justLocal);
            ok($chart->serialize());
        } else {
            error('need-to-upgrade', 'You need to activate/upgrade your account to publish.');
        }
    });
});

$app->get('/charts/:id/publish/status', function($chart_id) use ($app) {
    disable_cache($app);
    if_chart_is_writable($chart_id, function($user, $chart) use ($app) {
        echo json_encode(_getPublishStatus($chart));
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
            $thumb_filename = $chart->getThumbFilename($thumb);
            file_put_contents($thumb_filename, $imgdata);
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
                'themes' => ThemeQuery::findAll(),
            ));
        } catch (Exception $e) {
            error('io-error', $e->getMessage());
        }
    });
});

// endpoint to fix unicode problems in a chart
$app->get('/charts/:id/fix', function($id) use ($app) {
    $user = Session::getUser();
    $pdo = Propel::getConnection();
    $pdo->exec("SET character_set_results = 'utf8'");
    $res = $pdo->query("SELECT metadata FROM chart WHERE NOT JSON_CONTAINS_PATH(metadata, 'one', '$.data.\"charset-fixed\"') AND id = ".$pdo->quote($id));
    $metadata = $res->fetchColumn(0);
    if (!empty($metadata)) {
        print "fixing chart\n";
        $pdo->exec("UPDATE chart SET metadata = ".$pdo->quote($metadata)." WHERE id = ".$pdo->quote($id));
        $pdo->exec("UPDATE chart SET metadata = JSON_SET(metadata, '$.data.\"charset-fixed\"', true) WHERE id = ".$pdo->quote($id));
    } else {
            print "this chart has been fixed already\n";
    }
});
