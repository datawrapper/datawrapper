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


function add_header_vars(&$page, $active = undefined) {
    // define the header links
    global $app;
    if (!isset($active)) {
        $active = explode('/', $app->request()->getResourceUri());
        $active = $active[1];
    }

    $user = DatawrapperSession::getUser();
    $headlinks = array();
    $headlinks[] = array('url' => '/', 'id' => 'about', 'title' => 'About', 'icon' => 'home');
    $headlinks[] = array('url' => '/chart/create', 'id' => 'chart', 'title' => 'Create', 'icon' => 'pencil');
    if ($user->isLoggedIn()) {
        $headlinks[] = array('url' => '/mycharts', 'id' => 'mycharts', 'title' => 'My Charts', 'icon' => 'signal');
    }
    $headlinks[] = array('url' => '', 'id' => 'lang', 'dropdown' => true, 'title' => 'Language', 'icon' => 'font');
    if ($user->isLoggedIn()) {
        $headlinks[] = array(
            'url' => '#logout',
            'id' => 'logout',
            'title' => 'Logout',
            'icon' => 'user'
        );
    } else {
        $headlinks[] = array(
            'url' => '#login',
            'id' => 'login',
            'title' => 'Login / Sign Up',
            'icon' => 'user'
        );
    }
    foreach ($headlinks as $i => $link) {
        $headlinks[$i]['active'] = $headlinks[$i]['id'] == $active;
    }
    $page['headlinks'] = $headlinks;
}

/**
 * reloads the header menu after login/logout
 */
$app->get('/xhr/header/:page', function($active) use ($app) {
    $page = array();
    add_header_vars($page, $active);
    $app->render('header.twig', $page);
});


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
    add_header_vars($page, 'about');
    $app->render('index.twig', $page);
});

$app->get('/chart/create', function() use ($app) {
    $user = DatawrapperSession::getUser();
    $chart = ChartQuery::createEmptyChart($user);
    $app->redirect('/chart/'.$chart->getId().'/upload');
});

/**
 *
 */
function error_page($step, $title, $message) {
    global $app;
    $tmpl = array(
        'title' => $title,
        'message' => $message
    );
    add_header_vars($tmpl);
    $app->render('error.twig', $tmpl);
}

function error_chart_not_found($id) {
    error_page('create',
        'Whoops! We couldn\'t find that chart..',
        'Sorry, but it seems that there is no chart with the id <b>'.$id.'</b> (anymore)'
    );
}

function error_chart_not_writable() {
    error_page('create',
        'Whoops! That charts doesn‘t belong to you',
        'Sorry, but the requested chart belongs to someone else.'
    );
}

function check_chart($id, $callback) {
    $chart = ChartQuery::create()->findPK($id);
    if ($chart) {
        $user = DatawrapperSession::getUser();
        if ($chart->isWritable($user) === true) {
            call_user_func($callback, $user, $chart);
        } else {
            // no such chart
            error_chart_not_writable();
        }
    } else {
        // no such chart
        error_chart_not_found($id);
    }
}

/*
 * UPLOAD STEP
 */
$app->get('/chart/:id/upload', function ($id) use ($app) {
    check_chart($id, function($user, $chart) use ($app) {
        $page = array(
            'chartData' => $chart->loadData(),
            'chart' => json_encode($chart->serialize())
        );
        add_header_vars($page, 'create');
        add_editor_nav($page, 1);
        $app->render('chart-upload.twig', $page);
    });
});

/*
 * DESCRIBE STEP
 */
$app->get('/chart/:id/describe', function ($id) use ($app) {
    check_chart($id, function($user, $chart) use ($app) {
        $page = array(
            'chartData' => $chart->loadData(),
            'chart' => json_encode($chart->serialize())
        );
        add_header_vars($page, 'create');
        add_editor_nav($page, 2);
        $app->render('chart-describe.twig', $page);
    });
});


/**
 * API: get data to a chart
 *
 * @param chart_id chart id
 */
$app->get('/chart/:id/data', function($chart_id) use ($app) {
    $chart = ChartQuery::create()->findPK($chart_id);
    if (!empty($chart)) {
        print $chart->loadData();
    } else {
        error_chart_not_found($chart_id);
    }
});


/**
 * Step 4: Run the Slim application
 *
 * This method should be called last. This is responsible for executing
 * the Slim application using the settings and routes defined above.
 */
$app->run();