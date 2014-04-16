<?php

/*
 * get list of all currently available themes
 *
 */

$app->get('/themes', function() {
    $res = DatawrapperTheme::all();
    ok($res);
});

$app->get('/themes/:themeid', function($themeid) {
    $res = DatawrapperTheme::get($themeid);
    ok($res);
});