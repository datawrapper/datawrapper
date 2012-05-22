<?php

/**
 * Step 1: Require the Slim PHP 5 Framework
 *
 * If using the default file layout, the `Slim/` directory
 * will already be on your include path. If you move the `Slim/`
 * directory elsewhere, ensure that it is added to your include path
 * or update this file path as needed.
 */
require '../../vendor/Slim/Slim.php';

// include our JSON view
require 'views/JSONView.php';

// Include the main Propel script
require_once '../../vendor/propel/runtime/lib/Propel.php';

// Initialize Propel with the runtime configuration
Propel::init("../../lib/datawrapper/build/conf/datawrapper-conf.php");

// Add the generated 'classes' directory to the include path
set_include_path("../../lib/datawrapper/build/classes" . PATH_SEPARATOR . get_include_path());

require '../../lib/dw/Datawrapper.php';


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
$app->get('/', function () use ($app) {
    $data = array('foo' => 'bar', 'msg'=> 'Blublub');
    $app->render('json-error.php', $data, 200);
});



require_once '../../lib/dw-api/users.php';
require_once '../../lib/dw-api/session.php';
require_once '../../lib/dw-api/charts.php';


/**
 * Step 4: Run the Slim application
 *
 * This method should be called last. This is responsible for executing
 * the Slim application using the settings and routes defined above.
 */
$app->run();
