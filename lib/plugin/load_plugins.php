<?php

/*
 * loads plugin
 */

function load_plugins() {

    // build plugin dependency tree
    $data = array();
    $index = array();
    $roots = array();

    // load plugins
    $plugins = PluginQuery::create()->filterByEnabled(true)->find();
    foreach ($plugins as $plugin) {
        $id = $plugin->getId();
        $data[$id] = $plugin;
        $deps = $plugin->getDependencies();
        if (!empty($deps)) {
            foreach ($deps as $parent_id => $parent_version) {
                $index[$parent_id][] = $id;
            }
        } else {
            $roots[] = $id;
        }
    }

    function load_child_plugins($data, $index, $parent_id, $level) {
        $parent_id = $parent_id === NULL ? "NULL" : $parent_id;
        // load this plugin
        $plugin = $data[$parent_id];
        // require plugin class
        $plugin_path = ROOT_PATH . 'plugins/' . $plugin->getName() . '/plugin.php';
        if (file_exists($plugin_path)) {
            require_once $plugin_path;
            // init plugin class
            $className = $plugin->getClassName();
            $pluginClass = new $className();
        } else {
            $pluginClass = new DatawrapperPlugin($plugin->getName());
        }
        // but before we load the required libraries
        foreach ($pluginClass->getRequiredLibraries() as $lib) {
            require_once ROOT_PATH . 'plugins/' . $plugin->getName() . '/' . $lib;
        }
        $pluginClass->init();

        if (isset($index[$parent_id])) {
            foreach ($index[$parent_id] as $id) {
                load_child_plugins($data, $index, $id, $level + 1);
            }
        }
    }

    foreach ($roots as $id) {
        load_child_plugins($data, $index, $id, 0);
    }
}
