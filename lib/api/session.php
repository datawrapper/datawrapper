<?php

/* get session info */
$app->get('/session', function() {
    try {
        $r = DatawrapperSession::toArray();
        ok($r);
    } catch (Exception $e) {
        error('exception', $e->getMessage());
    }
});

/* set a new language */
$app->put('/session/lang', function() use ($app) {
    $data = json_decode($app->request()->getBody());
    DatawrapperSession::setLanguage( $data->lang );
    ok();
});

