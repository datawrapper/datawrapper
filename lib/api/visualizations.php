<?php

/*
 * get list of all currently available chart types
 * watch out: this request involves browsing in the file
 * system and parsing of several JSON files
 *
 * it will be cached once per user session but should be
 * used carefully anyway. never call this in embedded charts
 */


$app->get('/visualizations', function() {
    if (!check_scopes(['visualization:read'])) return;
    if (false && isset($_SESSION['dw-visualizations'])) {
        // read from session cache
        // ToDo: use user-independend cache here (e.g. memcache)
        $res = $_SESSION['dw-visualizations'];
    } else {
        // read from file system
        $res = DatawrapperVisualization::all();
        // store in cache
        $_SESSION['dw-visualizations'] = $res;
    }
    ok($res);
});

$app->get('/visualizations/:visid', function($visid) {
    if (!check_scopes(['visualization:read'])) return;
    $res = DatawrapperVisualization::get($visid);
    ok($res);
});