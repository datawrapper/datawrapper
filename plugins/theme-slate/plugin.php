<?php

class DatawrapperPlugin_ThemeSlate extends DatawrapperPlugin {

    public function init() {
        DatawrapperTheme::register($this, $this->getMeta());
    }

    private function getMeta() {
        return array (
          'id' => 'slate',
          'title' => 'Noir',
          'link' => 'http://bootswatch.com/slate/',
          'restricted' => NULL,
          'version' => '1.5.0',
        );
    }

}
