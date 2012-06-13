<?php

/**
 * Datawrapper JSON API
 *
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Require the Slim PHP 5 Framework
require '../../vendor/Slim/Slim.php';

// include our JSON view
require '../../lib/api/views/JSONView.php';

// Include the main Propel script
require_once '../../vendor/propel/runtime/lib/Propel.php';

// Initialize Propel with the runtime configuration
Propel::init("../../lib/core/build/conf/datawrapper-conf.php");

// Add the generated 'classes' directory to the include path
set_include_path("../../lib/core/build/classes" . PATH_SEPARATOR . get_include_path());

require '../../lib/session/Datawrapper.php';


/**
 * Step 2: Instantiate the Slim application
 *
 * Here we instantiate the Slim application with its default settings.
 * However, we could also pass a key-value array of settings.
 * Refer to the online documentation for available settings.
 */
$app = new Slim(array( 'view' => 'JSONView' ));

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
$app->get('/foo', function () use ($app) {
    echo "foo";
    $data = array('foo' => 'bar', 'msg'=> 'Blublub');
    $app->render('json-error.php', $data, 200);
});

function error($code, $msg) {
    $result = array('status'=>'error');
    if (isset($code)) $result['code'] = $code;
    if (isset($msg)) $result['message'] = $msg;
    print json_encode($result);
}

function ok($data = null) {
    $result = array('status'=>'ok');
    if (isset($data)) $result['data'] = $data;
    print json_encode($result);
}

require_once '../../lib/api/users.php';
require_once '../../lib/api/auth.php';
require_once '../../lib/api/session.php';
require_once '../../lib/api/charts.php';
require_once '../../lib/api/visualizations.php';


/**
 * Step 4: Run the Slim application
 *
 * This method should be called last. This is responsible for executing
 * the Slim application using the settings and routes defined above.
 */
$app->run();
