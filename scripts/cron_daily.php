<?php

/*
 * Daily cron job
 */


define('ROOT_PATH', '../');
define('NO_SLIM', 1);

require_once ROOT_PATH . 'lib/bootstrap.php';
date_default_timezone_set('Europe/Berlin');


DatawrapperHooks::execute(DatawrapperHooks::CRON_DAILY);
