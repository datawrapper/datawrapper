<?php

class DatawrapperVisualization {

    private static $instance;

    public static function getInstance() {
        if (!isset(self::$instance)) self::$instance = new DatawrapperVisualization();
        return self::$instance;
    }

    /*
     * registers a new visualization, should be called by plugins
     */
    public static function register($meta) { return self::getInstance()->_register($meta); }

    /*
     * returns a list of all visualization meta arrays
     */
    public static function all() { return self::getInstance()->_all(); }

    /*
     * returns one specific visualization meta array
     */
    public static function get($id) { return self::getInstance()->_get($id); }


    // non-static definitions below

    private $visualizations = array();

    public function _register($meta) {
        $this->visualizations[$meta['id']] = $meta;
    }

    public function _all() {
        $res = array_values($this->visualizations);
        // sort by something
        usort($res, function ($a, $b) {
            if (!isset($a['order'])) $a['order'] = 99999;
            if (!isset($b['order'])) $b['order'] = 99999;
            return $a['order'] - $b['order'];
        });
        print 'all = '.count($res);
        return $res;
    }

    public function _get($id) {
        if (!isset($this->visualizations[$id])) return false;
        $meta = $this->visualizations[$id];
        $meta['hasCSS'] = file_exists(ROOT_PATH . 'www/static/visualizations/' . $id . '/style.css');
        return $meta;
    }
}


