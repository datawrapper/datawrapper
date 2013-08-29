<?php

class DatawrapperPlugin_ThemeDefault extends DatawrapperPlugin {

    public function init() {
        DatawrapperTheme::register($this, $this->getMeta());
    }

    private function getMeta() {
        return array(
            'id' => 'default',
            'title' => 'Datawrapper',
            'version' => '1.5.2'
        );
    }

}