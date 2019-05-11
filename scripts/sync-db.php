<?php

/**
 * updates the DB schema to the latest version
 */

define('NO_SLIM', 1);
define('ROOT_PATH', dirname(dirname(__FILE__)) . '/');
require_once ROOT_PATH . 'vendor/autoload.php';

Propel::init(ROOT_PATH . "lib/core/build/conf/datawrapper-conf.php");
require_once ROOT_PATH . 'lib/Migrations.php';

// load YAML parser and config
$GLOBALS['dw_config'] = $dw_config = parse_config(Spyc::YAMLLoad(file_exists(ROOT_PATH . 'config.yaml') ? ROOT_PATH . 'config.yaml' : '/etc/datawrapper/config.yaml'));

use dw\Migrations as Migrations;

try {
	// try db connection before moving on
	Migrations::getSchemaVersion('core');
} catch (Exception $e) {
	print "\n\033[0;30m  Error: ";
	print $e->getMessage();
	print "\n\n  \033[1;33mCould not connect to database\033[m\n";
	print "  (you should probably run this inside the docker container)\n\n";
	exit(-1);
}

// get list of scopes, start with `core`
$scopes = ['core'];

// add scope for plugins with a migrations folder
foreach (glob(get_plugin_path() . '*/migrations') as $path) {
    $parts = explode('/', $path);
    $scopes[] = $parts[count($parts)-2];
}

// iterate over all scopes
foreach ($scopes as $scope) {
    Migrations::sync($scope);
}

print "done.\n";
