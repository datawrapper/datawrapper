<?php

/*
 * Generic hook script
 */

define('ROOT_PATH', dirname(dirname(__FILE__)) . '/');
define('NO_SLIM', 1);
define('NO_SESSION', 1);

require_once ROOT_PATH . 'lib/bootstrap.php';
date_default_timezone_set('Europe/Berlin');


$hook = $argv[1];

if (!empty($hook)) {
    DatawrapperHooks::execute($argv[1]);
}

