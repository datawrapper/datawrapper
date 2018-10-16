<?php


/*
 * creates new job
 */
$app->post('/actions/:key', function($key) use ($app) {
    disable_cache($app);
    $user = Session::getUser();
    $details = $app->request()->getBody();
    $action = Action::logAction($user, $key, $details);
    ok($action->toArray());
});

