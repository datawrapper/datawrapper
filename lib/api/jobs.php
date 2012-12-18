<?php


/*
 * creates new job
 */
$app->post('/jobs/:type/:id', function($type, $chart_id) use ($app) {
    disable_cache($app);
    if_chart_is_writable($chart_id, function($user, $chart) use ($app, $type) {
        try {
            // create a new export job for this chart
            $params = json_decode($app->request()->getBody(), true);
            $job = JobQuery::create()->createJob($type, $chart, $user, $params);
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
$app->get('/jobs/:type/estimate', function($type) use ($app) {
    disable_cache($app);
    ok(ceil(JobQuery::create()->estimatedTime($type) / 60));
});