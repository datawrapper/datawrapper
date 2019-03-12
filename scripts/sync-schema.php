<?php

/**
 */

define('NO_SLIM', 1);
define('ROOT_PATH', dirname(dirname(__FILE__)) . '/');
require_once ROOT_PATH . 'vendor/autoload.php';


Propel::init(ROOT_PATH . "lib/core/build/conf/datawrapper-conf.php");
require_once ROOT_PATH . 'lib/Migrations.php';

use dw\Migrations as Migrations;

// get list of scopes, start with `core`
$scopes = ['core'];

// add scope for plugins with a migrations folder
foreach (glob(ROOT_PATH . 'plugins/*/migrations') as $path) {
    $parts = explode('/', $path);
    $scopes[] = $parts[count($parts)-2];
}

// iterate over all scopes
foreach ($scopes as $scope) {
    // get current schema for scope
    Migrations::sync($scope);
}





// check if `schema` DB table exists
// if yes, get core schema version from there
// if not, assume version 001 if `chart` db table exists, 000 otherwise




