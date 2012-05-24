<?php
// Require the Slim PHP 5 Framework
require '../vendor/Slim/Slim.php';

// Include the main Propel script
require_once '../vendor/propel/runtime/lib/Propel.php';


// Initialize Propel with the runtime configuration
Propel::init("../lib/core/build/conf/datawrapper-conf.php");

// Add the generated 'classes' directory to the include path
set_include_path("../lib/core/build/classes" . PATH_SEPARATOR . get_include_path());

// include datawrapper session serialization
require '../lib/session/Datawrapper.php';


$app = new Slim();

//GET route
$app->get('/', function () use ($app) {
    echo "welcome to datawrapper";
    phpinfo();
});

/**
 * Step 4: Run the Slim application
 *
 * This method should be called last. This is responsible for executing
 * the Slim application using the settings and routes defined above.
 */
$app->run();