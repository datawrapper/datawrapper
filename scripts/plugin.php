<?php

/*
 * enables/disables a plugin
 *
 * usage:
 * php plugin.php enable|disable PLUGIN_NAME
 */


define('ROOT_PATH', dirname(dirname(__FILE__)) . '/');

define('NO_SLIM', 1);

date_default_timezone_set('Europe/Berlin');

require_once ROOT_PATH . 'lib/bootstrap.php';

$cmd = $argv[1];
$pattern = $argv[2];

$plugin_ids = array();

if (strpos($pattern, '*') > -1) {
    foreach (glob(ROOT_PATH . "plugins/" . $pattern . "/package.json") as $filename) {
        $d = dirname($filename);
        $d = substr($d, strrpos($d, DIRECTORY_SEPARATOR)+1);
        $plugin_ids[] = $d;
    }
} else {
    $plugin_ids[] = $pattern;
}

if (empty($plugin_ids)) {
    print "No matching plugin found.\n";
    exit(1);
}

foreach ($plugin_ids as $plugin_id) {
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
        if ($cmd == 'uninstall' || $cmd == 'disable') {
            $pluPluginQuery::create()->filterById($plugin_id)->findOne();
            i
        }
        print 'Warning: Plugin not found: '.$plugin_id."\n";
        exit(1);
    }
}
