<?php

class DatawrapperPlugin_ThemeDefault extends DatawrapperPlugin {

    public function init() {
        DatawrapperTheme::register($this, $this->getMeta());

        DatawrapperTheme::register($this, array(
            'id' => 'default-nodata',
            'extends' => 'default',
            'title' => __('Datawrapper (no data)')
        ));
    }

    private function getMeta() {
        return array(
            'id' => 'default',
            'title' => __('Datawrapper'),
            'version' => '1.5.2'
        );
    }

}
