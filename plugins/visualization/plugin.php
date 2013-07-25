<?php

class DatawrapperPlugin_Visualization extends DatawrapperPlugin {

    public function init() {
        $meta = $this->getMeta();
        if (!empty($meta)) DatawrapperVisualization::register($this, $meta);
    }

    public function getMeta() {
        return array();
    }

}