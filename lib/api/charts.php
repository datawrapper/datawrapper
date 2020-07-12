<?php

/**
 * API: get list of all charts by the current user
 */
$app->get('/charts', function() use ($app) {
    if (!check_scopes(['chart:read'])) return;
    $user = Session::getUser();
    if ($user->isLoggedIn()) {
        $filter = array();
        if ($app->request()->get('filter')) {
            $f = explode("|", $app->request()->get('filter'));
            foreach ($f as $e) {
                $vals = explode(":", $e);
                if (sizeof($vals) == 2) {
                    $filter[$vals[0]] = $vals[1];
                }
            }
        }

        $offset = $app->request()->get('offset') ?? 0;

        $charts = ChartQuery::create()->getPublicChartsById($user->getId(), false, $filter, $offset, 200, $app->request()->get('order'));
    } else {
        $charts = ChartQuery::create()->getGuestCharts();
    }
    $res = array();
    foreach ($charts as $chart) {
        $res[] = $app->request()->get('expand') ? $chart->serialize() : $chart->shortArray();

        if (!empty($GLOBALS['dw_config']['img_domain'])) {
            $hash = md5($chart->getId() . "--" . strtotime($chart->getCreatedAt()));
            $thumbnail = [
                'full' => '//' . $GLOBALS['dw_config']['img_domain'] . '/' . $chart->getId() . '/' . $hash . '/full.png',
                'plain' => '//' . $GLOBALS['dw_config']['img_domain'] . '/' . $chart->getId() . '/' . $hash . '/plain.png'
            ];

            $res[sizeof($res) - 1]['thumbnail'] = $thumbnail;
        }
    }
    ok($res);
});

/**
 * API: create a new empty chart
 */
$app->post('/charts', function() {
    if (!check_scopes(['chart:write'])) return;
    $user = Session::getUser();
    try {
        $chart = ChartQuery::create()->createEmptyChart($user);
        $result = array($chart->serialize());
        ok($result);
    } catch (Exception $e) {
        error('create-chart-error', $e->getMessage());
    }
});

/**
 * load chart meta data
 *
 * @param id chart id
 */
$app->get('/charts/:id', function($id) use ($app) {
    if (!check_scopes(['chart:read'])) return;
    $chart = ChartQuery::create()->findPK($id);
    $user = Session::getUser();
    if (!empty($chart) && $chart->isReadable($user)) {
        $json = $chart->serialize();
        // don't expose author info to non-authors
        if (!$chart->isWritable($user)) {
            unset($json['author']);
        } else {
            if (!empty($GLOBALS['dw_config']['img_domain'])) {
                //var_dump($chart->getCreatedAt()); die();
                $hash = md5($chart->getId() . "--" . strtotime($chart->getCreatedAt()));
                $json['thumbnail'] = [
                    'full' => '//' . $GLOBALS['dw_config']['img_domain'] . '/' . $chart->getId() . '/' . $hash . '/full.png',
                    'plain' => '//' . $GLOBALS['dw_config']['img_domain'] . '/' . $chart->getId() . '/' . $hash . '/plain.png'
                ];
            }
        }

        ok($json);
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
    if (!check_scopes(['chart:write'])) return;
    if_chart_is_writable($id, function($user, $chart) use ($app) {
        if (!empty($GLOBALS['dw_config']['lock-utf8-charts']) && $chart->getUtf8() == 1) {
            return error('chart-locked', 'the chart is temporarily locked due to a database migration');
        }
        $json = json_decode($app->request()->getBody(), true);

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
    if (!check_scopes(['chart:read'])) return;
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
    if (!check_scopes(['chart:write'])) return;
    if_chart_is_writable($chart_id, function($user, $chart) use ($app) {
        if (!$chart->isDataWritable($user)) {
            error('read-only', 'the data is read-only');
            return false;
        }
        $data = $app->request()->getBody();
        try {
            $chart->writeData($data);
            $chart->save();
            ok();
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
    if (!check_scopes(['chart:write'])) return;
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
    if (!check_scopes(['chart:write'])) return;
    if_chart_is_writable($id, function($user, $chart) use ($app) {
        $chart->setDeleted(true);
        $chart->setDeletedAt(time());
        $chart->setLastEditStep(3);
        $chart->save();
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
    if (!check_scopes(['chart:write'])) return;
    if (!Session::isLoggedIn()) {
        return error('error', 'you need to be logged in to duplicate a chart');
    }
    if_chart_is_writable($chart_id, function($user, $chart) use ($app) {
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
    if (!check_scopes(['chart:write'])) return;
    if_chart_is_forkable($chart_id, function($user, $chart) use ($app) {
        try {
            $fork = ChartQuery::create()->copyPublicChart($chart, $user);
            if ($fork) {
                $fork->setInFolder(null);
                $fork->setTheme($GLOBALS['dw_config']['defaults']['theme']);
                $fork->updateMetadata('describe.byline', '');
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
