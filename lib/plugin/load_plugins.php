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
        $plugin_root = get_plugin_path();

        $load_plugin = function ($plugin) use (&$init_queue, $plugin_root) {
            $plugin_path = $plugin_root . $plugin->getName();

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
                            if (!file_exists(get_plugin_path() . $dep) || isset($could_not_install[$dep])) {
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
                $pdo = Propel::getConnection();
                $sql = "SELECT DISTINCT plugin_id FROM (
                        SELECT product_id FROM (
                            -- user products
                            SELECT product_id FROM user_product WHERE user_id = $user_id
                            UNION DISTINCT
                            -- team products
                            SELECT product_id FROM
                                (SELECT organization_id FROM user_organization WHERE user_id = $user_id AND invite_token = '') C
                                LEFT JOIN organization_product op ON (C.organization_id = op.organization_id)
                                WHERE product_id IS NOT NULL
                        ) B
                        LEFT JOIN product p ON (B.product_id = p.id)
                        WHERE p.deleted = 0
                    ) A
                    LEFT JOIN product_plugin pp ON (A.product_id = pp.product_id)
                    WHERE plugin_id IS NOT NULL;";
                $res = $pdo->query($sql);
                foreach ($res as $row) {
                    if (!empty($row)) $plugin_ids[] = $row[0];
                }
                // save user plugins to cache
                $pluginList = $pdo->quote(implode(',', $plugin_ids));
                $pdo->query('INSERT INTO user_plugin_cache (user_id, plugins) VALUES ('.intval($user_id).', '.$pluginList.') ON DUPLICATE KEY UPDATE plugins = '.$pluginList);
            }
            $plugins->filterById($plugin_ids);
        }

        $uri = $_SERVER['REQUEST_URI'] ?? "";
        if (preg_match('@chart/([a-zA-Z0-9]{5})/token/(.*)@', $uri, $matches)) {
            $plugins->_or()
                ->where("Plugin.id LIKE 'd3-basemap-%'");
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

