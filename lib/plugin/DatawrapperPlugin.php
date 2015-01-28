<?php

class DatawrapperPlugin {

    private $__name;
    private $__packageJson;
    private $__initFunc;

    function __construct($name = null) {
        if (isset($name)) $this->__name = $name;
    }

    /** register events */
    public function init() {
        // if available, call injected init function
        if (is_callable($this->__initFunc)) {
            call_user_func_array($this->__initFunc, array($this));
        }
        return true;
    }

    /**
    * Enable the plugin,
    * Check if there is a static folder,
    * Copy the content to www/static/plugins/<plugin_name>/
    */
    public function install() {
        $plugin = PluginQuery::create()->findPK($this->getName());
        if (empty($plugin)) {
            $plugin = new Plugin();
            $plugin->setId($this->getName());
        }
        $plugin->setEnabled(true);
        $plugin->setInstalledAt(time());
        $plugin->save();

        $this->copyStaticFiles();
        $this->copyTemplates();
    }

    /*
     * copys all files from a plugins "static" directory to
     * the publicly visible /www/static/plugins/%PLUGIN%/
     */
    private function copyStaticFiles() {
        // check if there's a /static in plugin directory
        $source_path = realpath(ROOT_PATH . 'plugins/') . '/' . $this->getName() . '/static';
        if (!file_exists($source_path)) return;

        // create directory in www/static/plugins/ if not exists
        $plugin_static_path = realpath(ROOT_PATH . 'www/static/plugins/') . '/' . $this->getName();

        // try sym-linking first
        if (is_link($plugin_static_path)) return;

        if (!file_exists($plugin_static_path)) {
            exec('ln -s '.$source_path.' '.$plugin_static_path);
            if (is_link($plugin_static_path)) return;

            mkdir($plugin_static_path);
        }
        // copy static files to that directory
        copy_recursively($source_path, $plugin_static_path);
    }

    /*
     * copys all plugin templates to /templates/plugin/%PLUGIN%/
     */
    private function copyTemplates() {
        // check if there's a /templates in plugin directory
        $source_path = realpath(ROOT_PATH . 'plugins/') . '/' . $this->getName() . '/templates';
        if (!file_exists($source_path)) return;

        // create directory in /templates/plugins/ if not exists
        $plugin_template_path = realpath(ROOT_PATH . 'templates/plugins/') . '/' . $this->getName();

        // try sym-linking first
        if (is_link($plugin_template_path)) return;

        if (!file_exists($plugin_template_path)) {
            exec('ln -s '.$source_path.' '.$plugin_template_path);
            if (is_link($plugin_template_path)) return;

            mkdir($plugin_template_path);
        }
        copy_recursively($source_path, $plugin_template_path);
    }

    private function getPluginOM() {
        return PluginQuery::create()->findPK($this->getName());
    }

    /**
    * Disable the plugin
    */
    public function uninstall() {
        $plugin = $this->getPluginOM();
        if ($plugin) {
            $plugin->delete();
            // TODO:
            // $this->removeStaticFiles();
            // $this->removeTemplates();
        }
    }

    public function disable() {
        $plugin = PluginQuery::create()->findPK($this->getName());
        if ($plugin) {
            $plugin->setEnabled(false);
            $plugin->save();
        }
    }

    /*
     * loads and caches the plugins package.json
     */
    private function getPackageJSON() {
        if (!empty($this->__packageJson)) return $this->__packageJson;
        $meta = json_decode(file_get_contents(ROOT_PATH . 'plugins/' . $this->getName() . '/package.json'),true);
        $this->__packageJson = $meta;
        return $meta;
    }

    /*
     * returns the version of the plugin
     */
    public function getVersion() {
        $meta = $this->getPackageJSON();
        return $meta['version'];
    }

    /*
     * returns the name (id) of this plugin
     */
    public function getName() {
        if (!isset($this->__name)) {
            $reflector = new ReflectionClass(get_class($this));
            $name = substr($reflector->name, 18); // 18 = strlen('DatawrapperPlugin_')
            $this->__name = strtolower(preg_replace('/([a-zA-Z])(?=[A-Z])/', '$1-', $name));
        }
        return $this->__name;
    }

