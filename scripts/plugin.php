<?php

/*
 * enables/disables a plugin
 *
 * usage:
 * php plugin.php enable|disable PLUGIN_NAME
 */

define('ROOT_PATH', '../');
define('NO_SLIM', 1);

date_default_timezone_set('Europe/Berlin');

require_once ROOT_PATH . 'lib/bootstrap.php';

$cmd = $argv[1];
$plugin_id = $argv[2];

if ($cmd == 'enable' || $cmd == 'disable') {

    $plugin = new Plugin();
    $plugin->setId($plugin_id);

    if (file_exists($plugin->getPath())) {
        print $plugin->getClassName() . "\n";
        require_once $plugin->getPath();
        $className = $plugin->getClassName();
        $plugin = new $className();
        if ($cmd == 'enable') $plugin->install();
        else $plugin->uninstall();

    } else {
        print 'Warning: Plugin not found: '.$plugin_id."\n";
        exit(1);
    }
}
