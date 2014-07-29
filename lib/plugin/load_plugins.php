<?php

class DatawrapperPluginManager {

    protected static $loaded = array();
    // instances of all (real) plugin classes
    protected static $instances = array();

    /*
     * loads plugin
     */
    public static function load() {
        $plugins = PluginQuery::create();

        $plugins->distinct()
            ->filterByEnabled(true);

        if (!defined('NO_SESSION')) {
            $plugins->filterByIsPrivate(false);

            $user_id = DatawrapperSession::getUser()->getId();

            if (!empty($user_id)) {
                $plugins
                    ->_or()
                    ->useProductPluginQuery(null, Criteria::LEFT_JOIN)
                        ->useProductQuery(null, Criteria::LEFT_JOIN)
                            ->useOrganizationProductQuery(null, Criteria::LEFT_JOIN)
                                ->useOrganizationQuery(null, Criteria::LEFT_JOIN)
                                    ->useUserOrganizationQuery(null, Criteria::LEFT_JOIN)
                                    ->endUse()
                                ->endUse()
                            ->endUse()
                            ->useUserProductQuery(null, Criteria::LEFT_JOIN)
                            ->endUse()
                            ->where(
                                '((product.deleted=? AND user_product.user_id=? AND user_product.expires >= NOW())
                                OR (product.deleted=? AND user_organization.user_id=? AND organization_product.expires >= NOW()))',
                                array(false, $user_id, false, $user_id)
                            )
                        ->endUse()
                    ->endUse();
            }
        }
        $plugins = $plugins->find();
        $not_loaded_yet = array();

        foreach ($plugins as $plugin) {
            if (!isset(self::$loaded[$plugin->getId()])) {
                $not_loaded_yet[] = $plugin;
            }
        }

        $could_not_install = array();

        $load_plugin = function ($plugin) {
            $plugin_path = ROOT_PATH . 'plugins/' . $plugin->getName() . '/plugin.php';
            if (file_exists($plugin_path)) {
                require $plugin_path;
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
            return $pluginClass;
        };
        while (count($not_loaded_yet) > 0) {
            $try = $not_loaded_yet;
            $not_loaded_yet = array();
            while (count($try) > 0) {
                $plugin = array_shift($try);
                $id = $plugin->getId();
                $deps = $plugin->getDependencies();
                unset($deps['core']);  // ignore core dependency
                $can_load = true;
                if (is_array($deps)) {
                    foreach ($deps as $dep => $version) {
                        if (!isset(self::$loaded[$dep])) {  // dependency not loaded
                            $can_load = false;
                            if (!file_exists(ROOT_PATH . 'plugins/' . $dep) || isset($could_not_install[$dep])) {
                                // dependency does not exists, not good
                                $could_not_install[$id] = true;
                            }
                            break;
                        }
                    }
                }
                if (isset(self::$loaded[$id]) && self::$loaded[$id]) {
                    // plugin already loaded by now
                    continue;
                }
                if ($can_load) {
                    // load plugin
                    self::$loaded[$id] = true;
                    self::$instances[$id] = $load_plugin($plugin);
                } else {
                    if (!isset($could_not_install[$id])) {
                        $not_loaded_yet[] = $plugin; // so try next time
                    }
                }
            }
        }

    }

    public static function loaded($plugin_id) {
        return isset(self::$loaded[$plugin_id]) && self::$loaded[$plugin_id];
    }

    public static function getInstance($plugin_id) {
        if (isset(self::$instances[$plugin_id])) {
            return self::$instances[$plugin_id];
        }
        return null;
    }

}

