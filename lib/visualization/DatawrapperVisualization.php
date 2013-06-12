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
    public static function register($plugin, $meta) {
        return self::getInstance()->_register($plugin, $meta);
    }

    /*
     * returns a list of all visualization meta arrays
     */
    public static function all() { return self::getInstance()->_all(); }

    /*
     * returns one specific visualization meta array
     */
    public static function get($id) { return self::getInstance()->_get($id); }

    //
    // non-static definitions below
    //

    private $visualizations = array();

    public function _register($plugin, $meta) {
        // we save the path to the static files of the visualization
        $meta['__static_path'] =  '/static/plugins/' . $plugin->getName() . '/';
        $this->visualizations[$meta['id']] = $meta;
    }

    private function _all() {
        $res = array_values($this->visualizations);
        // sort by something
        usort($res, function ($a, $b) {
            if (!isset($a['order'])) $a['order'] = 99999;
            if (!isset($b['order'])) $b['order'] = 99999;
            return $a['order'] - $b['order'];
        });
        return $res;
    }

    private function _get($id) {
        if (!isset($this->visualizations[$id])) return false;
        $meta = $this->visualizations[$id];
        $meta['hasCSS'] = file_exists(ROOT_PATH . 'www' . $meta['__static_path'] . $id. '.css');
        return $meta;
    }
}