    /*
     * returns the plugin specific configuration (from config.yaml)
     */
    public function getConfig() {
        if (isset($GLOBALS['dw_config']['plugins'][$this->getName()])) {
            $cfg = $GLOBALS['dw_config']['plugins'][$this->getName()];
        } else {
            $cfg = array();
        }
        // apply organization-specific custom configuration
        $org = DatawrapperSession::getUser()->getCurrentOrganization();
        if (!empty($org)) {
            $pd = PluginDataQuery::create()
                ->filterByPlugin($this->getPluginOM())
                ->where('PluginData.Key LIKE ?', 'custom_config/'.$org->getId().'/%')
                ->find();
            foreach ($pd as $c) {
                $k = explode('/', $c->getKey());
                $k = explode('.', $k[2]);
                if (count($k) == 1) $cfg[$k[0]] = $c->getData();
                else if (count($k) == 2) $cfg[$k[0]][$k[1]] = $c->getData();
                else if (count($k) == 3) $cfg[$k[0]][$k[1]][$k[2]] = $c->getData();
                else if (count($k) == 4) $cfg[$k[0]][$k[1]][$k[2]][$k[3]] = $c->getData();
            }
        }
        return $cfg;
    }

    /*
     * returns a list of PHP files that needs to be included
     */
    public function getRequiredLibraries() {
        return array();
    }

    /**
     * allows the plugin to persistently store arbitrary data
     *
     * @param key     string           a key
     * @param data    json_seriazable  the data thats being stored. must be json serializable
     * @param single  boolean          if set, any existing value with the same key will be overwritten
     */
    public function storeData($key, $data, $single = true) {
        if ($single) {
            // remove any existing value
            PluginDataQuery::create()
              ->filterByPlugin($this->getPluginOM())
              ->filterByKey($key)
              ->delete();
        }
        $pd = new PluginData();
        $pd->setPlugin($this->getPluginOM());
        $pd->setKey($key);
        $pd->setData($data);
        $pd->setStoredAt(time());
        $pd->save();
    }

    /**
     * Read data from persistant plugin data store
     *
     * @param key   string   the key
     * @param single  boolean   if set true readData will only return the last inserted first row
     */
    public function readData($key, $single=true) {
        $q = PluginDataQuery::create()
            ->filterByPlugin($this->getPluginOM())
            ->filterByKey($key)
            ->orderByStoredAt('desc')
            ->find();
        if (count($q) == 0) return null;
        if (!$single) {
            $res = array();
            foreach ($q as $pd) {
                $res[] = $pd->getData();
            }
        } else $res = $q[0]->getData();
        return $res;
    }

    /**
     * Remove data from persistant plugin data store
     *
     * @param key   string   the key
     * @param data  json_seriazable   if set only matching items will be removed
     */
    public function deleteData($key, $data = null) {
        $q = PluginDataQuery::create()
          ->filterByPlugin($this->getPluginOM())
          ->filterByKey($key);
        if ($data !== null) {
            $q->filterByData(json_encode($data));
        }
        $q->delete();
    }

    /*
     * deprecated, use registerAssets instead
     */
    public function declareAssets($assets, $regex = null) {
        return $this->registerAssets($assets, $regex);
    }

    /*
     * convenience wrapper around DatawrapperHOOK::GET_PLUGIN_ASSETS
     */
    public function registerAssets($assets, $regex = null) {
        $plugin = $this;
        if (is_string($assets)) $assets = array($assets);
        DatawrapperHooks::register(DatawrapperHooks::GET_PLUGIN_ASSETS, function($uri) use ($assets, $regex, $plugin) {
            if (empty($regex) || preg_match($regex, $uri)) {
                $plugin_assets = array();
                foreach ($assets as $file) {
                    $plugin_assets[] = array($plugin->getName() . '/' . $file, $plugin);
                }
                return $plugin_assets;
            }
            return array();
        });
    }

    public function addHeaderNav($after = 'mycharts', $link) {
        DatawrapperHooks::register(DatawrapperHooks::HEADER_NAV . $after,
            function() use ($link) { return $link; });
    }

    public function registerController($obj, $func=null) {
        DatawrapperHooks::register(
            DatawrapperHooks::GET_PLUGIN_CONTROLLER,
            is_callable($obj) ? $obj : array($obj, $func)
        );
    }

    public function registerAdminPage($obj, $func=null) {
        DatawrapperHooks::register(
            DatawrapperHooks::GET_ADMIN_PAGES,
            is_callable($obj) ? $obj : array($obj, $func)
        );
    }

    public function injectInitFunction($func) {
        $this->__initFunc = $func;
    }
}

