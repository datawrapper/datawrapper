<?php

class DatawrapperPlugin_ThemeAutumn extends DatawrapperPlugin {

    public function init() {
        DatawrapperTheme::register($this, $this->getMeta());
    }

    private function getMeta() {
        return array (
          'id' => 'autumn',
          'title' => 'Playfair',
          'link' => 'http://www.datawrapper.de',
          'extends' => 'default',
          'restricted' => NULL,
          'version' => '1.5.0',
          'option-filter' => 
          array (
            'line-chart' => 
            array (
              'show-grid' => true,
            ),
          ),
        );
    }

}
