<?php

/* get session info */
$app->get('/account', function() {
    try {
        $r = Session::toArray();
        ok($r);
    } catch (Exception $e) {
        error('exception', $e->getMessage());
    }
});

/* get current language */
$app->get('/account/lang', function() use ($app) {
    ok(Session::getLanguage());
});

/* set a new language */
$app->put('/account/lang', function() use ($app) {
    $data = json_decode($app->request()->getBody());
    Session::setLanguage( $data->lang );
    ok();
});

/*
 * return a list of any available alternative signin methods
 */
$app->get('/auth/alternative-signins', function () use ($app) {
    ok(Hooks::execute(Hooks::ALTERNATIVE_SIGNIN));
});
