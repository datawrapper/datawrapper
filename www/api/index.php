<?php

/**
 * Step 1: Require the Slim PHP 5 Framework
 *
 * If using the default file layout, the `Slim/` directory
 * will already be on your include path. If you move the `Slim/`
 * directory elsewhere, ensure that it is added to your include path
 * or update this file path as needed.
 */
require '../../lib/Slim/Slim.php';
require 'views/JSONView.php';
require '../../lib/dw/Datawrapper.php';

/**
 * Step 2: Instantiate the Slim application
 *
 * Here we instantiate the Slim application with its default settings.
 * However, we could also pass a key-value array of settings.
 * Refer to the online documentation for available settings.
 */
$app = new Slim(array(
    'view' => 'JSONView'
));

/**
 * Step 2a: Instantiate the Datawrapper application
 *
 */
Datawrapper::init();

/**
 * Step 3: Define the Slim application routes
 *
 * Here we define several Slim application routes that respond
 * to appropriate HTTP request methods. In this example, the second
 * argument for `Slim::get`, `Slim::post`, `Slim::put`, and `Slim::delete`
 * is an anonymous function. If you are using PHP < 5.3, the
 * second argument should be any variable that returns `true` for
 * `is_callable()`. An example GET route for PHP < 5.3 is:
 *
 * $app = new Slim();
 * $app->get('/hello/:name', 'myFunction');
 * function myFunction($name) { echo "Hello, $name"; }
 *
 * The routes below work with PHP >= 5.3.
 */

//GET route
$app->get('/', function () use ($app) {
    $data = array('foo' => 'bar', 'msg'=> 'Blublub');
    $app->render('json-error.php', $data, 200);
});

$app->post('/login', function() {
    echo 'You are logged in now.';
});

/* returns the currently selected frontend language */
$app->get('/lang', function() use ($app) {
    $lang = DW::getLanguage();
    $app->render('json-ok.php', array('lang' => $lang));
});

/* set a new language */
$app->put('/lang', function() use ($app) {
    $data = json_decode($app->request()->getBody());
    DW::setLanguage( $data->lang );
    echo 'the language has been set to ' . $data->lang;
});

/* return a list of all charts by the logged user */
$app->get('/charts/', function() use ($app) {

});

/* load chart meta data */
$app->get('/charts/:id', function($id) use ($app) {
    $res = DW::getChartMetaData($id);
    $app->render('json-error.php', $res, 200);
});

/* check user and update chart meta data */
$app->put('/charts/:id', function($id) use ($app) {
    if (DW::checkLogin()) {
        if (DW::chartIsWritable($id)) {
            $data = json_decode($app->request()->getBody());
            DW::setChartMetaData($id, $data);
        } else {
            $app->render('json-error.php', array('code' => 'access-denied', 'msg' => 'You don\'t have the rights to modifiy this chart'));
        }
    } else {
        $app->render('json-error.php', array('code' => 'need-login', 'msg' => 'you must be logged in'));
    }
    $res = DW::setChartMetaData($id);
});

/**
 * Step 4: Run the Slim application
 *
 * This method should be called last. This is responsible for executing
 * the Slim application using the settings and routes defined above.
 */
$app->run();
