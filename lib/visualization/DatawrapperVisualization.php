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
    public static function register($plugin, $meta, $asset_callback = null) {
        return self::getInstance()->_register($plugin, $meta, $asset_callback);
    }

    /*
     * returns a list of all visualization meta arrays
     */
    public static function all($sort = 'order') { return self::getInstance()->_all($sort); }

    /*
     * returns one specific visualization meta array
     */
    public static function get($id) { return self::getInstance()->_get($id); }

    /*
     * returns a list of dynamic assets needed by a visualization
     * to render a specific chart
     */
    public static function assets($vis_id, $chart) { return self::getInstance()->_assets($vis_id, $chart); }

    //
    // non-static definitions below
    //

    private $visualizations = array();
    private $vis_asset_callbacks = array();

    public function _register($plugin, $meta, $asset_callback = null) {
        // we save the path to the static files of the visualization
        $meta['__static_path'] =  '/static/plugins/' . $plugin->getName() . '/';
        $meta['version'] = $plugin->getVersion();
        $icon = $meta['__static_path'] . '/' . $meta['id'];
        if (file_exists(ROOT_PATH . 'www/' . $icon . '.svg')) {
            $meta['icon'] = file_get_contents(ROOT_PATH . 'www/' . $icon . '.svg');
        } else {
            $meta['icon'] = '<img src="'. $icon . '.png" />';
        }
        $this->visualizations[$meta['id']] = $meta;
        if ($asset_callback) {
            $this->vis_asset_callbacks[$meta['id']] = $asset_callback;
        }
    }

    public function _assets($vis_id, $chart) {
        if (isset($this->vis_asset_callbacks[$vis_id])) {
            return call_user_func_array($this->vis_asset_callbacks[$vis_id], array($chart));
        }
        return array();
    }

    private function _all($sort = 'order') {
        $res = array_values($this->visualizations);
        if ($sort == 'order') {
            // sort by something
            usort($res, function ($a, $b) {
                if (!isset($a['order'])) $a['order'] = 99999;
                if (!isset($b['order'])) $b['order'] = 99999;
                return $a['order'] - $b['order'];
            });
        } else if ($sort == 'dependencies') {
            // sorting visualizations so that dependencies are coming fists
            $mysort = function ($a, $b) {
                if (isset($a['extends']) && $a['extends'] == $b['id']) {
                    return 1;
                }
                if (isset($b['extends']) && $b['extends'] == $a['id']) {
                    return -1;
                }
                return 0;
            };
            //TODO: we should probably use a dependency tree instead of this sort hack
            usort($res, $mysort);
            usort($res, $mysort);
            usort($res, $mysort);
            usort($res, $mysort);

            // build plugin dependency tree
            $data = array();
            $index = array();
            $roots = array();
            foreach ($res as $vis) {
                $data[$vis['id']] = $vis;
                if (!empty($vis['extends'])) {
                    $index[$vis['extends']][] = $vis['id'];
                } else {
                    $roots[] = $vis['id'];
                }
            }
            // sort visualizations by dep tree
            $res = array();
            function add_vis(&$res, $data, $index, $parent_id, $level) {
                $parent_id = $parent_id === NULL ? "NULL" : $parent_id;
                // load this plugin
                $vis = $data[$parent_id];
                // require plugin class
                $res[] = $vis;

                if (isset($index[$parent_id])) {
                    foreach ($index[$parent_id] as $id) {
                        add_vis($res, $data, $index, $id, $level + 1);
                    }
                }
            }
            foreach ($roots as $id) add_vis($res, $data, $index, $id, 0);
        }
        return $res;
    }

    private function _get($id) {
        if (!isset($this->visualizations[$id])) return false;
        $meta = $this->visualizations[$id];
        $meta['hasCSS'] = file_exists(ROOT_PATH . 'www' . $meta['__static_path'] . $id. '.css');
        return $meta;
    }
}


