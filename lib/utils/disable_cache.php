<?php

function disable_cache($app) {
    $res = $app->response();
    $res['Expires'] = 'Tue, 03 Jul 2001 06:00:00 GMT';
    $res['Cache-Control'] = "no-store, no-cache, must-revalidate, max-age=0\npost-check=0, pre-check=0";
    $res['Pragma'] = "no-cache";
    $app->lastModified(time()+1000);
}