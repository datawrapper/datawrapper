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


$plugin = new Plugin();
$plugin->setId($plugin_id);

if (file_exists($plugin->getPath())) {
    if (file_exists($plugin->getPath() . 'plugin.php')) {
        require_once $plugin->getPath() . 'plugin.php';
        $className = $plugin->getClassName();
        $pluginClass = new $className();
    } else {
        // no plugin.php
        $pluginClass = new DatawrapperPlugin($plugin->getName());
    }


    switch ($cmd) {
        case 'enable':
        case 'install':
            print "Installing " . $pluginClass->getName() . "\n";
            $pluginClass->install();
            break;
        case 'disable':
        case 'uninstall':
            print "Uninstalling " . $pluginClass->getName() . "\n";
            $pluginClass->uninstall();
            break;
    }

} else {
    print 'Warning: Plugin not found: '.$plugin_id."\n";
    exit(1);
}

