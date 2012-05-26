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

function add_header_vars(&$page) {
    // define the header links
    $headlinks = array();
    $headlinks[] = array('url' => '/', 'id' => 'home', 'title' => 'Home', 'icon' => 'home');
    $headlinks[] = array('url' => '/chart/create', 'id' => 'create', 'title' => 'Create', 'icon' => 'pencil');
    $headlinks[] = array('url' => '/mycharts', 'id' => 'mycharts', 'title' => 'My Charts', 'icon' => 'signal');
    $headlinks[] = array('url' => '#logout', 'id' => 'logout', 'title' => 'Logout', 'icon' => 'user');
    $page['headlinks'] = $headlinks;
}

function add_editor_nav(&$page, $step) {
    // define 4 step navigation
    $steps = array();
    $steps[] = array('index'=>1, 'id'=>'upload', 'title'=>'Upload Data');
    $steps[] = array('index'=>2, 'id'=>'describe', 'title'=>'Check & Describe');
    $steps[] = array('index'=>3, 'id'=>'visualize', 'title'=>'Visualize');
    $steps[] = array('index'=>4, 'id'=>'publish', 'title'=>'Publish');
    $page['steps'] = $steps;
    $page['createstep'] = $step;
}

//GET route
$app->get('/', function () use ($app) {
    $page = array('title' => 'Datawrapper');
    add_header_vars($page);
    $app->render('index.twig', $page);
});

$app->get('/chart/create', function() use ($app) {
    $app->redirect('/chart/12345/upload');
});

$app->get('/chart/:id/upload', function ($id) use ($app) {
    $page = array('title' => 'Upload some data');
    add_header_vars($page);
    add_editor_nav($page, 1);
    $app->render('chart-upload.twig', $page);
});


/**
 * Step 4: Run the Slim application
 *
 * This method should be called last. This is responsible for executing
 * the Slim application using the settings and routes defined above.
 */
$app->run();