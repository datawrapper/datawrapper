<?php

class DatawrapperPlugin_Visualization extends DatawrapperPlugin {

    public function init() {
        $meta = $this->getMeta();
        if (!empty($meta)) DatawrapperVisualization::register($meta);
    }

    public function getStaticFiles() {
        return array(
            'thumb.png'
        );
    }

    public function getMeta() {
        return array();
    }

}