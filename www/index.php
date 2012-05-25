<?php

/**
 * Datawrapper main index
 *
 */

// Require the Slim PHP 5 Framework
require '../vendor/Slim/Slim.php';

// Include the main Propel script
// Initialize Propel with the runtime configuration
// Add the generated 'classes' directory to the include path
require_once '../vendor/propel/runtime/lib/Propel.php';
Propel::init("../lib/core/build/conf/datawrapper-conf.php");
set_include_path("../lib/core/build/classes" . PATH_SEPARATOR . get_include_path());

// Load TwigView
require_once '../vendor/Slim-Extras/Views/TwigView.php';
TwigView::$twigDirectory = '../vendor/Twig';

// include datawrapper session serialization
require '../lib/session/Datawrapper.php';


$app = new Slim(array(
    'view' => new TwigView(),
    'templates.path' => '../templates'
));

//GET route
$app->get('/', function () use ($app) {
    $app->render('index.twig', array('name' => 'fooo'));
});

$app->get('/chart/:id/upload', function ($id) use ($app) {
    $app->render('chart-upload.twig', array('name' => 'fooo'));
});


/**
 * Step 4: Run the Slim application
 *
 * This method should be called last. This is responsible for executing
 * the Slim application using the settings and routes defined above.
 */
$app->run();