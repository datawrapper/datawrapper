<?php

/**
 * blocks until we can use Propel
 */

define('ROOT_PATH', dirname(dirname(__FILE__)) . '/');
require_once ROOT_PATH . 'vendor/autoload.php';

Propel::init(ROOT_PATH . "lib/core/build/conf/datawrapper-conf.php");

do {
    $connected = true;

    try {
        $pdo = Propel::getConnection();
    } catch(Exception $e) {
        $connected = false;
        print $e->getMessage()."\n";
        print "Sleeping another second to wait for DB.\n";
        sleep(1);
    }

} while (!$connected);

print "DB is up!.\n";
