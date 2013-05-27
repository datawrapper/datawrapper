<?php

/*
 * bootstrap.php
 */

// load YAML parser and config
require_once ROOT_PATH . 'vendor/spyc/spyc.php';
$GLOBALS['dw_config'] = $dw_config = Spyc::YAMLLoad(ROOT_PATH . 'config.yaml');

if ($dw_config['debug'] == true) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
}


if (!defined('NO_SLIM')) {
    // Require the Slim PHP 5 Framework
    require ROOT_PATH . 'vendor/Slim/Slim.php';
}

// Include the main Propel script
// Initialize Propel with the runtime configuration
// Add the generated 'classes' directory to the include path
require_once ROOT_PATH . 'vendor/propel/runtime/lib/Propel.php';
Propel::init(ROOT_PATH . "lib/core/build/conf/datawrapper-conf.php");
set_include_path(ROOT_PATH . "lib/core/build/classes" . PATH_SEPARATOR . get_include_path());

// this salt is used to hash the passwords in database
if (!isset($dw_config['auth_salt'])) $dw_config['auth_salt'] = 'uRPAqgUJqNuBdW62bmq3CLszRFkvq4RW';
define('DW_AUTH_SALT', $dw_config['auth_salt']);

if (!defined('NO_SLIM')) {
    // Initialize Slim app..
    if (ROOT_PATH == '../') {
        // ..either with TwigView for Datawrapper UI,...
        require_once ROOT_PATH . 'vendor/Slim-Extras/Views/TwigView.php';
        TwigView::$twigDirectory = ROOT_PATH . 'vendor/Twig';

        $app = new Slim(array(
            'view' => new TwigView(),
            'templates.path' => '../templates',
            'session.handler' => null
        ));
    } else {
        // ..or with JSONView for API.
        require ROOT_PATH . 'lib/api/views/JSONView.php';
        $app = new Slim(array( 'view' => 'JSONView' ));
    }
}


require ROOT_PATH . 'lib/session/database.php';
require ROOT_PATH . 'lib/session/Datawrapper.php';
