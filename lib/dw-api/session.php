<?php

$app->post('/session/login', function() {
    echo 'You are logged in now.';
});

/* returns the currently selected frontend language */
$app->get('/session/lang', function() use ($app) {
    $lang = DW::getLanguage();
    $app->render('json-ok.php', array($lang));
});

/* set a new language */
$app->put('/session/lang', function() use ($app) {
    $data = json_decode($app->request()->getBody());
    DW::setLanguage( $data->lang );
    $app->render('json-ok.php');
//    echo 'the language has been set to ' . $data->lang;
});

