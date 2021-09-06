<?php

/**
 * Datawrapper JSON API
 *
 */

if (!defined('ROOT_PATH')) define('ROOT_PATH', '../../');
define('IS_API', true);

// get domain
// $h = getallheaders();
// define('APP_DOMAIN', $h['App-Domain'] ?? 'app');
define('APP_DOMAIN', 'app');

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

function check_scopes($scopes) {
    foreach ($scopes as $scope) {
        if (!Session::hasScope($scope)) {
            global $app;
            $app->response()->status(403);
            error('access-denied', 'Insufficient scope');
            return false;
        }
    }
    return true;
}

function if_is_admin($callback, $elseCallback=null) {
    $user = DatawrapperSession::getUser();
    if ($user->isAdmin()) {
        call_user_func($callback);
    } else {
        if (is_callable($elseCallback)) {
            call_user_func($elseCallback);
        } else {
            error('access-denied', 'need admin privileges.');
        }
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
    $app->response()->header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, DELETE');
    $app->response()->header('Access-Control-Allow-Headers', 'Content-Type, X-Auth-Token, Origin, Authorization');

    $allow = false;

    if (isset($dw_config['cookie_domain'])) {
        $reg = "/^.*" . str_replace('.', '\.', $dw_config['cookie_domain']) . "$/";
        if (preg_match($reg, $host)) $allow = true;
    }

    if (isset($dw_config['allowed_origin'])) {
        if ($dw_config['allowed_origin'] == "*") {
            $origin = empty($origin) ? '*' : $origin;
            $app->response()->header('Access-Control-Allow-Origin', $origin);
            $app->response()->header('Access-Control-Allow-Credentials', 'true');

            if ($req->getMethod() == "OPTIONS") {
                // The client-side application can set only headers allowed in Access-Control-Allow-Headers
                $app->response()->status(200);
                header('Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE');
                header('Access-Control-Allow-Headers: Content-Type, X-Auth-Token, Origin, Authorization');
                header('Access-Control-Allow-Origin: '.$origin);
                header('Access-Control-Allow-Credentials: true');
                die();
            }

            return;
        }

        $allowReg = "/^.*" . str_replace('.', '\.', $dw_config['allowed_origin']) . "$/";
        if (preg_match($allowReg, $host)) $allow = true;
    }

    if ($allow) {
        $app->response()->header('Access-Control-Allow-Origin', $origin);
        $app->response()->header('Access-Control-Allow-Credentials', 'true');

        if ($req->getMethod() == "OPTIONS") {
            // The client-side application can set only headers allowed in Access-Control-Allow-Headers
            $app->response()->status(200);
            header('Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE');
            header('Access-Control-Allow-Headers: Content-Type, X-Auth-Token, Origin, Authorization');
            header('Access-Control-Allow-Origin: '. $origin);
            header('Access-Control-Allow-Credentials: true');
            die();
        }
    }
});

$app->get('/status', function() use ($app) {
    ok();
});

$app->get('/status-v3', function() use ($app) {
    $res = call_v3_api('HEAD', '/');

    $app->response()->status($res[0]);

    if ($res[0] === 200) {
        ok($res[1]);
    } else {
        error('api-unreachable', 'The V3 API is unreachable.');
    }
});

require_once ROOT_PATH . 'lib/api/users.php';
require_once ROOT_PATH . 'lib/api/charts.php';
require_once ROOT_PATH . 'lib/api/plugins.php';
require_once ROOT_PATH . 'lib/api/teams.php';
require_once ROOT_PATH . 'lib/api/products.php';
require_once ROOT_PATH . 'lib/api/folders.php';
require_once ROOT_PATH . 'lib/api/themes.php';

/**
 * Step 4: Run the Slim application
 *
 * This method should be called last. This is responsible for executing
 * the Slim application using the settings and routes defined above.
 */
$app->run();
