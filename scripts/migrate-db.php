<?php

/**
 */

define('ROOT_PATH', dirname(dirname(__FILE__)) . '/');

Propel::init(ROOT_PATH . "lib/core/build/conf/datawrapper-conf.php");

function query($sql) {
    try {
        $pdo = Propel::getConnection();
        return $pdo->query($sql);
    } catch(PDOException $exception){
        print $exception->getMessage();
    } catch (Exception $e) {
        print $e->getMessage();
    }
}

// migrate db schema

// find current core schema version
// check if `schema` DB table exists
// if yes, get core schema version from there
// if not, assume version 001 if `chart` db table exists, 000 otherwise

function migrateToLatest($scope, $fromVersion) {
    // check if newer migration scripts exist in migrations/

}
