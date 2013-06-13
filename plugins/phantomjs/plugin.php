<?php

class DatawrapperPlugin_Phantomjs extends DatawrapperPlugin {

    public function init() {
        DatawrapperHooks::register('phantomjs_exec', array($this, 'executeScript'));
    }

    public function executeScript() {
        $args = func_get_args();
        return $this->exec(implode(' ', $args));
    }

    private function exec($cmd, &$error=null) {
        $cfg = $this->getConfig();
        ob_start();  // grab output
        passthru($cfg['path'] . ' ' . $cmd, $error);
        $output = ob_get_contents();
        ob_end_clean();
        return $output;
    }
}