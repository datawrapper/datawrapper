<?php

/*
 * Generic hook script
 */

define('ROOT_PATH', dirname(dirname(__FILE__)) . '/');
define('NO_SLIM', 1);
define('NO_SESSION', 1);

define('DATAWRAPPER_VERSION', json_decode(file_get_contents(ROOT_PATH . 'package.json'), true)['version']);

require_once ROOT_PATH . 'lib/bootstrap.php';
date_default_timezone_set('Europe/Berlin');

$hook = $argv[1];

if (!empty($hook)) {
    if (DatawrapperHooks::hookRegistered($hook)) {
        DatawrapperHooks::execute($hook,
            isset($argv[2]) ? $argv[2] : null,
            isset($argv[3]) ? $argv[3] : null,
            isset($argv[4]) ? $argv[4] : null);
    } else {
        print "no callback registered under the name ".$hook."\n";
    }
}

