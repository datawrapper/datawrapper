<?php

/*
 * loads plugin
 */

function load_plugins() {

    $plugins = PluginQuery::create()->filterByEnabled(true)->find();
    $not_loaded_yet = array();
    foreach ($plugins as $plugin) {
        $not_loaded_yet[] = $plugin;
    }

    $loaded = array();

    function load_plugin($plugin) {
        $plugin_path = ROOT_PATH . 'plugins/' . $plugin->getName() . '/plugin.php';
        if (file_exists($plugin_path)) {
            require_once $plugin_path;
            // init plugin class
            $className = $plugin->getClassName();
            $pluginClass = new $className();
        } else {
            $pluginClass = new DatawrapperPlugin($plugin->getName());
        }
        // but before we load the libraries required by this lib
        foreach ($pluginClass->getRequiredLibraries() as $lib) {
            require_once ROOT_PATH . 'plugins/' . $plugin->getName() . '/' . $lib;
        }
        $pluginClass->init();
    }

    while (count($not_loaded_yet) > 0) {
        $try = $not_loaded_yet;
        $not_loaded_yet = array();
        while (count($try) > 0) {
            $plugin = array_shift($try);
            $id = $plugin->getId();
            $deps = $plugin->getDependencies();
            unset($deps['core']);  // ignore core dependency
            $can_load = true;
            foreach ($deps as $dep => $version) {
                if (!isset($loaded[$dep])) {  // dependency not loaded
                    $can_load = false;
                    break;
                }
            }
            if ($can_load) {
                // load plugin
                load_plugin($plugin);
                $loaded[$id] = true;
            } else {
                $not_loaded_yet[] = $plugin; // so try next time
            }
        }
    }

}
