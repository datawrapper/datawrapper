<?php


/*
 * creates new export job
 */
$app->post('/jobs/export/:id', function($chart_id) use ($app) {
    disable_cache($app);
    if_chart_is_writable($chart_id, function($user, $chart) use ($app) {
        try {
            // create a new export job for this chart
            $params = json_decode($app->request()->getBody(), true);
            $job = JobQuery::create()->createExportJob($chart, $user, $params);
            ok();
        } catch (Exception $e) {
            error('io-error', $e->getMessage());
        }
    });
});

/*
 * returns the estimated time to complete a new print job
 * in minutes
 */
$app->get('/jobs/export', function() use ($app) {
    disable_cache($app);
    ok(JobQuery::create()->estimatedTime('export'));
});