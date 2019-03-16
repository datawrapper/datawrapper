<?php

/*
 * bootstrap.php
 */

// if not done yet, include the autoloader
require_once ROOT_PATH . 'vendor/autoload.php';

// store flag if we're running from command-line
define('CLI', php_sapi_name() == "cli");

// load YAML parser and config
$GLOBALS['dw_config'] = $dw_config = parse_config(Spyc::YAMLLoad(ROOT_PATH . 'config.yaml'));


if (isset($dw_config['debug']) && $dw_config['debug'] == true) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
}

if (isset($dw_config['automake']) && $dw_config['automake'] == true && !defined('NO_SESSION')) {
    @exec('cd '.ROOT_PATH.'; make');
    // make plugin assets, too
    foreach (glob(ROOT_PATH . 'plugins/*/Makefile') as $filename) {
        @exec('cd '.dirname($filename).'; make assets;');
    }
}

if (!isset($dw_config['static_path'])) $dw_config['static_path'] = '/static';

// Include the main Propel script
// Initialize Propel with the runtime configuration
// Add the generated 'classes' directory to the include path
Propel::init(ROOT_PATH . "lib/core/build/conf/datawrapper-conf.php");

// this salt is used to hash the passwords in database
if (!isset($dw_config['auth_salt'])) $dw_config['auth_salt'] = 'uRPAqgUJqNuBdW62bmq3CLszRFkvq4RW';
define('DW_AUTH_SALT', $dw_config['auth_salt']);

/*
 * secure passwords with secure_auth_key, if configured
 */
function secure_password($pwd) {
    global $dw_config;
    if (isset($dw_config['secure_auth_key'])) {
        return hash_hmac('sha256', $pwd, $dw_config['secure_auth_key']);
    } else {
        return $pwd;
    }
}

function get_current_protocol() {
    global $dw_config;

    if (isset($dw_config['protocol'])) return $dw_config['protocol'];

    $ssl = isset($_SERVER['HTTPS']) ? $_SERVER['HTTPS'] : null;
    $ssl = $ssl == 1 || strtolower($ssl) === 'on';

    return $ssl ? 'https' : 'http';
}

// fallback for getallheaders()
if (!function_exists('getallheaders'))  {
    function getallheaders() {
        if (!is_array($_SERVER)) return array();
        $headers = array();
        foreach ($_SERVER as $name => $value) {
            if (substr($name, 0, 5) == 'HTTP_') {
                $headers[str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))))] = $value;
            }
        }
        return $headers;
    }
}

if (!defined('NO_SESSION')) {
    // forcing require of database session handler
    require_once ROOT_PATH . 'lib/session/database.php';
    DatawrapperSession::initSession();

    if (!empty($dw_config['no_gzip']) && $dw_config['no_gzip']) {
        ob_start();
    } else {
        ob_start("ob_gzhandler");
    }
}

function debug_log($txt) {
    $h = fopen(ROOT_PATH . 'log.txt', 'a+');
    fwrite($h, microtime(true).': '.$txt."\n");
    fclose($h);
}

// init l10n
$locale = str_replace('-', '_', DatawrapperSession::getLanguage());
$domain = 'messages';
putenv('LANGUAGE=' . $locale);
setlocale(LC_ALL, $locale);
setlocale(LC_TIME, $locale.'.utf8');

$__l10n = new Datawrapper_L10N();
$__l10n->loadMessages($locale);

if (!defined('NO_SLIM')) {
    // Initialize Slim app..
    if (!defined('IS_API')) {
        // ..either with TwigView for Datawrapper UI,...
        TwigView::$twigDirectory = ROOT_PATH . 'vendor/Twig';

        $app = new Slim(array(
            'view' => new TwigView(),
            'templates.path' => ROOT_PATH . 'templates',
            'session.handler' => null
        ));
    } else {
        // ..or with JSONView for API.
        $app = new Slim(array( 'view' => 'JSONView' ));

        $appTwig = new Slim(array(
            'view' => new TwigView(),
            'templates.path' => ROOT_PATH . 'templates',
            'session.handler' => null
        ));
    }
} else {
    // called from command line, e.g. via scripts/hook.php
    require_once ROOT_PATH . 'lib/maintenance.php';
}

if (isset($dw_config['memcache'])) {
    $memcfg = $dw_config['memcache'];
    $memcache = new Memcache();
    $memcache->connect($memcfg['host'], $memcfg['port']) or die ("Could not connect");
}

if (isset($dw_config['charts-s3'])) {
    if (isset($dw_config['charts-s3']['region'])) {
        $region = $dw_config['charts-s3']['region'];
    } else {
        $region = 'eu-central-1';
    }

    $charts_s3 = new Aws\S3\S3Client([
        'region' => $region,
        'version' => 'latest',
        'credentials' => [
            'key' => $dw_config['charts-s3']['aws-access-key-id'],
            'secret' => $dw_config['charts-s3']['aws-secret-access-key']
        ]
    ]);

    $charts_s3->registerStreamWrapper();
}

if (!defined('NO_PLUGINS')) {
    UserPluginCacheQuery::initInvalidateHooks();
    DatawrapperPluginManager::load();

    // notify the core that all plugins are loaded
    DatawrapperHooks::execute(DatawrapperHooks::ALL_PLUGINS_LOADED);
}

