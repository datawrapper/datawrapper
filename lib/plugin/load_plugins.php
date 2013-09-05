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
        unset($deps['core']);  // ignore core dependency
        if (!empty($deps)) {
            foreach ($deps as $parent_id => $parent_version) {
                $index[$parent_id][] = $id;
            }
        } else {
            $roots[] = $id;
        }
    }

    $installed = array();

    function load_child_plugins($data, $index, $parent_id, $level, $recursive=false) {
        $parent_id = $parent_id === NULL ? "NULL" : $parent_id;
        global $installed;
        if (!isset($installed[$parent_id])) {
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
            $installed[$parent_id] = true;
            // but before we load the libraries required by this lib
            foreach ($pluginClass->getRequiredLibraries() as $lib) {
                require_once ROOT_PATH . 'plugins/' . $plugin->getName() . '/' . $lib;
            }
            $pluginClass->init();
        }
        // now we can proceed loading plugins that
        if ($recursive && isset($index[$parent_id])) {
            foreach ($index[$parent_id] as $id) {
                load_child_plugins($data, $index, $id, $level + 1, $recursive);
            }
        }
    }

    // first load all root plugins
    foreach ($roots as $id) {
        load_child_plugins($data, $index, $id, 0);
    }
    // then load plugins that depend on root plugins
    foreach ($roots as $id) {
        if (isset($index[$id])) {
            foreach ($index[$parent_id] as $id) {
                load_child_plugins($data, $index, $id, 1, true);
            }
        }
    }
}
