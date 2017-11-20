<?php

class DatawrapperPluginManager {

    protected static $loaded = array();
    // instances of all (real) plugin classes
    protected static $instances = array();

    /*
     * loads plugin
     */
    public static function load() {
        if (defined('NO_SESSION')) {
            $plugins = PluginQuery::create()
                ->distinct()
                ->filterByEnabled(true)
                ->filterByIsPrivate(false)
                ->find();
        } else {
            $plugins = self::getUserPlugins(DatawrapperSession::getUser()->getId());
        }
        $not_loaded_yet = array();

        foreach ($plugins as $plugin) {
            if (!isset(self::$loaded[$plugin->getId()])) {
                $not_loaded_yet[] = $plugin;
            }
        }

        $could_not_install = array();
        $init_queue = array();

        $load_plugin = function ($plugin) use (&$init_queue) {
            $plugin_path = ROOT_PATH . 'plugins/' . $plugin->getName();;
            // first if this plugin uses composer, require the autoloader
            if (file_exists($plugin_path . '/vendor/autoload.php')) {
                require_once $plugin_path . '/vendor/autoload.php';
            }
            if (file_exists($plugin_path . '/plugin.php')) {
                require_once $plugin_path . '/plugin.php';
                // init plugin class
                $className = $plugin->getClassName();
                $pluginClass = new $className();
            } else {
                $pluginClass = new DatawrapperPlugin($plugin->getName());
                if (file_exists($plugin_path . '/init.php')) {
                    $pluginClass->injectInitFunction(function($plugin) use ($plugin_path) {
                        include_once($plugin_path . '/init.php');
                    });
                }
            }
            // then, lets also load the libraries required by this lib
            // this is DEPRECATED, all new plugins should use the autoload
            // method using composer or similar
            foreach ($pluginClass->getRequiredLibraries() as $lib) {
                require_once $plugin_path . '/' . $lib;
            }
            $init_queue[] = $pluginClass;
            return $pluginClass;
        };
        $retries = 0;

        while (count($not_loaded_yet) && $retries < 100) {
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
                        $retries++;
                    }
                }
            }
        }
        // now initialize all plugins
        while (count($init_queue) > 0) {
            $pluginClass = array_shift($init_queue);
            $pluginClass->init();
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

    public static function getUserPlugins($user_id, $include_public=true) {
        $plugins = PluginQuery::create()
                ->filterByEnabled(true);

        if ($include_public) $plugins->filterByIsPrivate(false)->_or();

        if (!empty($user_id)) {
            // try to load user row from user_plugins_cache first
            $cached = UserPluginCacheQuery::create()->findPk($user_id);
            $plugin_ids = [];
            if ($cached) {
                $plugin_ids = explode(',', $cached->getPlugins());
            } else {
                $tmp = PluginQuery::create()
                    ->distinct()
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
                                '(
                                    product.deleted = false AND 
                                        ((user_product.user_id = ? AND (user_product.expires >= NOW() OR user_product.expires IS NULL))
                                            OR
                                        (user_organization.user_id= ? AND user_organization.invite_token = "" AND (organization_product.expires >= NOW() OR organization_product.expires IS NULL))))',
                                array($user_id, $user_id)
                            )
                        ->endUse()
                    ->endUse()
                    ->find();
                foreach ($tmp as $p) {
                    $plugin_ids[] = $p->getId();
                }
                // save user plugins to cache
                $c = new UserPluginCache();
                $c->setUserId($user_id);
                $c->setPlugins(implode(',', $plugin_ids));
                $c->save();
            }
            $plugins->filterById($plugin_ids);
        }
        return $plugins->find();
    }

    public static function listPlugins() {
        $plugins = array();
        foreach (self::$loaded as $id => $loaded) {
            if ($loaded) $plugins[] = array('id' => $id);
        }
        return $plugins;
    }

}

