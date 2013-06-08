<?php

/*
 * enables/disables a plugin
 *
 * usage:
 * php plugin.php enable|disable PLUGIN_NAME
 */

define('ROOT_PATH', '../');
define('NO_SLIM', 1);

require_once ROOT_PATH . 'lib/bootstrap.php';

$cmd = $argv[1];
$plugin_id = $argv[2];

if ($cmd == 'enable' || $cmd == 'disable') {
    $plugin_path = ROOT_PATH . 'plugins/' . $plugin_id . '/plugin.php';
    if (file_exists($plugin_path)) {

        require_once $plugin_path;
        $className = 'DatawrapperPlugin_' . str_replace(ucwords(str_replace($plugin_id, '-', ' ')), ' ', '');
        $plugin = new $className();
        if ($cmd == 'enable') $plugin->install();
        else $plugin->uninstall();

    } else {
        print 'Warning: Plugin not found: '.$plugin_id."\n";
        exit(1);
    }
}
