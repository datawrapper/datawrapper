<?php

class DatawrapperTheme {

    private static $instance;

    public static function getInstance() {
        if (!isset(self::$instance)) self::$instance = new DatawrapperTheme();
        return self::$instance;
    }

    /*
     * registers a new visualization, should be called by plugins
     */
    public static function register($plugin, $meta) {
        return self::getInstance()->_register($plugin, $meta);
    }

    /*
     * returns a list of all visualization meta arrays
     */
    public static function all($ignoreRestrictions = false) { return self::getInstance()->_all($ignoreRestrictions); }

    /*
     * returns one specific visualization meta array
     */
    public static function get($id) { return self::getInstance()->_get($id); }

    //
    // non-static definitions below
    //

    private $themes = array();

    public function _register($plugin, $meta) {
        // we save the path to the static files of the visualization
        $meta['__static_path'] =  '/static/plugins/' . $plugin->getName() . '/';
        $meta['__template_path'] =  '/plugins/' . $plugin->getName() . '/';
        $meta['version'] = $plugin->getVersion();
        $this->themes[$meta['id']] = $meta;
    }

    private function _all($ignoreRestrictions) {
        $res = array_values($this->themes);
        $user = DatawrapperSession::getInstance()->getUser();
        $email = $user->getEmail();
        $domain = substr($email, strpos($email, '@'));

        $res = array();

        foreach ($this->themes as $meta) {
            if (!isset($meta['restrict'])  // no restriction at all
                 || $meta['restrict'] == $domain  // check for email domain
                 || $meta['restrict'] == $email  // check for entire email address
                 || $ignoreRestrictions === true // we want to test *all* layouts
                 || $user->isAdmin())  // of course, admins can see all, too
                $res[] = $meta;
        }

        return $res;
    }

    private function _get($id) {
        if (!isset($this->themes[$id])) return false;
        $meta = $this->themes[$id];
        $tpl_file = $meta['__template_path'] . $meta['id'] . '.twig';
        $parent = false;

        if (isset($meta['extends'])) {
            $parent = $this->themes[$meta['extends']];
            $parent_tpl_file = $parent['__template_path'] . $parent['id'] . '.twig';
        } else {
            $meta['extends'] = false;
        }

        if (file_exists(ROOT_PATH . 'templates/' . $tpl_file)) {
            $meta['template'] = $tpl_file;
        } else if ($parent && file_exists(ROOT_PATH . 'templates/' . $parent_tpl_file)) {
            $meta['template'] = $parent_tpl_file;
        }
        $meta['hasStyles'] = file_exists(ROOT_PATH . 'www/' . $meta['__static_path'] . $id . '.css');
        return $meta;
    }
}


