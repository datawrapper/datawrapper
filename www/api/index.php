<?php

/**
 * Datawrapper JSON API
 *
 */

if (!defined('ROOT_PATH')) define('ROOT_PATH', '../../');
define('IS_API', true);

require_once ROOT_PATH . 'lib/bootstrap.php';

$config = $GLOBALS['dw_config'];

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

function error($code, $msg) {
    global $app;
    $app->response()->header('Content-Type', 'application/json;charset=utf-8');
    $result = array('status'=>'error');
    if (isset($code)) $result['code'] = $code;
    if (isset($msg)) $result['message'] = $msg;
    print json_encode($result);
}

function ok($data = null) {
    global $app;
    $app->response()->header('Content-Type', 'application/json;charset=utf-8');
    $result = array('status'=>'ok');
    if (isset($data)) $result['data'] = $data;
    print json_encode($result);
}

function get_user_ips() {
    $ips = array('remote_addr' => $_SERVER['REMOTE_ADDR']);
    if (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) $ips['x_forwared_for'] = $_SERVER['HTTP_X_FORWARDED_FOR'];
    if (isset($_SERVER['HTTP_CLIENT_IP'])) $ips['client_ip'] = $_SERVER['HTTP_CLIENT_IP'];
    return $ips;
}

function if_is_admin($callback) {
    $user = DatawrapperSession::getUser();
    if ($user->isAdmin()) {
        call_user_func($callback);
    } else {
        error('access-denied', 'need admin privileges.');
    }
}

$app->notFound(function() {
    error('not-found', 'Not Found');
});

$app->hook('slim.before.router', function () use ($app, $dw_config) {
    $req = $app->request();
    $headers = $req->headers();
    $origin = !empty($headers['ORIGIN']) ? $headers['ORIGIN'] : $headers['HOST'];
    $host = str_replace(['http://', 'https://'], ['', ''], $origin);
    if (isset($dw_config['cookie_domain'])) {
    $reg = "/^.*" . str_replace('.', '\.', $dw_config['cookie_domain']) . "$/";
        if (preg_match($reg, $host)) {
            $app->response()->header('Access-Control-Allow-Origin', $origin);
            $app->response()->header('Access-Control-Allow-Credentials', 'true');
        }
    }
});

$app->get('/status', function() use ($app) {
    ok();
});

require_once ROOT_PATH . 'lib/api/users.php';
require_once ROOT_PATH . 'lib/api/auth.php';
require_once ROOT_PATH . 'lib/api/charts.php';
require_once ROOT_PATH . 'lib/api/jobs.php';
require_once ROOT_PATH . 'lib/api/visualizations.php';
require_once ROOT_PATH . 'lib/api/plugins.php';
require_once ROOT_PATH . 'lib/api/organizations.php';
require_once ROOT_PATH . 'lib/api/products.php';
require_once ROOT_PATH . 'lib/api/folders.php';

/**
 * Step 4: Run the Slim application
 *
 * This method should be called last. This is responsible for executing
 * the Slim application using the settings and routes defined above.
 */
$app->run();
