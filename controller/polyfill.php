<?php

//GET route
$app->get('/polyfill', function () use ($app) {
    disable_cache($app);

    if (preg_match('~MSIE|Internet Explorer~i', $_SERVER['HTTP_USER_AGENT']) || (strpos($_SERVER['HTTP_USER_AGENT'], 'Trident/7.0;') !== false)) {
        $app->redirect('https://datawrapper.dwcdn.net/assets/polyfills/ie-11.js');
    } else {
        $app->response()->header('Content-Type', 'application/javascript');
        echo '/* no polyfill needed */';
    }
});

