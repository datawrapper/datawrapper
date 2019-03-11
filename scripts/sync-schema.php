<?php

/**
 */

define('ROOT_PATH', dirname(dirname(__FILE__)) . '/');
require_once ROOT_PATH . 'vendor/autoload.php';

Propel::init(ROOT_PATH . "lib/core/build/conf/datawrapper-conf.php");

function dbQuery($sql) {
    try {
        $pdo = Propel::getConnection();
        return $pdo->query($sql);
    } catch(PDOException $exception){
        print $exception->getMessage();
    } catch (Exception $e) {
        print $e->getMessage();
    }
}
function dbGetOne($sql) {
	$res = dbQuery($sql);
	$row = next($res);
	return $row[0];
}

$tables = [];
foreach (dbQuery('SHOW TABLES') as $table) {
	$tables[] = $table[0];
}

// migrate db schema

// find current core schema version
$scopes = ['core'];

foreach ($scopes as $scope) {
	$version = getSchemaVersion($scope);
	print "$scope is on version $version\n";
}

// check if `schema` DB table exists
// if yes, get core schema version from there
// if not, assume version 001 if `chart` db table exists, 000 otherwise

function migrateToLatest($scope, $fromVersion) {
    // check if newer migration scripts exist in migrations/

}

function getSchemaVersion($scope) {
	global $tables;
	if (in_array('schema', $tables)) {
		return dbGetOne('SELECT version FROM schema WHERE scope = "'.$scope.'"') ?? 0;
	}
	if ($scope === "core") {
		// check if chart table exists

	}
	return 1;
}