<?php

/*
 * bootstrap.php
 */

// if not done yet, include the autoloader
require_once ROOT_PATH . 'vendor/autoload.php';

// load YAML parser and config
$GLOBALS['dw_config'] = $dw_config = Spyc::YAMLLoad(ROOT_PATH . 'config.yaml');

if ($dw_config['debug'] == true) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
}

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

if (!defined('NO_SESSION')) {
    DatawrapperSession::initSession();
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

parse_config();

if (!defined('NO_SLIM')) {
    // Initialize Slim app..
    if (ROOT_PATH == '../') {
        // ..either with TwigView for Datawrapper UI,...
        TwigView::$twigDirectory = ROOT_PATH . 'vendor/Twig';

        $app = new Slim(array(
            'view' => new TwigView(),
            'templates.path' => '../templates',
            'session.handler' => null
        ));
    } else {
        // ..or with JSONView for API.
        $app = new Slim(array( 'view' => 'JSONView' ));
    }
}

if (isset($dw_config['memcache'])) {
    $memcfg = $dw_config['memcache'];
    $memcache = new Memcache();
    $memcache->connect($memcfg['host'], $memcfg['port']) or die ("Could not connect");
}

DatawrapperPluginManager::load();
