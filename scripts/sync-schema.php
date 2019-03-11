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

function dbFetchColumn($sql) {
    $res = dbQuery($sql);
    return $res->fetchAll(PDO::FETCH_COLUMN, 0);
}

function dbFetchOne($sql) {
    $res = dbQuery($sql);
    return $res->fetchColumn(0);
}

$tables = dbFetchColumn('SHOW TABLES');

// get list of scopes, start with `core`
$scopes = ['core'];

// add scope for plugins with a migrations folder
foreach (glob(ROOT_PATH . 'plugins/*/migrations') as $path) {
    $parts = explode('/', $path);
    $scopes[] = $parts[count($parts)-2];
}

$migrations = [];

// iterate over all scopes
foreach ($scopes as $scope) {
    // get current schema for scope
    $version = getSchemaVersion($scope);
    $migrations[$scope] = getMigrations($scope);
    print "$scope is on version $version\n";
    print_r(($migrations[$scope]));
}

/**
 * returns a list of all db migrations for a given `scope`
 */
function getMigrations($scope) {
    $path = $scope === 'core' ? 'migrations/*.sql' : 'plugins/'.$scope.'/migrations/*.sql';
    $result = [];
    foreach (glob(ROOT_PATH . $path) as $sql) {
        $file = basename($sql);
        $parts = explode('-', $file);
        $result[] = [
            'version' => intval(array_shift($parts)),
            'key' => implode('-', $parts),
            'content' => parseMigrationSQL(file_get_contents($sql))
        ];
    }
    return $result;
}

/**
 * splits a migration sql file into `adds`, `up` and `down`
 *
 * example migration.sql:
 * -- Adds chart.utf8
 * -- Up
 * ALTER TABLE chart ADD COLUMN utf8 INT;
 * -- Down
 * ALTER TABLE chart DROP COLUMN utf8;
 */
function parseMigrationSQL($sql) {
    $lines = explode("\n", $sql);
    $up = [];
    $down = [];
    $adds = [];
    $mode = '';
    foreach ($lines as $line) {
        if (substr($line, 0, 2) === '--') {
            if (trim(strtolower(substr($line, 2))) === 'up') $mode = 'up';
            if (trim(strtolower(substr($line, 2))) === 'down') $mode = 'down';
            if (trim(strtolower(substr($line, 2, 5))) === 'adds') {
                $mode = '';
                $adds = array_map(trim, explode(',', trim(strtolower(substr($line, 7)))));
            }
        } else {
            if ($mode === 'up') $up[] = $line;
            if ($mode === 'down') $down[] = $line;
        }
    }
    return [
        'adds' => $adds,
        'up' => implode("\n", $up),
        'down' => implode("\n", $down),
    ];
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
        return dbFetchOne('SELECT version FROM schema WHERE scope = "'.$scope.'"') ?? 0;
    }
    if ($scope === "core") {
        // check if chart table exists

    }
    return 0;
}